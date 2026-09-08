import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LeaderLayout from '@/app/layouts/LeaderLayout'

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: { nombre: 'Líder Test', correo: 'lider@test.com', rol: 'lider' },
    setUser: vi.fn(),
    setIsAuthenticated: vi.fn(),
    isAuthenticated: true,
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

describe('LeaderLayout', () => {
  it('muestra el wordmark MIAYUDATICS y la navegación institucional', () => {
    render(
      <MemoryRouter initialEntries={['/adminSolicitud']}>
        <LeaderLayout>
          <p>Contenido líder</p>
        </LeaderLayout>
      </MemoryRouter>,
    )

    expect(screen.getAllByLabelText('MIAYUDATICS').length).toBeGreaterThan(0)
    expect(screen.getByText('AYUDA')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación líder' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cola de nuevos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: /Hola, Líder/i })).toBeInTheDocument()
    expect(screen.getByText('Contenido líder')).toBeInTheDocument()
  })
})
