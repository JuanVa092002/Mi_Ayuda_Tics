import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SeguimientoSolicitud from '@/pages/admin/solicitud/SeguimientoSolicitud'
import AdminTecnicos from '@/pages/admin/AdminTecnicos'
import AdminAmbientes from '@/pages/admin/AdminAmbientes'
import AdminCasos from '@/pages/admin/AdminCasos'

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: { _id: 'u1', nombre: 'Admin User', rol: 'lider', correo: 'admin@test.com' },
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

vi.mock('@/features/users', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/users')>()
  return {
    ...actual,
    getTecnicosPendientes: vi.fn().mockResolvedValue({
      tecnicosFalse: [
        { _id: 'tp-1', nombre: 'Aspirante Juan', correo: 'juan@test.com', telefono: '3001112233' }
      ]
    }),
    getTecnicosAprobados: vi.fn().mockResolvedValue({
      tecnicos: [
        { _id: 't-1', nombre: 'Carlos Técnico', correo: 'carlos@sena.edu.co' }
      ]
    }),
    aprobarTecnico: vi.fn().mockResolvedValue({ message: 'OK' }),
    denegarTecnico: vi.fn().mockResolvedValue({ message: 'OK' }),
  }
})

vi.mock('@/features/tickets', () => ({
  historialSolicitudesLider: vi.fn().mockResolvedValue([
    {
      _id: 's-hist-1',
      codigoCaso: 'CASO-999',
      descripcion: 'Problema de red en piso 2',
      estado: 'asignado',
      queue: 'por_iniciar',
      workflowVersion: 2,
    }
  ]),
  reasignarTecnico: vi.fn().mockResolvedValue({ message: 'OK' }),
  cancelarSolicitud: vi.fn().mockResolvedValue({ message: 'OK' }),
  getCasos: vi.fn().mockResolvedValue({
    data: [
      { _id: 'c-1', nombre: 'Hardware', descripcion: 'Fallas físicas' }
    ]
  }),
  createCaso: vi.fn().mockResolvedValue({ message: 'OK' }),
  updateCaso: vi.fn().mockResolvedValue({ message: 'OK' }),
  WorkflowManualRetryNotice: () => null,
  LeaderTicketDrawer: () => null,
  LeaderMediaThumb: () => null,
}))

vi.mock('@/features/ambientes', () => ({
  getAmbientes: vi.fn().mockResolvedValue({
    data: [
      { _id: 'amb-1', nombre: 'Laboratorio 101' }
    ]
  }),
  createAmbiente: vi.fn().mockResolvedValue({ message: 'OK' }),
  updateAmbiente: vi.fn().mockResolvedValue({ message: 'OK' }),
  inactivarAmbiente: vi.fn().mockResolvedValue({ message: 'OK' }),
}))

describe('Secondary Admin Surfaces Convergence', () => {
  it('renders SeguimientoSolicitud with operational counters and accessible action buttons', async () => {
    render(
      <MemoryRouter>
        <SeguimientoSolicitud />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Seguimiento').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Historial').length).toBeGreaterThan(0)
      expect(screen.getAllByText('#CASO-999').length).toBeGreaterThan(0)
      // Canonical Button with icon "history" and label "Historial"
      expect(screen.getByRole('button', { name: /historial/i })).toBeDefined()
    })
  })

  it('renders AdminTecnicos with canonical Button primitives for approve/deny', async () => {
    render(
      <MemoryRouter>
        <AdminTecnicos />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Técnicos por aprobar')).toBeDefined()
      expect(screen.getByText('Aspirante Juan')).toBeDefined()
      expect(screen.getByRole('button', { name: /aprobar/i })).toBeDefined()
      expect(screen.getByRole('button', { name: /denegar/i })).toBeDefined()
    })
  })

  it('renders AdminAmbientes with canonical Button primitives and PaginationFooter', async () => {
    render(
      <MemoryRouter>
        <AdminAmbientes />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Listado de Ambientes')).toBeDefined()
      expect(screen.getByText('Laboratorio 101')).toBeDefined()
      expect(screen.getByRole('button', { name: /registrar ambiente/i })).toBeDefined()
      expect(screen.getByLabelText('Editar ambiente')).toBeDefined()
      expect(screen.getByLabelText('Inactivar ambiente')).toBeDefined()
    })
  })

  it('renders AdminCasos with canonical Button primitives and PaginationFooter', async () => {
    render(
      <MemoryRouter>
        <AdminCasos />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Categorías de Soporte')).toBeDefined()
      expect(screen.getByText('Hardware')).toBeDefined()
      expect(screen.getByRole('button', { name: /crear/i })).toBeDefined()
      expect(screen.getByLabelText('Editar categoría')).toBeDefined()
    })
  })
})
