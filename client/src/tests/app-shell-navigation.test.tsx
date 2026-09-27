import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RoleNavigation, { getNavItemsForRole } from '@/shared/ui/RoleNavigation'
import AppShell from '@/shared/ui/AppShell'

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: { _id: 'u1', nombre: 'Juan Pérez', rol: 'funcionario', correo: 'juan@test.com' },
    isAuthenticated: true,
    setUser: vi.fn(),
    setIsAuthenticated: vi.fn(),
  }),
  logout: vi.fn(),
}))

vi.mock('@/features/notifications', () => ({
  useNotificaciones: () => ({
    notificaciones: [],
    noLeidas: 0,
    marcarLeida: vi.fn(),
    marcarTodas: vi.fn(),
  }),
}))

describe('RoleNavigation', () => {
  it('retrieves navigation items based on role', () => {
    const leaderNav = getNavItemsForRole('lider')
    expect(leaderNav.items.some(i => i.to === '/adminSolicitud')).toBe(true)

    const funcionarioNav = getNavItemsForRole('funcionario')
    expect(funcionarioNav.items.some(i => i.to === '/funcionario')).toBe(true)

    const tecnicoNav = getNavItemsForRole('tecnico')
    expect(tecnicoNav.items.some(i => i.to === '/casos-por-resolver')).toBe(true)
  })

  it('renders correctly within a router context', () => {
    render(
      <MemoryRouter initialEntries={['/funcionario']}>
        <RoleNavigation role="funcionario" />
      </MemoryRouter>
    )
    expect(screen.getByText('Mis Solicitudes')).toBeDefined()
    expect(screen.getByText('Mi Perfil')).toBeDefined()
  })
})

describe('AppShell', () => {
  it('renders children and displays contextual wordmark', () => {
    render(
      <MemoryRouter initialEntries={['/funcionario']}>
        <AppShell subtitleContext="Portal Funcionario">
          <div data-testid="test-content">Contenido de prueba</div>
        </AppShell>
      </MemoryRouter>
    )

    expect(screen.getByTestId('test-content')).toBeDefined()
    expect(screen.getByLabelText('MIAYUDATICS')).toBeDefined()
    expect(screen.getByText('Portal Funcionario')).toBeDefined()
  })
})
