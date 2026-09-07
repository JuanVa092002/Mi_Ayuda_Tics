import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../core/app'
import models from '../../core/models'
import { tokenSign } from '../../shared/utils/handleJwt'
import solicitudModel from '../../features/tickets/models/solicitud'
import historialSolicitudModel from '../../features/tickets/models/historialSolicitud'
import ambienteModel from '../../features/shared/models/ambienteFormacion'
import tipoCasoModel from '../../features/tickets/models/tipoCaso'
import {
  assertConnectedLocalSimulation,
  assertLocalSimulationMongoUri,
} from '../../shared/config/simulation-db-guard'
import { migrateUniqHistorialOperationId } from '../../features/tickets/indexes/historial-operation-id-ops'

const uri = process.env.DB_URI
const { usuarioModel } = models

describe('workflow v2 HTTP (real Mongo simulation)', () => {
  const stamp = `e2e-wf2-${Date.now()}`
  let funcionario: { _id: mongoose.Types.ObjectId; rol: string; nombre: string }
  let leader: { _id: mongoose.Types.ObjectId; rol: string }
  let technician: { _id: mongoose.Types.ObjectId; rol: string; nombre: string }
  let otherTech: { _id: mongoose.Types.ObjectId; rol: string; nombre: string }
  let ambienteId: mongoose.Types.ObjectId
  let tipoId: mongoose.Types.ObjectId
  let ticketId: string

  beforeAll(async () => {
    assertLocalSimulationMongoUri(uri)
    await mongoose.connect(uri!)
    assertConnectedLocalSimulation({
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    })
    await migrateUniqHistorialOperationId()

    const ambiente = await ambienteModel.create({ nombre: `${stamp}-amb`, activo: true })
    const tipoCaso = await tipoCasoModel.create({
      nombre: `${stamp}-tipo`,
      descripcion: 'Tipo workflow v2',
    })
    ambienteId = ambiente._id
    tipoId = tipoCaso._id

    funcionario = await usuarioModel.create({
      nombre: 'WF2 Funcionario',
      correo: `${stamp}-fun@miayudatics.test`,
      password: 'Password1a',
      rol: 'funcionario',
      telefono: '3001111111',
      activo: true,
      estado: true,
    })
    technician = await usuarioModel.create({
      nombre: 'WF2 Técnico A',
      correo: `${stamp}-tech@miayudatics.test`,
      password: 'Password1a',
      rol: 'tecnico',
      telefono: '3003333333',
      activo: true,
      estado: true,
    })
    otherTech = await usuarioModel.create({
      nombre: 'WF2 Técnico B',
      correo: `${stamp}-techb@miayudatics.test`,
      password: 'Password1a',
      rol: 'tecnico',
      telefono: '3003333334',
      activo: true,
      estado: true,
    })
    await usuarioModel.updateMany(
      { _id: { $in: [technician._id, otherTech._id] } },
      { $set: { estado: true, activo: true } },
    )
    leader = await usuarioModel.create({
      nombre: 'WF2 Líder',
      correo: `${stamp}-lider@miayudatics.test`,
      password: 'Password1a',
      rol: 'lider',
      telefono: '3004444444',
      activo: true,
      estado: true,
    })
  }, 60000)

  afterAll(async () => {
    await historialSolicitudModel.deleteMany({
      solicitud: { $in: await solicitudModel.find({ codigoCaso: new RegExp(`^${stamp}`) }).distinct('_id') },
    })
    await solicitudModel.deleteMany({ codigoCaso: new RegExp(`^${stamp}`) })
    await usuarioModel.deleteMany({ correo: new RegExp(`^${stamp}`) })
    await ambienteModel.deleteMany({ nombre: `${stamp}-amb` })
    await tipoCasoModel.deleteMany({ nombre: `${stamp}-tipo` })
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })

  it('ciclo v2, listado sin historial, reasignación e idempotencia', async () => {
    const funToken = await tokenSign(funcionario)
    const liderToken = await tokenSign(leader)
    const techToken = await tokenSign(technician)
    const otherToken = await tokenSign(otherTech)

    const created = await solicitudModel.create({
      usuario: funcionario._id,
      ambiente: ambienteId,
      tipoCaso: tipoId,
      descripcion: `${stamp} ticket v2`,
      telefono: '3001111111',
      codigoCaso: `${stamp}-001`,
      estado: 'nuevo',
      workflowVersion: 2,
    })
    ticketId = String(created._id)

    const inbox = await request(app)
      .get('/api/solicitud/pendientes')
      .set('Authorization', `Bearer ${liderToken}`)
    expect(inbox.status).toBe(200)
    const inboxRow = (inbox.body.data as Array<Record<string, unknown>>).find(
      (row) => row.codigoCaso === `${stamp}-001`,
    )
    expect(inboxRow).toBeTruthy()
    expect(inboxRow).not.toHaveProperty('historial')

    const unassignedTech = await request(app)
      .get('/api/solicitud/asignadas')
      .set('Authorization', `Bearer ${techToken}`)
    expect(
      (unassignedTech.body.solicitudesAsignadas as Array<{ codigoCaso: string }>).some(
        (row) => row.codigoCaso === `${stamp}-001`,
      ),
    ).toBe(false)

    const assign = await request(app)
      .put(`/api/solicitud/${ticketId}/asignarTecnico`)
      .set('Authorization', `Bearer ${liderToken}`)
      .set('Idempotency-Key', `${stamp}-assign`)
      .send({ tecnico: String(technician._id) })
    expect(assign.status).toBe(200)
    expect(assign.body.solicitud.estado).toBe('asignado')

    const start = await request(app)
      .post(`/api/solicitud/${ticketId}/iniciarAtencion`)
      .set('Authorization', `Bearer ${techToken}`)
      .set('Idempotency-Key', `${stamp}-start`)
    expect(start.status).toBe(200)
    expect(start.body.solicitud.estado).toBe('en_progreso')

    const startDup = await request(app)
      .post(`/api/solicitud/${ticketId}/iniciarAtencion`)
      .set('Authorization', `Bearer ${techToken}`)
      .set('Idempotency-Key', `${stamp}-start`)
    expect(startDup.status).toBe(200)

    const forbiddenReassign = await request(app)
      .put(`/api/solicitud/${ticketId}/reasignarTecnico`)
      .set('Authorization', `Bearer ${techToken}`)
      .send({ tecnico: String(otherTech._id), motivo: 'Intento técnico' })
    expect(forbiddenReassign.status).toBe(403)

    const reassign = await request(app)
      .put(`/api/solicitud/${ticketId}/reasignarTecnico`)
      .set('Authorization', `Bearer ${liderToken}`)
      .set('Idempotency-Key', `${stamp}-reassign`)
      .send({ tecnico: String(otherTech._id), motivo: 'Cobertura del turno' })
    expect(reassign.status).toBe(200)
    expect(reassign.body.solicitud.estado).toBe('asignado')

    const startB = await request(app)
      .post(`/api/solicitud/${ticketId}/iniciarAtencion`)
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Idempotency-Key', `${stamp}-start-b`)
    expect(startB.status).toBe(200)

    const list = await request(app)
      .get('/api/solicitud/asignadas')
      .set('Authorization', `Bearer ${otherToken}`)
    expect(list.status).toBe(200)
    const listRow = (list.body.solicitudesAsignadas as Array<Record<string, unknown>>).find(
      (row) => row.codigoCaso === `${stamp}-001`,
    )
    expect(listRow).toBeTruthy()
    expect(listRow).not.toHaveProperty('historial')
    expect(listRow?.queue).toBe('en_atencion')

    const partial = await request(app)
      .post(`/api/solicitud/${ticketId}/solucionParcial`)
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Idempotency-Key', `${stamp}-partial`)
      .send({
        queSeHizo: 'Reinicio del access point',
        queFalta: 'Validar cobertura',
        siguienteAccion: 'Medir señal en aula',
      })
    expect(partial.status).toBe(200)
    expect(partial.body.solicitud.estado).toBe('en_progreso')

    const total = await request(app)
      .post(`/api/solicitud/${ticketId}/solucionTotal`)
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Idempotency-Key', `${stamp}-total`)
      .send({ queSeHizo: 'Se reemplazó el access point' })
    expect(total.status).toBe(200)
    expect(total.body.solicitud.estado).toBe('resuelto')

    const listResolved = await request(app)
      .get('/api/solicitud/asignadas')
      .set('Authorization', `Bearer ${otherToken}`)
    const resolvedRow = (listResolved.body.solicitudesAsignadas as Array<Record<string, unknown>>).find(
      (row) => row.codigoCaso === `${stamp}-001`,
    )
    expect(resolvedRow?.queue).toBe('esperando_confirmacion')
    expect(resolvedRow).not.toHaveProperty('historial')

    const confirm = await request(app)
      .post(`/api/solicitud/${ticketId}/confirmarSolucion`)
      .set('Authorization', `Bearer ${funToken}`)
      .set('Idempotency-Key', `${stamp}-confirm`)
    expect(confirm.status).toBe(200)
    expect(confirm.body.solicitud.estado).toBe('cerrado')

    const events = await historialSolicitudModel.find({ solicitud: created._id }).sort({ createdAt: 1 })
    const reassigned = events.filter((event) => event.type === 'reassigned')
    expect(reassigned).toHaveLength(1)
    expect(reassigned[0]?.message).toContain('WF2 Técnico B')
    expect(reassigned[0]?.message).toContain('Cobertura del turno')
    expect(events.filter((event) => event.type === 'started').length).toBeGreaterThanOrEqual(1)
    expect(events.filter((event) => event.operationId === `${stamp}-start`)).toHaveLength(1)
  }, 60000)

  it('mutación v2 sin Idempotency-Key responde 400 y no crea evento', async () => {
    const techToken = await tokenSign(technician)
    const ticket = await solicitudModel.create({
      usuario: funcionario._id,
      ambiente: ambienteId,
      tipoCaso: tipoId,
      descripcion: `${stamp} missing key`,
      telefono: '3001111111',
      codigoCaso: `${stamp}-002`,
      estado: 'asignado',
      workflowVersion: 2,
      tecnico: technician._id,
    })
    const before = await historialSolicitudModel.countDocuments({ solicitud: ticket._id })
    const response = await request(app)
      .post(`/api/solicitud/${String(ticket._id)}/iniciarAtencion`)
      .set('Authorization', `Bearer ${techToken}`)
    expect(response.status).toBe(400)
    expect(response.body.code).toBe('IDEMPOTENCY_KEY_REQUIRED')
    const after = await historialSolicitudModel.countDocuments({ solicitud: ticket._id })
    expect(after).toBe(before)
    const unchanged = await solicitudModel.findById(ticket._id)
    expect(unchanged?.estado).toBe('asignado')
  })
})
