import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Funcionario from '@/pages/funcionario/Funcionario'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'
import AdminSolicitud from '@/pages/admin/AdminSolicitud'

let mockUser = { _id: 'u1', nombre: 'Carlos Usuario', rol: 'funcionario', correo: 'carlos@sena.edu.co' }

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    isAuthenticated: true,
    setUser: vi.fn(),
    setIsAuthenticated: vi.fn(),
  })),
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

vi.mock('@/features/tickets', () => ({
  historialSolicitudesFuncionario: vi.fn().mockResolvedValue([
    {
      _id: 'sol-1',
      codigoCaso: 'CASO-001',
      descripcion: 'Falla de conectividad en el aula',
      estado: 'en_progreso',
      fecha: '2026-09-27T10:00:00Z',
      ambiente: { nombre: 'Laboratorio 102' },
      tecnico: { nombre: 'Técnico Andrés', correo: 'andres@sena.edu.co', telefono: '3123456789' },
    },
    {
      _id: 'sol-2',
      codigoCaso: 'CASO-002',
      descripcion: 'Lámpara de proyector quemada',
      estado: 'resuelto',
      fecha: '2026-09-26T14:00:00Z',
      ambiente: { nombre: 'Auditorio' },
      solucion: { descripcionSolucion: 'Se reemplazó lámpara por repuesto nuevo' },
    },
  ]),
  getCasosAsignados: vi.fn().mockResolvedValue([
    {
      _id: 'caso-tec-1',
      codigoCaso: 'CASO-002',
      descripcion: 'Impresora no responde a comandos',
      estado: 'en_progreso',
      fecha: '2026-09-27T11:00:00Z',
      ambiente: { nombre: 'Sala de Profesores' },
      usuario: { nombre: 'María Docente' },
      telefono: '3009876543',
      workflowVersion: 2,
      capabilities: {
        canStart: false,
        canUpdate: true,
        canRequestInfo: true,
        canResolve: true,
      },
    },
  ]),
  getCasos: vi.fn().mockResolvedValue({ data: [] }),
  obtenerAmbientes: vi.fn().mockResolvedValue({ data: [] }),
  obtenerTiposCaso: vi.fn().mockResolvedValue({ data: [] }),
  getSolicitudesPendientes: vi.fn().mockResolvedValue([
    {
      _id: 'sol-lider-1',
      codigoCaso: 'CASO-003',
      descripcion: 'Router sin señal de internet',
      estado: 'nuevo',
      workflowVersion: 2,
      capabilities: { canAssign: true, canCancel: true },
      fecha: '2026-09-27T12:00:00Z',
      ambiente: { nombre: 'Piso 3' },
      usuario: { nombre: 'Pedro Líder' },
    },
  ]),
  iniciarAtencion: vi.fn().mockResolvedValue({}),
  agregarActualizacion: vi.fn().mockResolvedValue({}),
  solicitarInformacion: vi.fn().mockResolvedValue({}),
  registrarSolucionParcial: vi.fn().mockResolvedValue({}),
  registrarSolucionTotal: vi.fn().mockResolvedValue({}),
  asignarSolicitudTecnico: vi.fn().mockResolvedValue({}),
  cancelarSolicitud: vi.fn().mockResolvedValue({}),
  responderSolicitud: vi.fn().mockResolvedValue({}),
  confirmarSolucion: vi.fn().mockResolvedValue({}),
  crearSolicitud: vi.fn().mockResolvedValue({}),
  obtenerHistorialCaso: vi.fn().mockResolvedValue([]),
  WorkflowManualRetryNotice: () => null,
  ResolutionModal: () => null,
}))

vi.mock('@/features/users', () => ({
  getTecnicosAprobados: vi.fn().mockResolvedValue({
    tecnicos: [
      { _id: 'tec-1', nombre: 'Técnico Especialista 1', correo: 'tec1@sena.edu.co', telefono: '3001234567' },
    ],
  }),
}))

describe('Visual Rebuild & Architectural Transformation Tests', () => {
  it('Funcionario: Renders Case Journey with status banner and request tray', async () => {
    mockUser = { _id: 'u1', nombre: 'Carlos Usuario', rol: 'funcionario', correo: 'carlos@sena.edu.co' }
    render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    await waitFor(() => {
      // Header y Journey
      expect(screen.getByText(/Mis Solicitudes de Soporte TIC/i)).toBeDefined()
      expect(screen.getAllByText('Falla de conectividad en el aula').length).toBeGreaterThan(0)
      expect(screen.getByText(/Atención en Sitio Activa|Especialista Designado|Recepción & Programación/i)).toBeDefined()
      expect(screen.getAllByText('Lámpara de proyector quemada').length).toBeGreaterThan(0)
    })
  })

  it('Técnico: Active Job Console layout with Work Queue on left and full job workspace on right', async () => {
    mockUser = { _id: 'u1', nombre: 'Carlos Técnico', rol: 'tecnico', correo: 'carlos@sena.edu.co' }
    render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Consola Operativa Técnica/i)).toBeDefined()
      expect(screen.getAllByText('Impresora no responde a comandos').length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /formalizar solución/i })).toBeDefined()
    })
  })

  it('Líder TIC: Dispatch Board unifies ticket decision and specialist picker without duplicate lists', async () => {
    mockUser = { _id: 'u1', nombre: 'Admin User', rol: 'lider', correo: 'admin@sena.edu.co' }
    render(
      <MemoryRouter>
        <AdminSolicitud />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Mando Operativo y Despacho de Soporte/i)).toBeDefined()
      expect(screen.getByText(/Decisiones Pendientes/i)).toBeDefined()
      expect(screen.getAllByText('Router sin señal de internet').length).toBeGreaterThan(0)
      expect(screen.getByText('Técnico Especialista 1')).toBeDefined()
      expect(screen.getByRole('button', { name: /cancelar caso/i })).toBeDefined()
    })
  })
})
