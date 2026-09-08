import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { getRoleHome } from '@/app/router/roleHome'
import RequireRole from '@/app/router/RequireRole'
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

  it('getApiErrorMessage extrae message del backend', () => {
    const error = new AxiosError('fail')
    error.response = {
      status: 400,
      data: { message: 'Credenciales inválidas' },
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
    expect(getApiErrorMessage(error)).toBe('Credenciales inválidas')
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
