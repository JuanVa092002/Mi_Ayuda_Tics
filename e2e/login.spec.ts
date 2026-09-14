import { test, expect } from '@playwright/test'

const leaderEmail = process.env.E2E_LIDER_EMAIL ?? process.env.E2E_LEADER_EMAIL
const leaderPassword = process.env.E2E_LIDER_PASSWORD ?? process.env.E2E_LEADER_PASSWORD

test.describe('Login líder', () => {
  test.skip(!leaderEmail || !leaderPassword, 'Define E2E_LIDER_EMAIL y E2E_LIDER_PASSWORD')

  test('login redirige al panel de solicitudes', async ({ page }) => {
    await page.goto('/loginMain')
    await page.getByLabel(/Correo Electrónico/i).fill(leaderEmail!)
    await page.getByLabel(/Contraseña/i).fill(leaderPassword!)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    await page.waitForURL(/adminSolicitud|funcionario|casos-por-resolver/, { timeout: 30_000 })
    await expect(page).toHaveURL(/adminSolicitud/)
  })
})
