import './fase-c-env'
import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { dbConnect } from '../shared/config/mongo'
import { assertConnectedLocalSimulation } from '../shared/config/simulation-db-guard'
import { encrypt } from '../shared/utils/handlePassword'
import models from '../core/models'

const HOST = '127.0.0.1'
const PORT = 18080
const BASE = `http://${HOST}:${PORT}`
const PASSWORD = 'Password1a'
const FUNC_EMAIL = 'fased.funcionario@miayudatics.test'
const FUNC2_EMAIL = 'fased.funcionario2@miayudatics.test'
const LEADER_EMAIL = 'fased.lider@miayudatics.test'
const AMBIENTE_NAME = 'Fase D Ambiente'
const TIPO_NAME = 'Fase D Tipo'

async function jsonRequest(
  method: string,
  url: string,
  opts?: { token?: string; body?: unknown }
): Promise<{ status: number; body: Record<string, unknown> }> {
  const headers: Record<string, string> = {}
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`
  if (opts?.body !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(url, {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
  return { status: response.status, body }
}

async function main(): Promise<void> {
  await dbConnect()
  assertConnectedLocalSimulation({
    name: mongoose.connection.name,
    host: mongoose.connection.host,
  })

  const { usuarioModel, ambienteModel, tipoCasoModel } = models
  const passwordHash = await encrypt(PASSWORD)

  await usuarioModel.findOneAndUpdate(
    { correo: FUNC_EMAIL },
    {
      nombre: 'Fase D Funcionario',
      correo: FUNC_EMAIL,
      password: passwordHash,
      rol: 'funcionario',
      telefono: '3002000001',
      activo: true,
      estado: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await usuarioModel.findOneAndUpdate(
    { correo: FUNC2_EMAIL },
    {
      nombre: 'Fase D Funcionario B',
      correo: FUNC2_EMAIL,
      password: passwordHash,
      rol: 'funcionario',
      telefono: '3002000003',
      activo: true,
      estado: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await usuarioModel.findOneAndUpdate(
    { correo: LEADER_EMAIL },
    {
      nombre: 'Fase D Lider',
      correo: LEADER_EMAIL,
      password: passwordHash,
      rol: 'lider',
      telefono: '3002000002',
      activo: true,
      estado: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const health = await fetch(`${BASE}/api/health`)
  if (health.status !== 200) {
    throw new Error(`STOP: health ${health.status}`)
  }

  const login = await jsonRequest('POST', `${BASE}/api/auth/login`, {
    body: { correo: LEADER_EMAIL, password: PASSWORD },
  })
  if (login.status !== 200) {
    throw new Error(`STOP: leader login ${login.status}`)
  }
  const dataUser = login.body.dataUser as { token?: string }
  const token = dataUser?.token
  if (!token) throw new Error('STOP: leader token missing')

  let ambiente = await ambienteModel.findOne({ nombre: AMBIENTE_NAME })
  if (!ambiente) {
    const created = await jsonRequest('POST', `${BASE}/api/ambienteFormacion`, {
      token,
      body: { nombre: AMBIENTE_NAME, activo: true },
    })
    if (created.status >= 400) {
      throw new Error(`STOP: ambiente HTTP ${created.status}`)
    }
    ambiente = await ambienteModel.findOne({ nombre: AMBIENTE_NAME })
  }

  let tipo = await tipoCasoModel.findOne({ nombre: TIPO_NAME })
  if (!tipo) {
    const created = await jsonRequest('POST', `${BASE}/api/tipoCaso`, {
      token,
      body: { nombre: TIPO_NAME, descripcion: 'Tipo Fase D simulation' },
    })
    if (created.status >= 400) {
      throw new Error(`STOP: tipoCaso HTTP ${created.status}`)
    }
    tipo = await tipoCasoModel.findOne({ nombre: TIPO_NAME })
  }

  const funcLogin = await jsonRequest('POST', `${BASE}/api/auth/login`, {
    body: { correo: FUNC_EMAIL, password: PASSWORD },
  })
  if (funcLogin.status !== 200) {
    throw new Error(`STOP: funcionario login ${funcLogin.status}`)
  }

  const func2Login = await jsonRequest('POST', `${BASE}/api/auth/login`, {
    body: { correo: FUNC2_EMAIL, password: PASSWORD },
  })
  if (func2Login.status !== 200) {
    throw new Error(`STOP: funcionario2 login ${func2Login.status}`)
  }

  const credPath = path.resolve(
    __dirname,
    '../../../mobile/MiAyudaTIC-Mobile/.env.fase-d.local'
  )
  fs.writeFileSync(
    credPath,
    [
      `FASE_D_EMAIL=${FUNC_EMAIL}`,
      `FASE_D_EMAIL_B=${FUNC2_EMAIL}`,
      `FASE_D_PASSWORD=${PASSWORD}`,
      `FASE_D_AMBIENTE=${AMBIENTE_NAME}`,
      `FASE_D_TIPO=${TIPO_NAME}`,
      '',
    ].join('\n'),
    'utf8'
  )

  console.log(
    [
      'seed_ok',
      `db=${mongoose.connection.name}`,
      `ambiente=${ambiente ? 'yes' : 'no'}`,
      `tipo=${tipo ? 'yes' : 'no'}`,
      'funcionario_login=200',
      'funcionario2_login=200',
    ].join(' ')
  )
  await mongoose.disconnect()
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'STOP'
  console.error(message.replace(/mongodb(\+srv)?:\/\/\S+/gi, '[redacted]'))
  process.exit(1)
})
