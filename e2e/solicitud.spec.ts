import { test, expect } from '@playwright/test'

const funcionarioEmail = process.env.E2E_FUNCA_EMAIL ?? process.env.E2E_FUNCIONARIO_EMAIL
const funcionarioPassword = process.env.E2E_FUNCA_PASSWORD ?? process.env.E2E_FUNCIONARIO_PASSWORD

test.describe('Solicitud funcionario', () => {
  test.skip(
    !funcionarioEmail || !funcionarioPassword,
    'Define E2E_FUNCA_EMAIL y E2E_FUNCA_PASSWORD (aliases E2E_FUNCIONARIO_* also accepted)'
  )

  test('funcionario accede al panel principal', async ({ page }) => {
    await page.goto('/loginMain')
    await page.getByLabel(/Correo Electrónico/i).fill(funcionarioEmail!)
    await page.getByLabel(/Contraseña/i).fill(funcionarioPassword!)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    await page.waitForURL(/funcionario/, { timeout: 30_000 })
    await expect(page).toHaveURL(/funcionario/)
  })
})
