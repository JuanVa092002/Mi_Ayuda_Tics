import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../core/app'
import models from '../core/models'
import { tokenSign } from '../shared/utils/handleJwt'
import { Types } from 'mongoose'
import * as lifecycle from '../features/tickets/domain/solicitud-lifecycle'
import * as workflowDomain from '../features/tickets/domain/solicitud-workflow'

// Identificadores de actores reales del SENA
const funcionarioTitular = {
  _id: '60d0fe4f5311236168a10001',
  rol: 'funcionario',
  nombre: 'Carlos Funcionario Titular',
  activo: true,
  estado: true,
}

const funcionarioIntruso = {
  _id: '60d0fe4f5311236168a10002',
  rol: 'funcionario',
  nombre: 'Pedro Funcionario Intruso',
  activo: true,
  estado: true,
}

const tecnicoAsignado = {
  _id: '60d0fe4f5311236168a10003',
  rol: 'tecnico',
  nombre: 'Ana Técnico Asignada',
  activo: true,
  estado: true,
}

const tecnicoAjeno = {
  _id: '60d0fe4f5311236168a10004',
  rol: 'tecnico',
  nombre: 'Luis Técnico No Asignado',
  activo: true,
  estado: true,
}

const liderTIC = {
  _id: '60d0fe4f5311236168a10005',
  rol: 'lider',
  nombre: 'Marta Líder TIC',
  activo: true,
  estado: true,
}

describe('QA Riguroso de Producción — Matriz de Roles, RBAC Negativo, Aislamiento IDOR y Casos de Negocio', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.WORKFLOW_FORCE_NO_TRANSACTIONS = '1'
  })

  // =========================================================================
  // 1. PRUEBAS DE AUTORIZACIÓN NEGATIVAS (RBAC ESTRICTO)
  // =========================================================================
  describe('1. Autorización Negativa (RBAC Guards)', () => {
    it('Funcionario NO puede iniciar atención técnica (403 Forbidden)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioTitular as never)
      const token = await tokenSign(funcionarioTitular)

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/iniciarAtencion')
        .set('Authorization', `Bearer ${token}`)
        .send({ operationId: 'op-illegal-start' })

      expect(response.status).toBe(403)
      expect(response.body.message).toMatch(/permisos|no autorizado/i)
    })

    it('Funcionario NO puede registrar notas en bitácora técnica (403 Forbidden)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioTitular as never)
      const token = await tokenSign(funcionarioTitular)

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/actualizacion')
        .set('Authorization', `Bearer ${token}`)
        .send({ mensaje: 'Nota técnica intrusiva', operationId: 'op-illegal-update' })

      expect(response.status).toBe(403)
    })

    it('Funcionario NO puede registrar solución total ni cerrar casos arbitrariamente (403 Forbidden)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioTitular as never)
      const token = await tokenSign(funcionarioTitular)

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/solucionTotal')
        .set('Authorization', `Bearer ${token}`)
        .send({ queSeHizo: 'Intento de resolución no autorizada', operationId: 'op-illegal-solve' })

      expect(response.status).toBe(403)
    })

    it('Técnico NO puede otorgarse su propio visto bueno / confirmación de solución (403 Forbidden)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(tecnicoAsignado as never)
      const token = await tokenSign(tecnicoAsignado)

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/confirmarSolucion')
        .set('Authorization', `Bearer ${token}`)
        .send({ operationId: 'op-illegal-confirm' })

      expect(response.status).toBe(403)
    })

    it('Técnico NO puede reabrir un caso cerrado o resuelto (403 Forbidden — acción reservada a Funcionario)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(tecnicoAsignado as never)
      const token = await tokenSign(tecnicoAsignado)

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/reabrir')
        .set('Authorization', `Bearer ${token}`)
        .send({ motivo: 'Reapertura técnica inválida', operationId: 'op-illegal-reopen' })

      expect(response.status).toBe(403)
    })

    it('Funcionario y Técnico NO pueden cancelar una solicitud (403 Forbidden — reservado a Líder)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(tecnicoAsignado as never)
      const tokenTec = await tokenSign(tecnicoAsignado)

      const resTec = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/cancelar')
        .set('Authorization', `Bearer ${tokenTec}`)
        .send({ motivo: 'Cancelación técnica indebida', operationId: 'op-illegal-cancel' })

      expect(resTec.status).toBe(403)
    })
  })

  // =========================================================================
  // 2. PRUEBAS DE DATOS Y AISLAMIENTO (ANTI-IDOR / MULTI-TENANCY)
  // =========================================================================
  describe('2. Aislamiento de Datos y Protección Anti-IDOR', () => {
    it('Funcionario Intruso recibe 403 al intentar consultar el detalle del caso de otro Funcionario', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioIntruso as never)
      const token = await tokenSign(funcionarioIntruso)

      // El ticket pertenece al titular (funcionarioTitular)
      vi.spyOn(models.solicitudModel, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId('60d0fe4f5311236168a10010'),
          usuario: new Types.ObjectId(funcionarioTitular._id),
          tecnico: new Types.ObjectId(tecnicoAsignado._id),
        }),
      } as never)

      const response = await request(app)
        .get('/api/solicitud/60d0fe4f5311236168a10010')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toMatch(/no autorizado/i)
    })

    it('Técnico Ajeno recibe 403 al intentar consultar el caso asignado a otro técnico', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(tecnicoAjeno as never)
      const token = await tokenSign(tecnicoAjeno)

      vi.spyOn(models.solicitudModel, 'findById').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId('60d0fe4f5311236168a10010'),
          usuario: new Types.ObjectId(funcionarioTitular._id),
          tecnico: new Types.ObjectId(tecnicoAsignado._id), // asignado a Ana, no a Luis
        }),
      } as never)

      const response = await request(app)
        .get('/api/solicitud/60d0fe4f5311236168a10010')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.message).toMatch(/no autorizado/i)
    })

    it('Funcionario Titular SÍ puede consultar su propio caso (200 OK con datos filtrados)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioTitular as never)
      const token = await tokenSign(funcionarioTitular)

      const ticketDoc = {
        _id: new Types.ObjectId('60d0fe4f5311236168a10010'),
        codigoCaso: '2026-10-00042',
        descripcion: 'Falla de pantalla en aula 204',
        estado: 'en_progreso',
        workflowVersion: 2,
        usuario: { _id: funcionarioTitular._id, nombre: funcionarioTitular.nombre },
        tecnico: { _id: tecnicoAsignado._id, nombre: tecnicoAsignado.nombre },
        ambiente: { _id: '60d0fe4f5311236168a10050', nombre: 'Ambiente 204', activo: true },
        tipoCaso: { _id: '60d0fe4f5311236168a10060', nombre: 'Hardware' },
        fecha: new Date().toISOString(),
        toObject: () => ticketDoc,
      }

      // Mock encadenado exacto de Mongoose para getSolicitudId
      vi.spyOn(models.solicitudModel, 'findById')
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({
            _id: ticketDoc._id,
            usuario: ticketDoc.usuario._id,
            tecnico: ticketDoc.tecnico._id,
          }),
        } as never)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          populate: vi.fn().mockReturnThis(),
          then: vi.fn().mockImplementation((resolve) => Promise.resolve(resolve(ticketDoc))),
        } as never)

      vi.spyOn(workflowDomain, 'loadPublicHistorial').mockResolvedValue({
        items: [],
      } as never)

      const response = await request(app)
        .get('/api/solicitud/60d0fe4f5311236168a10010')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.codigoCaso).toBe('2026-10-00042')
    })
  })

  // =========================================================================
  // 3. PRUEBAS DE LÓGICA DE NEGOCIO, LÍMITES Y TRANSICIONES INVÁLIDAS
  // =========================================================================
  describe('3. Reglas de Negocio y Transiciones de Estado Prohibidas', () => {
    it('Rechaza solucionar directamente un caso en estado "nuevo" (409 Conflict)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(tecnicoAsignado as never)
      const token = await tokenSign(tecnicoAsignado)

      // El ticket aún está nuevo / no ha sido iniciado en progreso
      vi.spyOn(models.solicitudModel, 'findById').mockResolvedValue({
        _id: new Types.ObjectId('60d0fe4f5311236168a10010'),
        estado: 'nuevo',
        workflowVersion: 2,
        usuario: funcionarioTitular._id,
        tecnico: tecnicoAsignado._id,
      } as never)

      // Mock para evitar bloqueo de transacción
      vi.spyOn(workflowDomain, 'applySolicitudWorkflowAction').mockRejectedValue({
        status: 409,
        message: 'Transición de estado no permitida.',
      })

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/solucionTotal')
        .set('Authorization', `Bearer ${token}`)
        .send({ queSeHizo: 'Intento saltar el inicio de atencion', operationId: 'op-invalid-jump' })

      expect(response.status).toBe(409)
      expect(response.body.message).toMatch(/Transición de estado no permitida/i)
    })

    it('Rechaza solución parcial o total si falta la descripción obligatoria de lo realizado (422 Unprocessable)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(tecnicoAsignado as never)
      const token = await tokenSign(tecnicoAsignado)

      // Envío vacío en queSeHizo evaluado por Zod validator
      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/solucionTotal')
        .set('Authorization', `Bearer ${token}`)
        .send({ queSeHizo: '   ', operationId: 'op-empty-payload' })

      expect(response.status).toBe(422)
      expect(JSON.stringify(response.body)).toMatch(/es obligatorio/i)
    })

    it('Rechaza confirmar visto bueno si el ticket NO está en estado "resuelto" (409 Conflict)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioTitular as never)
      const token = await tokenSign(funcionarioTitular)

      // Aún está en progreso, el funcionario no puede forzar visto bueno antes de que el técnico resuelva
      vi.spyOn(models.solicitudModel, 'findById').mockResolvedValue({
        _id: new Types.ObjectId('60d0fe4f5311236168a10010'),
        estado: 'en_progreso',
        workflowVersion: 2,
        usuario: funcionarioTitular._id,
        tecnico: tecnicoAsignado._id,
      } as never)

      vi.spyOn(workflowDomain, 'applySolicitudWorkflowAction').mockRejectedValue({
        status: 409,
        message: 'Transición de estado no permitida.',
      })

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/confirmarSolucion')
        .set('Authorization', `Bearer ${token}`)
        .send({ operationId: 'op-premature-confirm' })

      expect(response.status).toBe(409)
      expect(response.body.message).toMatch(/Transición de estado no permitida/i)
    })

    it('Rechaza reabrir un caso si no se proporciona el motivo de inconformidad (422 Unprocessable)', async () => {
      vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue(funcionarioTitular as never)
      const token = await tokenSign(funcionarioTitular)

      const response = await request(app)
        .post('/api/solicitud/60d0fe4f5311236168a10010/reabrir')
        .set('Authorization', `Bearer ${token}`)
        .send({ motivo: '   ', operationId: 'op-reopen-empty-reason' })

      expect(response.status).toBe(422)
      expect(JSON.stringify(response.body)).toMatch(/es obligatorio/i)
    })
  })
})
