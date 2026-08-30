import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../core/app'
import models from '../../core/models'
import { encrypt } from '../../shared/utils/handlePassword'
import { sendMail } from '../../shared/utils/handleEmail'
import { assertLocalSimulationMongoUri } from '../../shared/config/simulation-db-guard'

const { usuarioModel } = models

const testUsers = {
  funcionario: {
    nombre: 'Juan Funcionario',
    correo: 'funcionario_test@miayudatics.com',
    password: 'password123',
    rol: 'funcionario',
    telefono: '3001234567',
    activo: true,
    estado: true,
  },
  tecnico: {
    nombre: 'Pedro Tecnico',
    correo: 'tecnico_test@miayudatics.com',
    password: 'password123',
    rol: 'tecnico',
    telefono: '3007654321',
    activo: true,
    estado: true,
  },
  lider: {
    nombre: 'Maria Lider',
    correo: 'lider_test@miayudatics.com',
    password: 'password123',
    rol: 'lider',
    telefono: '3005555555',
    activo: true,
    estado: true,
  },
}

const testData = {
  ambiente: {
    nombre: 'Ambiente Test 101',
    activo: true,
  },
}

const GENERIC_RESET_MESSAGE =
  'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'

async function loginAs(correo: string, password: string) {
  const response = await request(app).post('/api/auth/login').send({ correo, password })
  expect(response.status).toBe(200)
  expect(response.body.dataUser).toHaveProperty('token')
  return {
    token: response.body.dataUser.token as string,
    userId: response.body.dataUser.user._id as string,
  }
}

describe('FASE 3.5 — PRODUCTION SIMULATION', () => {
  beforeAll(async () => {
    const target = assertLocalSimulationMongoUri(process.env.DB_URI)
    await mongoose.connect(process.env.DB_URI as string)
    if (mongoose.connection.name !== target.dbName) {
      throw new Error('STOP: connected database is not the local simulation database')
    }

    await mongoose.connection.dropDatabase()

    for (const user of Object.values(testUsers)) {
      const hashedPassword = await encrypt(user.password)
      await usuarioModel.create({ ...user, password: hashedPassword })
    }
    await models.ambienteModel.create(testData.ambiente)
  }, 60000)

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase()
      await mongoose.connection.close()
    }
  })

  it('S-01 | Boot real con Atlas', async () => {
    expect(mongoose.connection.readyState).toBe(1)
    expect(mongoose.connection.name).toBe('miayudatics_simulation')
    const response = await request(app).get('/api/usuarios')
    expect(response.status).not.toBe(500)
  })

  it('S-02 | Auth flow completo', async () => {
    const session = await loginAs(testUsers.funcionario.correo, testUsers.funcionario.password)

    const perfilRes = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', `Bearer ${session.token}`)

    expect(perfilRes.status).toBe(200)
    expect(perfilRes.body.data.correo).toBe(testUsers.funcionario.correo)
  })

  it('S-03 | RBAC real por rol', async () => {
    const funcionario = await loginAs(
      testUsers.funcionario.correo,
      testUsers.funcionario.password
    )

    const resForbidden = await request(app)
      .get('/api/tecnicos/tecnicosPendientes')
      .set('Authorization', `Bearer ${funcionario.token}`)
    expect(resForbidden.status).toBe(403)

    const lider = await loginAs(testUsers.lider.correo, testUsers.lider.password)

    const resOk = await request(app)
      .get('/api/tecnicos/tecnicosPendientes')
      .set('Authorization', `Bearer ${lider.token}`)
    expect(resOk.status).toBe(200)
  })

  it('S-04 | Solicitud completa de inicio a fin', async () => {
    const funcionario = await loginAs(
      testUsers.funcionario.correo,
      testUsers.funcionario.password
    )
    const lider = await loginAs(testUsers.lider.correo, testUsers.lider.password)

    const ambiente = await models.ambienteModel.findOne({ nombre: testData.ambiente.nombre })
    const tipoCaso = await models.tipoCasoModel.create({
      nombre: 'Tipo caso simulation S-04',
      descripcion: 'Fixture de integración para POST /api/solicitud',
    })

    const createRes = await request(app)
      .post('/api/solicitud')
      .set('Authorization', `Bearer ${funcionario.token}`)
      .send({
        ambiente: ambiente?._id,
        tipoCaso: tipoCaso._id,
        descripcion: 'Problema real detectado en simulacin',
        telefono: '3001234567',
        usuario: funcionario.userId,
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.message).toContain('exitoso')
    const solicitudId = createRes.body.solicitud._id as string

    const listRes = await request(app)
      .get('/api/solicitud')
      .set('Authorization', `Bearer ${lider.token}`)

    const found = listRes.body.data.find((s: { _id: string }) => s._id === solicitudId)
    expect(found).toBeDefined()
  })

  it('S-05 | Email trigger con mailer de test', async () => {
    vi.mocked(sendMail).mockClear()

    const response = await request(app)
      .post('/api/recuperarPassword')
      .send({ correo: testUsers.funcionario.correo })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe(GENERIC_RESET_MESSAGE)
    expect(sendMail).toHaveBeenCalledTimes(1)
  })
})
