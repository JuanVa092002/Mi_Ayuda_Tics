import { expect, test } from './helpers/fixtures'

const liderEmail = process.env.E2E_LIDER_EMAIL ?? process.env.E2E_ADMIN_EMAIL
const liderPassword = process.env.E2E_LIDER_PASSWORD ?? process.env.E2E_ADMIN_PASSWORD

test.describe('Seguimiento Operativo Líder TIC (E2E Pro-Max)', () => {
  test.skip(
    !liderEmail || !liderPassword,
    'Define E2E_LIDER_EMAIL y E2E_LIDER_PASSWORD para ejecutar la prueba de Seguimiento Operativo Líder TIC'
  )

  test('Líder TIC navega a Seguimiento, inspecciona la telemetría y cambia de vista', async ({ page }) => {
    // 1. Iniciar sesión como Líder TIC
    await page.goto('/loginMain')
    await page.getByLabel(/Correo Electrónico/i).fill(liderEmail!)
    await page.getByLabel(/Contraseña/i).fill(liderPassword!)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    // 2. Esperar navegación a panel administrativo
    await page.waitForURL(/admin|lider/i, { timeout: 30_000 })

    // 3. Navegar a /seguimiento
    await page.goto('/seguimiento')
    await page.waitForSelector('[data-testid="seguimiento-page"]', { timeout: 15_000 })

    // 4. Verificar encabezado y telemetría Bento
    await expect(page.getByTestId('kpi-en-operacion')).toBeVisible()
    await expect(page.getByTestId('kpi-cerrados')).toBeVisible()

    // 5. Verificar filtros situacionales y cambiar a modo tabla
    const toggleTableBtn = page.getByTestId('toggle-view-table')
    await expect(toggleTableBtn).toBeVisible()
    await toggleTableBtn.click()

    // 6. Verificar que la tabla se renderiza
    await expect(page.getByTestId('table-container')).toBeVisible()

    // 7. Volver al modo Workspace / Master-Detail
    const toggleWorkspaceBtn = page.getByTestId('toggle-view-workspace')
    await expect(toggleWorkspaceBtn).toBeVisible()
    await toggleWorkspaceBtn.click()

    // 8. Verificar que el inspector está activo
    await expect(page.getByTestId('inspector-detail')).toBeVisible()
  })
})
