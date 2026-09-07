import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../core/app'
import models from '../core/models'
import { tokenSign } from '../shared/utils/handleJwt'
import { actorCanAccessStorage } from '../features/tickets/domain/storage-access'

const storageDir = path.join(process.cwd(), 'storage-media-access-test')
const testFilename = 'media-access-test.png'
const storageId = '60d0fe4f5311236168a109af'

vi.mock('../shared/config/storagePaths', async importOriginal => {
  const actual = await importOriginal<typeof import('../shared/config/storagePaths')>()
  return {
    ...actual,
    getStorageDir: () => storageDir,
  }
})

vi.mock('../features/tickets/domain/storage-access', async importOriginal => {
  const actual = await importOriginal<typeof import('../features/tickets/domain/storage-access')>()
  return {
    ...actual,
    actorCanAccessStorage: vi.fn(),
  }
})

const accessMock = vi.mocked(actorCanAccessStorage)

async function authToken(user: { _id: string; rol: string; nombre?: string }) {
  vi.spyOn(models.usuarioModel, 'findById').mockResolvedValue({
    ...user,
    activo: true,
    estado: true,
  } as never)
  return tokenSign(user)
}

describe('Media access — no public static storage', () => {
  beforeEach(() => {
    fs.mkdirSync(storageDir, { recursive: true })
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ...Buffer.from('test'),
    ])
    fs.writeFileSync(path.join(storageDir, testFilename), png)
    accessMock.mockReset()
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1)
    vi.spyOn(models.storageModel, 'findOne').mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: storageId,
        filename: testFilename,
      }),
    } as never)
    vi.spyOn(models.storageModel, 'findById').mockResolvedValue({
      _id: storageId,
      filename: testFilename,
      url: `/api/media/local/${testFilename}`,
    } as never)
  })

  afterEach(() => {
    fs.rmSync(storageDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('GET /api/media/local/:filename sin token devuelve 401', async () => {
    const response = await request(app).get(`/api/media/local/${testFilename}`)
    expect(response.status).toBe(401)
  })

  it('GET /:filename en raíz (antiguo static) devuelve 404', async () => {
    const response = await request(app).get(`/${testFilename}`)
    expect(response.status).toBe(404)
  })

  it('filename válido sin Storage vinculado no concede acceso', async () => {
    vi.spyOn(models.storageModel, 'findOne').mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as never)
    const token = await authToken({
      _id: '60d0fe4f5311236168a109ca',
      rol: 'funcionario',
      nombre: 'Test User',
    })
    const response = await request(app)
      .get(`/api/media/local/${testFilename}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(404)
    expect(accessMock).not.toHaveBeenCalled()
  })

  it('DB desconectada no salta la autorización', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0)
    const token = await authToken({
      _id: '60d0fe4f5311236168a109ca',
      rol: 'funcionario',
    })
    const response = await request(app)
      .get(`/api/media/local/${testFilename}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(503)
  })

  it('rechaza path traversal en filename', async () => {
    const token = await authToken({
      _id: '60d0fe4f5311236168a109ca',
      rol: 'funcionario',
    })
    const response = await request(app)
      .get('/api/media/local/..%2F..%2Fetc%2Fpasswd')
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(400)
  })

  it('matriz HTTP de evidencia: dueño, asignado y líder sí; ajenos no', async () => {
    const cases = [
      { rol: 'funcionario', _id: '60d0fe4f5311236168a109bc', allowed: true },
      { rol: 'tecnico', _id: '60d0fe4f5311236168a109bb', allowed: true },
      { rol: 'lider', _id: '60d0fe4f5311236168a109ba', allowed: true },
      { rol: 'tecnico', _id: '60d0fe4f5311236168a109be', allowed: false },
      { rol: 'funcionario', _id: '60d0fe4f5311236168a109bd', allowed: false },
    ] as const

    for (const item of cases) {
      accessMock.mockResolvedValue(item.allowed)
      const token = await authToken({ _id: item._id, rol: item.rol })
      const media = await request(app)
        .get(`/api/media/local/${testFilename}`)
        .set('Authorization', `Bearer ${token}`)
      expect(media.status).toBe(item.allowed ? 200 : 403)

      const storage = await request(app)
        .get(`/api/storage/${storageId}`)
        .set('Authorization', `Bearer ${token}`)
      expect(storage.status).toBe(item.allowed ? 200 : 403)
    }
  })

  it('ObjectId inválido en GET /api/storage/:id no concede acceso', async () => {
    const token = await authToken({
      _id: '60d0fe4f5311236168a109ba',
      rol: 'lider',
    })
    const response = await request(app)
      .get('/api/storage/not-an-id')
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(404)
  })
})
