import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../core/app'
import models from '../../core/models'
import { tokenSign } from '../../shared/utils/handleJwt'
import solicitudModel from '../../features/tickets/models/solicitud'
import ambienteModel from '../../features/shared/models/ambienteFormacion'
import tipoCasoModel from '../../features/tickets/models/tipoCaso'
import {
  assertConnectedLocalSimulation,
  assertLocalSimulationMongoUri,
} from '../../shared/config/simulation-db-guard'

const uri = process.env.DB_URI

const { usuarioModel } = models

describe('funcionario solicitud HTTP contract (real Mongo)', () => {
  let owner: { _id: mongoose.Types.ObjectId; rol: string }
  let other: { _id: mongoose.Types.ObjectId; rol: string }
  let technician: { _id: mongoose.Types.ObjectId; rol: string }
  let leader: { _id: mongoose.Types.ObjectId; rol: string }
  let solicitudId: string
  const stamp = `e2e-contrato-${Date.now()}`

  beforeAll(async () => {
    assertLocalSimulationMongoUri(uri)
    await mongoose.connect(uri!)
    assertConnectedLocalSimulation({
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    })

    const ambiente = await ambienteModel.create({ nombre: `${stamp}-amb`, activo: true })
    const tipoCaso = await tipoCasoModel.create({
      nombre: `${stamp}-tipo`,
      descripcion: 'Tipo de prueba de contrato',
    })

    owner = await usuarioModel.create({
      nombre: 'Owner E2E',
      correo: `${stamp}-owner@miayudatics.test`,
      password: 'Password1a',
      rol: 'funcionario',
      telefono: '3001111111',
      activo: true,
      estado: true,
    })
    other = await usuarioModel.create({
      nombre: 'Other E2E',
      correo: `${stamp}-other@miayudatics.test`,
      password: 'Password1a',
      rol: 'funcionario',
      telefono: '3002222222',
      activo: true,
      estado: true,
    })
    technician = await usuarioModel.create({
      nombre: 'Tech E2E',
      correo: `${stamp}-tech@miayudatics.test`,
      password: 'Password1a',
      rol: 'tecnico',
      telefono: '3003333333',
      activo: true,
      estado: true,
    })
    await usuarioModel.updateOne(
      { _id: technician._id },
      { $set: { estado: true, activo: true } }
    )
    leader = await usuarioModel.create({
      nombre: 'Leader E2E',
      correo: `${stamp}-leader@miayudatics.test`,
      password: 'Password1a',
      rol: 'lider',
      telefono: '3004444444',
      activo: true,
      estado: true,
    })

    const older = await solicitudModel.create({
      usuario: owner._id,
      ambiente: ambiente._id,
      tipoCaso: tipoCaso._id,
      descripcion: `${stamp} antigua`,
      telefono: '3001111111',
      codigoCaso: `${stamp}-old`,
      estado: 'solicitado',
      fecha: new Date('2026-01-01T10:00:00.000Z'),
    })
    const newerSameSecond = await solicitudModel.create({
      usuario: owner._id,
      ambiente: ambiente._id,
      tipoCaso: tipoCaso._id,
      descripcion: `${stamp} reciente-b`,
      telefono: '3001111111',
      codigoCaso: `${stamp}-new-b`,
      estado: 'solicitado',
      fecha: new Date('2026-08-01T10:00:00.000Z'),
    })
    const newerFirst = await solicitudModel.create({
      usuario: owner._id,
      ambiente: ambiente._id,
      tipoCaso: tipoCaso._id,
      descripcion: `${stamp} reciente-a`,
      telefono: '3001111111',
      codigoCaso: `${stamp}-new-a`,
      estado: 'solicitado',
      fecha: new Date('2026-08-01T10:00:00.000Z'),
      tecnico: technician._id,
    })
    solicitudId = String(newerFirst._id)
    void older
    void newerSameSecond
  }, 60000)

  afterAll(async () => {
    await solicitudModel.deleteMany({ codigoCaso: new RegExp(`^${stamp}`) })
    await usuarioModel.deleteMany({ correo: new RegExp(`^${stamp}`) })
    await ambienteModel.deleteMany({ nombre: `${stamp}-amb` })
    await tipoCasoModel.deleteMany({ nombre: `${stamp}-tipo` })
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })

  it('sorts historial by fecha desc then _id desc', async () => {
    const token = await tokenSign(owner)
    const response = await request(app)
      .get('/api/solicitud/historial')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    const rows = response.body.solicitudesFinalizadas as Array<{ codigoCaso: string; fecha: string }>
    const mine = rows.filter((row) => row.codigoCaso?.startsWith(stamp))
    expect(mine.map((row) => row.codigoCaso)).toEqual([`${stamp}-new-a`, `${stamp}-new-b`, `${stamp}-old`])
  })

  it('returns telefono only for the funcionario owner', async () => {
    const ownerToken = await tokenSign(owner)
    const ownerRes = await request(app)
      .get(`/api/solicitud/${solicitudId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
    expect(ownerRes.status).toBe(200)
    expect(ownerRes.body.data.telefono).toBe('3001111111')
    expect(ownerRes.body.data.codigoCaso).toBe(`${stamp}-new-a`)
    expect(ownerRes.body.data.tipoCaso?.nombre).toBeTruthy()
    expect(ownerRes.body.data.ambiente?.nombre).toBeTruthy()
    expect(ownerRes.body.data.estado).toBe('solicitado')

    const otherToken = await tokenSign(other)
    const otherRes = await request(app)
      .get(`/api/solicitud/${solicitudId}`)
      .set('Authorization', `Bearer ${otherToken}`)
    expect(otherRes.status).toBe(403)

    const techToken = await tokenSign(technician)
    const techRes = await request(app)
      .get(`/api/solicitud/${solicitudId}`)
      .set('Authorization', `Bearer ${techToken}`)
    expect(techRes.status).toBe(200)
    expect(techRes.body.data).not.toHaveProperty('telefono')

    const leaderToken = await tokenSign(leader)
    const leaderRes = await request(app)
      .get(`/api/solicitud/${solicitudId}`)
      .set('Authorization', `Bearer ${leaderToken}`)
    expect(leaderRes.status).toBe(200)
    expect(leaderRes.body.data).not.toHaveProperty('telefono')
  })
})
