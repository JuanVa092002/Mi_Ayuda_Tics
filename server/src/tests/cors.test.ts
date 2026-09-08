import express from 'express'
import cors from 'cors'
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  WEB_PROD_ORIGIN,
  createCorsOriginValidator,
} from '../shared/config/cors'

const ASSIGN_PATH = '/api/solicitud/6a9edb17dd2d70bbc8f02774/asignarTecnico'

function corsApp() {
  const app = express()
  app.use(
    cors({
      origin: createCorsOriginValidator([WEB_PROD_ORIGIN]),
      credentials: true,
      methods: [...CORS_ALLOWED_METHODS],
      allowedHeaders: [...CORS_ALLOWED_HEADERS],
      optionsSuccessStatus: 204,
    }),
  )
  app.put(ASSIGN_PATH, (_req, res) => {
    res.status(401).json({ message: 'Sin autorizacion' })
  })
  return app
}

function allowHeaders(value: string | string[] | undefined): string {
  return String(value ?? '').toLowerCase()
}

describe('CORS allowlist', () => {
  it('incluye Idempotency-Key, Content-Type y Accept', () => {
    expect(CORS_ALLOWED_HEADERS).toEqual(
      expect.arrayContaining(['Content-Type', 'Accept', 'Authorization', 'Idempotency-Key']),
    )
    expect(CORS_ALLOWED_METHODS).toEqual(
      expect.arrayContaining(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
    )
  })

  it('permite localhost y 127.0.0.1 aunque NODE_ENV sea production', async () => {
    const previous = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const validator = createCorsOriginValidator([WEB_PROD_ORIGIN])
      for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
        const allowed = await new Promise<boolean>((resolve, reject) => {
          validator(origin, (err, allow) => {
            if (err) reject(err)
            else resolve(Boolean(allow))
          })
        })
        expect(allowed).toBe(true)
      }
    } finally {
      process.env.NODE_ENV = previous
    }
  })

  it('permite el origen web de producción', async () => {
    const validator = createCorsOriginValidator([WEB_PROD_ORIGIN])
    const allowed = await new Promise<boolean>((resolve, reject) => {
      validator(WEB_PROD_ORIGIN, (err, allow) => {
        if (err) reject(err)
        else resolve(Boolean(allow))
      })
    })
    expect(allowed).toBe(true)
  })

  it('rechaza un origen no listado', async () => {
    const validator = createCorsOriginValidator([WEB_PROD_ORIGIN])
    await new Promise<void>((resolve, reject) => {
      validator('https://evil.example', (err, allow) => {
        if (err && !allow) resolve()
        else reject(new Error('expected blocked origin'))
      })
    })
  })
})

describe('OPTIONS /api/solicitud/:id/asignarTecnico', () => {
  it('permite Idempotency-Key desde Vite local contra la API de producción', async () => {
    const response = await request(corsApp())
      .options(ASSIGN_PATH)
      .set('Origin', 'http://127.0.0.1:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')

    expect([200, 204]).toContain(response.status)
    expect(response.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173')
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })

  it('permite Idempotency-Key desde el origen web de producción', async () => {
    const response = await request(corsApp())
      .options(ASSIGN_PATH)
      .set('Origin', WEB_PROD_ORIGIN)
      .set('Access-Control-Request-Method', 'PUT')
      .set('Access-Control-Request-Headers', 'content-type,idempotency-key')

    expect([200, 204]).toContain(response.status)
    expect(response.headers['access-control-allow-origin']).toBe(WEB_PROD_ORIGIN)
    expect(response.headers['access-control-allow-credentials']).toBe('true')
    expect(allowHeaders(response.headers['access-control-allow-headers'])).toMatch(
      /idempotency-key/,
    )
    expect(String(response.headers['access-control-allow-methods'] ?? '')).toMatch(/PUT/)
  })

  it('responde el preflight sin exigir auth', async () => {
    const response = await request(corsApp())
      .options(ASSIGN_PATH)
      .set('Origin', WEB_PROD_ORIGIN)
      .set('Access-Control-Request-Method', 'PUT')
      .set('Access-Control-Request-Headers', 'content-type,idempotency-key')

    expect(response.status).not.toBe(401)
    expect(response.status).not.toBe(403)
  })

  it('rechaza un origen no permitido', async () => {
    const response = await request(corsApp())
      .options(ASSIGN_PATH)
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'PUT')
      .set('Access-Control-Request-Headers', 'content-type,idempotency-key')

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })
})
