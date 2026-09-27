import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminSolicitud from '@/pages/admin/AdminSolicitud'
import Funcionario from '@/pages/funcionario/Funcionario'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'

// Mock services
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

vi.mock('@/features/users', () => ({
  getTecnicosAprobados: vi.fn().mockResolvedValue({
    tecnicos: [
      { _id: 't1', nombre: 'Carlos Técnico', correo: 'carlos@sena.edu.co', rol: 'tecnico' }
    ]
  }),
}))

vi.mock('@/features/tickets', () => ({
  getSolicitudesPendientes: vi.fn().mockResolvedValue([
    {
      _id: 'sol-1',
      codigoCaso: 'CASO-101',
      descripcion: 'Falla de conectividad en Sala 304',
      estado: 'nuevo',
      fecha: '2026-09-27T08:00:00Z',
      ambiente: { nombre: 'Sala 304' },
      usuario: { nombre: 'María Funcionario' },
      workflowVersion: 2,
    },
    {
      _id: 'sol-2',
      codigoCaso: 'CASO-102',
      descripcion: 'Impresora sin tóner en Oficina TIC',
      estado: 'nuevo',
      fecha: '2026-09-27T09:00:00Z',
      ambiente: { nombre: 'Oficina TIC' },
      usuario: { nombre: 'Pedro Pérez' },
      workflowVersion: 2,
    }
  ]),
  asignarSolicitudTecnico: vi.fn().mockResolvedValue({ _id: 'sol-1', estado: 'asignado' }),
  cancelarSolicitud: vi.fn().mockResolvedValue({ message: 'OK' }),
  obtenerAmbientes: vi.fn().mockResolvedValue({ data: [{ _id: 'a1', nombre: 'Sala 304' }] }),
  obtenerTiposCaso: vi.fn().mockResolvedValue({ data: [{ _id: 'tc1', nombre: 'Redes' }] }),
  historialSolicitudesFuncionario: vi.fn().mockResolvedValue([
    {
      _id: 'sol-1',
      codigoCaso: 'CASO-101',
      descripcion: 'Falla de conectividad en Sala 304',
      estado: 'nuevo',
      fecha: '2026-09-27T08:00:00Z',
      ambiente: { nombre: 'Sala 304' },
      tecnico: { nombre: 'Carlos Técnico' },
    }
  ]),
  getCasosAsignados: vi.fn().mockResolvedValue([
    {
      _id: 'sol-1',
      codigoCaso: 'CASO-101',
      descripcion: 'Falla de conectividad en Sala 304',
      estado: 'en_progreso',
      fecha: '2026-09-27T08:00:00Z',
      ambiente: { nombre: 'Sala 304' },
      usuario: { nombre: 'María Funcionario' },
      capabilities: { canStart: false, canUpdate: true, canResolve: true },
      workflowVersion: 2,
    }
  ]),
  getCasos: vi.fn().mockResolvedValue({ data: [] }),
  iniciarAtencion: vi.fn().mockResolvedValue({ message: 'OK' }),
  agregarActualizacion: vi.fn().mockResolvedValue({ message: 'OK' }),
  solicitarInformacion: vi.fn().mockResolvedValue({ message: 'OK' }),
  registrarSolucionParcial: vi.fn().mockResolvedValue({ message: 'OK' }),
  registrarSolucionTotal: vi.fn().mockResolvedValue({ message: 'OK' }),
  submitSolucionCaso: vi.fn().mockResolvedValue({ message: 'OK' }),
  WorkflowManualRetryNotice: () => null,
  ResolutionModal: () => null,
}))

describe('Role Contextual Workspaces', () => {
  it('renders Líder TIC Dispatch Workspace with split queue and detail inspector', async () => {
    render(
      <MemoryRouter>
        <AdminSolicitud />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Mesa de Control de Nuevas Incidencias')).toBeDefined()
      expect(screen.getAllByText('#CASO-101').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Falla de conectividad en Sala 304').length).toBeGreaterThan(0)
      expect(screen.getByText('Asignar Especialista Técnico')).toBeDefined()
    })

    // Click second item in queue to switch inspection detail
    const secondItem = screen.getByText('#CASO-102')
    fireEvent.click(secondItem)

    await waitFor(() => {
      expect(screen.getAllByText('Impresora sin tóner en Oficina TIC').length).toBeGreaterThan(0)
    })
  })

  it('renders Funcionario Workspace with request list and progress stepper', async () => {
    render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/¿En qué podemos apoyarte hoy\?/i)).toBeDefined()
      expect(screen.getByText('Historial y Seguimiento de Incidencias')).toBeDefined()
      expect(screen.getByText('Etapa del requerimiento')).toBeDefined()
    })
  })

  it('renders Técnico Workspace with priority queue and immediate resolution actions', async () => {
    render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Bandeja Operativa de Incidentes')).toBeDefined()
      expect(screen.getByText('Acciones Operativas Inmediatas')).toBeDefined()
      expect(screen.getByText('Finalizar caso técnico')).toBeDefined()
    })
  })
})
