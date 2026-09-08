import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { getRoleHome } from '@/app/router/roleHome'
import RequireRole from '@/app/router/RequireRole'
import { shouldClearSessionOnUnauthorized } from '@/shared/api/axios'
import { AxiosError, AxiosHeaders } from 'axios'

const mockUseAuth = vi.fn()

vi.mock('@/features/auth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('client hardening helpers', () => {
  it('getRoleHome resuelve rutas por rol', () => {
    expect(getRoleHome('funcionario')).toBe('/funcionario')
    expect(getRoleHome('lider')).toBe('/adminSolicitud')
    expect(getRoleHome('tecnico')).toBe('/casos-por-resolver')
  })

  it('getApiErrorMessage extrae 403 y 409 del backend', () => {
    const forbidden = new AxiosError('fail')
    forbidden.response = {
      status: 403,
      data: { message: 'No autorizado' },
      statusText: 'Forbidden',
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    const conflict = new AxiosError('fail')
    conflict.response = {
      status: 409,
      data: { message: 'Solo se pueden asignar solicitudes en estado solicitado' },
      statusText: 'Conflict',
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    expect(getApiErrorMessage(forbidden)).toBe('No autorizado')
    expect(getApiErrorMessage(conflict)).toBe('Solo se pueden asignar solicitudes en estado solicitado')
  })

  it('getApiErrorMessage no confunde un fallo de red con credenciales', () => {
    const offline = new AxiosError('Network Error')
    expect(getApiErrorMessage(offline)).toBe(
      'Sin conexión con el servidor. Verifica tu red e intenta de nuevo.',
    )
  })

  it('401 de verify-token no cierra sesión; 401 de mutación sí', () => {
    expect(shouldClearSessionOnUnauthorized('auth/verify-token', 401)).toBe(false)
    expect(shouldClearSessionOnUnauthorized('/solicitud/s1/asignarTecnico', 401)).toBe(true)
  })

  it('RequireRole permite al líder entrar a sus rutas', () => {
    mockUseAuth.mockReturnValue({
      user: { rol: 'lider' },
      loading: false,
    })

    render(
      <MemoryRouter initialEntries={['/adminSolicitud']}>
        <Routes>
          <Route element={<RequireRole roles={['lider']} />}>
            <Route path="/adminSolicitud" element={<div>Cola de nuevos</div>} />
          </Route>
          <Route path="/funcionario" element={<div>Funcionario home</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Cola de nuevos')).toBeInTheDocument()
  })

  it('RequireRole redirige si el rol no coincide', () => {
    mockUseAuth.mockReturnValue({
      user: { rol: 'funcionario' },
      loading: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<RequireRole roles={['lider']} />}>
            <Route path="/admin" element={<div>Admin panel</div>} />
          </Route>
          <Route path="/funcionario" element={<div>Funcionario home</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Funcionario home')).toBeInTheDocument()
  })
})
