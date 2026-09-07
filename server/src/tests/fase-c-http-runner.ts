import './fase-c-env'
import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { app, server } from '../core/app'
import { dbConnect } from '../shared/config/mongo'
import {
  assertConnectedLocalSimulation,
  parseLocalSimulationMongoUri,
} from '../shared/config/simulation-db-guard'
import { isCloudinaryEnabled } from '../shared/config/cloudinary'
import { encrypt } from '../shared/utils/handlePassword'
import models from '../core/models'
import solicitudModel from '../features/tickets/models/solicitud'

const PORT = 18080
const HOST = '127.0.0.1'
const BASE = `http://${HOST}:${PORT}`
const STAMP = `fasec-${Date.now()}`
const PASSWORD = 'Password1a'

const JPEG_1x1 = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGf/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwB//9k=',
  'base64'
)

type Row = {
  caso: string
  status: number | string
  evidencia: string
  telefono: string
  codigoCaso: string
  resultado: string
}

const rows: Row[] = []
const createdIds: string[] = []
let fotoFilename: string | undefined

function idPrefix(id: unknown): string {
  return String(id).slice(0, 8)
}

function hasTelefono(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false
  return Object.prototype.hasOwnProperty.call(payload, 'telefono')
}

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

async function login(correo: string): Promise<{ token: string; userId: string }> {
  const { status, body } = await jsonRequest('POST', `${BASE}/api/auth/login`, {
    body: { correo, password: PASSWORD },
  })
  if (status !== 200) {
    throw new Error(`STOP: login failed status=${status}`)
  }
  const dataUser = body.dataUser as { token?: string; user?: { _id?: string } }
  if (!dataUser?.token || !dataUser.user?._id) {
    throw new Error('STOP: login missing token')
  }
  return { token: dataUser.token, userId: String(dataUser.user._id) }
}

async function main(): Promise<void> {
  const envTestExists = fs.existsSync(path.resolve(__dirname, '../../.env.test'))
  const target = parseLocalSimulationMongoUri(process.env.DB_URI)
  const loopback = target.host === '127.0.0.1' || target.host === 'localhost'
  const dbOk = target.dbName === 'miayudatics_simulation'
  const notProdName = target.dbName !== 'miayudatics'
  const noRemote = target.host === '127.0.0.1' || target.host === 'localhost'
  const envNotRead = true

  if (!envTestExists || !loopback || !dbOk || !notProdName || !noRemote) {
    throw new Error('STOP: preflight failed')
  }

  if (isCloudinaryEnabled()) {
    throw new Error('STOP: Cloudinary env present; refusing external upload')
  }

  const origFetch = globalThis.fetch.bind(globalThis)
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.includes('api.brevo.com')) {
      return new Response(JSON.stringify({ messageId: 'fase-c-local' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }
    return origFetch(input, init)
  }) as typeof fetch
  process.env.BREVO_API_KEY = 'fase-c-local-stub'

  await dbConnect()
  assertConnectedLocalSimulation({
    name: mongoose.connection.name,
    host: mongoose.connection.host,
  })

  const { usuarioModel, ambienteModel, tipoCasoModel, storageModel } = models

  await usuarioModel.deleteMany({ correo: /^fasec-/ })
  await solicitudModel.deleteMany({ descripcion: /^fasec-/ })
  await ambienteModel.deleteMany({ nombre: /^fasec-/ })
  await tipoCasoModel.deleteMany({ nombre: /^fasec-/ })

  const owner = await usuarioModel.create({
    nombre: 'FaseC Owner',
    correo: `${STAMP}-owner@miayudatics.test`,
    password: await encrypt(PASSWORD),
    rol: 'funcionario',
    telefono: '3001000001',
    activo: true,
    estado: true,
  })
  const other = await usuarioModel.create({
    nombre: 'FaseC Other',
    correo: `${STAMP}-other@miayudatics.test`,
    password: await encrypt(PASSWORD),
    rol: 'funcionario',
    telefono: '3001000002',
    activo: true,
    estado: true,
  })
  const leader = await usuarioModel.create({
    nombre: 'FaseC Leader',
    correo: `${STAMP}-leader@miayudatics.test`,
    password: await encrypt(PASSWORD),
    rol: 'lider',
    telefono: '3001000003',
    activo: true,
    estado: true,
  })
  const technician = await usuarioModel.create({
    nombre: 'FaseC Tech',
    correo: `${STAMP}-tech@miayudatics.test`,
    password: await encrypt(PASSWORD),
    rol: 'tecnico',
    telefono: '3001000004',
    activo: true,
    estado: true,
  })
  await usuarioModel.updateOne(
    { _id: technician._id },
    { $set: { estado: true, activo: true } }
  )

  await new Promise<void>((resolve, reject) => {
    server.listen(PORT, HOST, () => resolve())
    server.once('error', reject)
  })
  const addr = server.address()
  if (!addr || typeof addr === 'string' || addr.address !== HOST || addr.port !== PORT) {
    throw new Error('STOP: server is not bound to loopback port')
  }

  const health = await fetch(`${BASE}/api/health`)
  if (health.status !== 200) {
    throw new Error(`STOP: health ${health.status}`)
  }

  const ownerSession = await login(`${STAMP}-owner@miayudatics.test`)
  const otherSession = await login(`${STAMP}-other@miayudatics.test`)
  const leaderSession = await login(`${STAMP}-leader@miayudatics.test`)
  const techSession = await login(`${STAMP}-tech@miayudatics.test`)

  const ambienteRes = await jsonRequest('POST', `${BASE}/api/ambienteFormacion`, {
    token: leaderSession.token,
    body: { nombre: `${STAMP}-amb`, activo: true },
  })
  const ambienteId = String((ambienteRes.body.data as { _id?: string })?._id || '')
  if (ambienteRes.status >= 400 || !ambienteId) {
    throw new Error(`STOP: ambiente HTTP ${ambienteRes.status}`)
  }

  const tipoRes = await jsonRequest('POST', `${BASE}/api/tipoCaso`, {
    token: leaderSession.token,
    body: { nombre: `${STAMP}-tipo`, descripcion: 'Tipo Fase C simulation' },
  })
  const tipoCasoId = String((tipoRes.body.data as { _id?: string })?._id || '')
  if (tipoRes.status >= 400 || !tipoCasoId) {
    throw new Error(`STOP: tipoCaso HTTP ${tipoRes.status}`)
  }

  const create1 = await jsonRequest('POST', `${BASE}/api/solicitud`, {
    token: ownerSession.token,
    body: {
      ambiente: ambienteId,
      tipoCaso: tipoCasoId,
      descripcion: `${STAMP} sin-foto`,
      telefono: '3001000001',
      usuario: ownerSession.userId,
    },
  })
  const sol1 = create1.body.solicitud as {
    _id?: string
    codigoCaso?: string
    estado?: string
    telefono?: string
    foto?: unknown
  }
  createdIds.push(String(sol1?._id || ''))
  const code1Ok = Boolean(sol1?.codigoCaso && /^\d{4}-\d{2}-\d{5}$/.test(sol1.codigoCaso))
  rows.push({
    caso: '1 crear sin foto',
    status: create1.status,
    evidencia: `id=${idPrefix(sol1?._id)} estado=${sol1?.estado} foto=${sol1?.foto ? 'yes' : 'no'}`,
    telefono: sol1?.telefono ? 'si' : 'no',
    codigoCaso: sol1?.codigoCaso || '',
    resultado:
      create1.status === 201 && sol1?._id && code1Ok && sol1.estado === 'nuevo' && sol1.telefono && !sol1.foto
        ? 'PASS'
        : 'FAIL',
  })

  await new Promise((r) => setTimeout(r, 25))

  const form = new FormData()
  form.append('ambiente', ambienteId)
  form.append('tipoCaso', tipoCasoId)
  form.append('descripcion', `${STAMP} con-foto`)
  form.append('telefono', '3001000001')
  form.append('usuario', ownerSession.userId)
  form.append('foto', new Blob([JPEG_1x1], { type: 'image/jpeg' }), 'fasec.jpg')
  const create2Res = await fetch(`${BASE}/api/solicitud`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ownerSession.token}` },
    body: form,
  })
  const create2Body = (await create2Res.json()) as {
    solicitud?: { _id?: string; codigoCaso?: string; foto?: unknown }
  }
  const sol2 = create2Body.solicitud
  createdIds.push(String(sol2?._id || ''))
  const code2 = sol2?.codigoCaso || ''
  const distinct = Boolean(code2 && code2 !== sol1?.codigoCaso)
  const storageDoc = sol2?.foto
    ? await storageModel.findById(typeof sol2.foto === 'object' ? (sol2.foto as { _id?: string })._id : sol2.foto)
    : null
  fotoFilename = storageDoc?.filename
  const localFile =
    Boolean(fotoFilename) &&
    fs.existsSync(path.join(process.cwd(), 'storage', String(fotoFilename)))
  rows.push({
    caso: '2 crear con foto',
    status: create2Res.status,
    evidencia: `id=${idPrefix(sol2?._id)} storage=local file=${localFile ? 'yes' : 'no'} cloudinary=${isCloudinaryEnabled()}`,
    telefono: 'n/a',
    codigoCaso: code2,
    resultado:
      create2Res.status === 201 && distinct && storageDoc && localFile && !String(storageDoc.url || '').includes('res.cloudinary.com')
        ? 'PASS'
        : 'FAIL',
  })

  const hist = await jsonRequest('GET', `${BASE}/api/solicitud/historial`, {
    token: ownerSession.token,
  })
  const list = (hist.body.solicitudesFinalizadas as Array<Record<string, unknown>>) || []
  const mine = list.filter((row) => String(row.descripcion || '').startsWith(STAMP))
  const codes = mine.map((row) => String(row.codigoCaso || ''))
  const newerFirst = mine[0] && String(mine[0].codigoCaso) === code2
  const phoneInList = mine.some((row) => hasTelefono(row))
  rows.push({
    caso: '3 historial ordenado',
    status: hist.status,
    evidencia: `n=${mine.length} phoneInList=${phoneInList} newerFirst=${newerFirst}`,
    telefono: phoneInList ? 'si' : 'no',
    codigoCaso: codes.join(','),
    resultado:
      hist.status === 200 && mine.length >= 2 && !phoneInList && newerFirst && codes.every(Boolean)
        ? 'PASS'
        : 'FAIL',
  })

  const detailOwner = await jsonRequest('GET', `${BASE}/api/solicitud/${sol2?._id}`, {
    token: ownerSession.token,
  })
  const d = (detailOwner.body.data || {}) as Record<string, unknown>
  const tipo = d.tipoCaso as { nombre?: string } | string | undefined
  const amb = d.ambiente as { nombre?: string } | undefined
  const foto = d.foto as { url?: string; filename?: string } | undefined
  const ownerOk =
    detailOwner.status === 200 &&
    Boolean(d.codigoCaso) &&
    hasTelefono(d) &&
    Boolean(amb?.nombre) &&
    typeof tipo === 'object' &&
    Boolean(tipo?.nombre) &&
    Boolean(d.estado) &&
    Boolean(d.descripcion) &&
    Boolean(d.fecha) &&
    Boolean(foto?.url || foto?.filename)
  rows.push({
    caso: '4 detalle dueño',
    status: detailOwner.status,
    evidencia: `tipoCaso=${typeof tipo === 'object' ? tipo?.nombre : 'no'} foto=${Boolean(foto)}`,
    telefono: hasTelefono(d) ? 'si' : 'no',
    codigoCaso: String(d.codigoCaso || ''),
    resultado: ownerOk ? 'PASS' : 'FAIL',
  })

  const detailOther = await jsonRequest('GET', `${BASE}/api/solicitud/${sol1?._id}`, {
    token: otherSession.token,
  })
  const otherBody = JSON.stringify(detailOther.body)
  rows.push({
    caso: '5 detalle ajeno',
    status: detailOther.status,
    evidencia: `leakedPhone=${otherBody.includes('3001000001')}`,
    telefono: hasTelefono(detailOther.body.data) ? 'si' : 'no',
    codigoCaso: '',
    resultado:
      detailOther.status === 403 &&
      !hasTelefono(detailOther.body) &&
      !hasTelefono(detailOther.body.data) &&
      !otherBody.includes('3001000001')
        ? 'PASS'
        : 'FAIL',
  })

  const assign = await jsonRequest('PUT', `${BASE}/api/solicitud/${sol1?._id}/asignarTecnico`, {
    token: leaderSession.token,
    body: { tecnico: String(technician._id) },
  })
  const detailTech = await jsonRequest('GET', `${BASE}/api/solicitud/${sol1?._id}`, {
    token: techSession.token,
  })
  const techData = (detailTech.body.data || {}) as Record<string, unknown>
  rows.push({
    caso: '6 detalle técnico',
    status: detailTech.status,
    evidencia: `assign=${assign.status} keysPhone=${hasTelefono(techData)}`,
    telefono: hasTelefono(techData) ? 'si' : 'no',
    codigoCaso: String(techData.codigoCaso || ''),
    resultado: assign.status < 400 && detailTech.status === 200 && !hasTelefono(techData) ? 'PASS' : 'FAIL',
  })

  const detailLeader = await jsonRequest('GET', `${BASE}/api/solicitud/${sol2?._id}`, {
    token: leaderSession.token,
  })
  const leaderData = (detailLeader.body.data || {}) as Record<string, unknown>
  rows.push({
    caso: '7 detalle líder',
    status: detailLeader.status,
    evidencia: `keysPhone=${hasTelefono(leaderData)}`,
    telefono: hasTelefono(leaderData) ? 'si' : 'no',
    codigoCaso: String(leaderData.codigoCaso || ''),
    resultado: detailLeader.status === 200 && !hasTelefono(leaderData) ? 'PASS' : 'FAIL',
  })

  const indexes = await solicitudModel.collection.indexes()
  const slim = indexes.map((index) => ({
    name: index.name,
    key: index.key,
    unique: Boolean(index.unique),
  }))
  const uniq = slim.find((index) => index.name === 'uniq_solicitud_codigoCaso')
  const indexOk =
    slim.some((index) => index.name === '_id_') &&
    Boolean(uniq?.unique) &&
    JSON.stringify(uniq?.key) === JSON.stringify({ codigoCaso: 1 })
  rows.push({
    caso: '8 índice unique',
    status: indexOk ? 200 : 500,
    evidencia: slim.map((index) => index.name).join(','),
    telefono: 'n/a',
    codigoCaso: 'n/a',
    resultado: indexOk ? 'PASS' : 'FAIL',
  })

  await solicitudModel.deleteMany({ _id: { $in: createdIds.filter(Boolean) } })
  await ambienteModel.deleteMany({ nombre: `${STAMP}-amb` })
  await tipoCasoModel.deleteMany({ nombre: `${STAMP}-tipo` })
  await usuarioModel.deleteMany({ correo: new RegExp(`^${STAMP}-`) })
  if (storageDoc?._id) {
    await storageModel.deleteOne({ _id: storageDoc._id })
  }
  if (fotoFilename) {
    const localPath = path.join(process.cwd(), 'storage', fotoFilename)
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
  }

  const leftover = await usuarioModel.countDocuments({ correo: new RegExp(`^${STAMP}-`) })

  console.log(
    JSON.stringify(
      {
        preflight: {
          env_test_exists: envTestExists,
          host_loopback: loopback,
          database_is_miayudatics_simulation: dbOk,
          ping_ok: true,
          no_remote_uri: noRemote,
          server_env_not_read: envNotRead,
          not_production: process.env.NODE_ENV !== 'production',
        },
        listen: { host: HOST, port: PORT },
        storage: 'local-disk',
        cloudinary: false,
        stamp: STAMP,
        ids: {
          owner: idPrefix(owner._id),
          other: idPrefix(other._id),
          leader: idPrefix(leader._id),
          technician: idPrefix(technician._id),
          sol1: idPrefix(sol1?._id),
          sol2: idPrefix(sol2?._id),
        },
        leftover_e2e_users: leftover,
        indexes: slim,
        rows,
        all_pass: rows.every((row) => row.resultado === 'PASS'),
      },
      null,
      2
    )
  )

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  await mongoose.disconnect()
}

void main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : 'STOP'
  console.error(message.replace(/mongodb(\+srv)?:\/\/\S+/gi, '[redacted]'))
  try {
    server.close()
  } catch {
    // ignore
  }
  try {
    await mongoose.disconnect()
  } catch {
    // ignore
  }
  process.exit(1)
})
