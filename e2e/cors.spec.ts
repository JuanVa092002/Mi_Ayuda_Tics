import { test, expect } from '@playwright/test'

const backendUrl = process.env.E2E_BACKEND_URL ?? 'https://miayudatics-v1-0.onrender.com'
const frontendUrl = process.env.E2E_FRONTEND_URL ?? 'https://miayudatics.vercel.app'

test('health responde desde contexto browser con CORS', async ({ page }) => {
  test.skip(
    process.env.E2E_EXPECT_HEALTH_CORS !== 'true',
    'Live /api/health still lacks CORS until a Render deploy of the Phase 0.5 server change. Set E2E_EXPECT_HEALTH_CORS=true after that deploy.',
  )
  await page.goto('/loginMain')

  const result = await page.evaluate(async (apiBase) => {
    const res = await fetch(`${apiBase}/api/health`, { credentials: 'include' })
    const body = await res.json()
    return { status: res.status, body }
  }, backendUrl)

  expect(result.status).toBe(200)
  expect(result.body.status).toBe('ok')
  expect(result.body.database).toBe('connected')
  if (result.body.integrations) {
    expect(result.body.integrations.cloudinary).toBeDefined()
    expect(result.body.integrations.brevo).toBeDefined()
  }
})

test('frontend carga loginMain', async ({ page }) => {
  await page.goto('/loginMain')
  await expect(page).toHaveTitle(/MiAyudaTIC/i)
  await expect(page.locator('#root')).toBeVisible()
})

test('SPA deep link no devuelve 404 de plataforma', async ({ page }) => {
  const response = await page.goto('/adminSolicitud')
  expect(response?.status()).toBe(200)
  await expect(page.locator('#root')).toBeVisible()
})

test('preflight desde Vite local permite el origen de desarrollo', async ({ request }) => {
  const response = await request.fetch(`${backendUrl}/api/auth/login`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://127.0.0.1:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  })
  expect([200, 204]).toContain(response.status())
  expect(response.headers()['access-control-allow-origin']).toBe('http://127.0.0.1:5173')
  expect(response.headers()['access-control-allow-credentials']).toBe('true')
})

test('preflight de asignarTecnico permite Idempotency-Key', async ({ request }) => {
  const response = await request.fetch(`${backendUrl}/api/solicitud/preflight-probe/asignarTecnico`, {
    method: 'OPTIONS',
    headers: {
      Origin: frontendUrl,
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'content-type,idempotency-key',
    },
  })
  expect([200, 204]).toContain(response.status())
  const allowHeaders = (response.headers()['access-control-allow-headers'] ?? '').toLowerCase()
  expect(response.headers()['access-control-allow-origin']).toBe(frontendUrl)
  expect(response.headers()['access-control-allow-credentials']).toBe('true')
  expect(allowHeaders).toContain('idempotency-key')
  expect(response.headers()['access-control-allow-methods'] ?? '').toMatch(/PUT/)
})
