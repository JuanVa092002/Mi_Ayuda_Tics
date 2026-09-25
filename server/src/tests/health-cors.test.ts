import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../core/app'
import { WEB_PROD_ORIGIN } from '../shared/config/cors'

function allowHeaders(value: string | string[] | undefined): string {
  return String(value ?? '').toLowerCase()
}

describe('GET /api/health CORS', () => {
  it('sin Origin responde 200 y no exige autenticación', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status')
    expect(response.body).toHaveProperty('database')
    expect(response.body).toHaveProperty('integrations')
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('con Origin permitido responde 200 y CORS exacto', async () => {
    const response = await request(app).get('/api/health').set('Origin', WEB_PROD_ORIGIN)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status')
    expect(response.headers['access-control-allow-origin']).toBe(WEB_PROD_ORIGIN)
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })

  it('con Origin no permitido responde 200 sin ACAO', async () => {
    const response = await request(app).get('/api/health').set('Origin', 'https://evil.example')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status')
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('OPTIONS /api/health', () => {
  it('con Origin permitido responde 204 y headers CORS', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', WEB_PROD_ORIGIN)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'content-type')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(WEB_PROD_ORIGIN)
    expect(response.headers['access-control-allow-credentials']).toBe('true')
    expect(allowHeaders(response.headers['access-control-allow-headers'])).toContain(
      'idempotency-key',
    )
  })

  it('con Origin no permitido responde 204 sin ACAO', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'GET')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })
})
