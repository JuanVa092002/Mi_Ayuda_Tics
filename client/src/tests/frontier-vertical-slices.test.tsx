import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'
import AdminSolicitud from '@/pages/admin/AdminSolicitud'
import Funcionario from '@/pages/funcionario/Funcionario'
import * as ticketApi from '@/features/tickets'
import { ExperienceProvider } from '@/shared/experiments/ExperienceContext'

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
      _id: 'sol-func-1',
      codigoCaso: 'CASO-100',
      descripcion: 'Falla de conexión en proyector',
      estado: 'en_progreso',
      fecha: '2026-09-28T08:00:00Z',
      ambiente: { nombre: 'Laboratorio Redes' },
      tecnico: { nombre: 'Andrés Técnico', telefono: '3120000000' },
    },
    {
      _id: 'sol-func-2',
      codigoCaso: 'CASO-099',
      descripcion: 'Mouse inalámbrico no empareja',
      estado: 'resuelto',
      fecha: '2026-09-27T08:00:00Z',
      ambiente: { nombre: 'Sala 3' },
      solucion: { descripcionSolucion: 'Cambio de baterías y receptor USB' },
    },
  ]),
  getCasosAsignados: vi.fn().mockResolvedValue([
    {
      _id: 'caso-tec-1',
      codigoCaso: 'CASO-201',
      descripcion: 'Equipo no enciende en aula 101',
      estado: 'asignado',
      fecha: '2026-09-28T09:00:00Z',
      ambiente: { nombre: 'Aula 101' },
      usuario: { nombre: 'Docente Juan' },
      telefono: '3101234567',
      workflowVersion: 2,
      capabilities: {
        canStart: true,
        canUpdate: false,
        canRequestInfo: false,
        canResolve: false,
      },
    },
    {
      _id: 'caso-tec-2',
      codigoCaso: 'CASO-202',
      descripcion: 'Actualizar paquetes en servidor local',
      estado: 'en_progreso',
      fecha: '2026-09-28T10:00:00Z',
      ambiente: { nombre: 'Data Center' },
      usuario: { nombre: 'Administrador Redes' },
      telefono: '3157654321',
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
  getSolicitudesPendientes: vi.fn().mockResolvedValue([
    {
      _id: 'sol-lider-10',
      codigoCaso: 'CASO-301',
      descripcion: 'Pantalla de televisor con líneas verticales',
      estado: 'solicitado',
      fecha: '2026-09-28T07:30:00Z',
      ambiente: { nombre: 'Auditorio Principal' },
      usuario: { nombre: 'Coordinador Académico' },
      telefono: '3209876543',
    },
  ]),
  iniciarAtencion: vi.fn().mockResolvedValue({}),
  agregarActualizacion: vi.fn().mockResolvedValue({}),
  solicitarInformacion: vi.fn().mockResolvedValue({}),
  registrarSolucionParcial: vi.fn().mockResolvedValue({}),
  registrarSolucionTotal: vi.fn().mockResolvedValue({}),
  asignarSolicitudTecnico: vi.fn().mockResolvedValue({}),
  cancelarSolicitud: vi.fn().mockResolvedValue({}),
  obtenerAmbientes: vi.fn().mockResolvedValue({ data: [] }),
  obtenerTiposCaso: vi.fn().mockResolvedValue({ data: [] }),
  crearSolicitud: vi.fn().mockResolvedValue({}),
  obtenerHistorialCaso: vi.fn().mockResolvedValue([
    {
      _id: 'evt-1',
      type: 'created',
      message: 'Solicitud registrada.',
      createdAt: '2026-09-28T09:00:00Z',
      author: { nombre: 'Docente Juan', rol: 'funcionario' },
    },
    {
      _id: 'evt-2',
      type: 'assigned',
      message: 'Caso asignado a técnico.',
      createdAt: '2026-09-28T09:05:00Z',
      author: { nombre: 'Líder TIC', rol: 'lider' },
    },
  ]),
  WorkflowManualRetryNotice: () => null,
  ResolutionModal: (props: any) =>
    props.isOpen ? <div>Formalizar Solución Técnica</div> : null,
}))

vi.mock('@/features/users', () => ({
  getTecnicosAprobados: vi.fn().mockResolvedValue({
    tecnicos: [
      { _id: 'tec-spec-1', nombre: 'Carlos Especialista', correo: 'carlos@sena.edu.co', telefono: '3011112233' },
      { _id: 'tec-spec-2', nombre: 'Laura Redes', correo: 'laura@sena.edu.co', telefono: '3022223344' },
    ],
  }),
}))

describe('Frontier Role Vertical Slices & Interaction Workflows', () => {
  it('Técnico: Interacts with active job, triggers start attention and can open resolution drawer', async () => {
    mockUser = { _id: 'u1', nombre: 'Carlos Técnico', rol: 'tecnico', correo: 'carlos@sena.edu.co' }
    render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Equipo no enciende en aula 101').length).toBeGreaterThan(0)
    })

    // Click the assigned case in the queue to make it the active job
    const queueItem = screen.getAllByText('Equipo no enciende en aula 101')[0]
    fireEvent.click(queueItem)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciar en sitio/i })).toBeDefined()
    })

    const startBtn = screen.getByRole('button', { name: /iniciar en sitio/i })
    fireEvent.click(startBtn)
    expect(ticketApi.iniciarAtencion).toHaveBeenCalledWith('caso-tec-1')

    // Click in-progress case to test bitácora & resolution workflow drawers
    const inProgressBtn = screen.getByRole('button', { name: /CASO-202/i })
    fireEvent.click(inProgressBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /formalizar solución/i })).toBeDefined()
      expect(screen.getByRole('button', { name: /intervención de campo/i })).toBeDefined()
    })

    // Open bitácora modal
    const bitacoraBtn = screen.getByRole('button', { name: /intervención de campo/i })
    fireEvent.click(bitacoraBtn)
    await waitFor(() => {
      expect(screen.getByText(/Centro de Intervención en Sitio/i)).toBeDefined()
    })

    // Close bitácora modal
    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)

    // Open resolution modal
    const resolverBtn = screen.getByRole('button', { name: /formalizar solución/i })
    fireEvent.click(resolverBtn)
    await waitFor(() => {
      expect(screen.getByText(/Formalizar Solución Técnica/i)).toBeDefined()
    })
  })

  it('Líder TIC: Selects ticket, displays candidate specialists and dispatches specialist in 1-click', async () => {
    mockUser = { _id: 'u1', nombre: 'Admin User', rol: 'lider', correo: 'admin@sena.edu.co' }
    render(
      <MemoryRouter>
        <AdminSolicitud />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Pantalla de televisor con líneas verticales').length).toBeGreaterThan(0)
      expect(screen.getByText('Carlos Especialista')).toBeDefined()
      expect(screen.getByText('Laura Redes')).toBeDefined()
    })

    const assignBtns = screen.getAllByRole('button', { name: /despachar|asignar/i })
    expect(assignBtns.length).toBeGreaterThan(0)
    fireEvent.click(assignBtns[0])
    expect(ticketApi.asignarSolicitudTecnico).toHaveBeenCalledWith('sol-lider-10', { tecnico: 'tec-spec-1' })
  })

  it('Funcionario: Views active journey guidance and request history tray', async () => {
    mockUser = { _id: 'u1', nombre: 'Carlos Usuario', rol: 'funcionario', correo: 'carlos@sena.edu.co' }
    render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Falla de conexión en proyector').length).toBeGreaterThan(0)
      expect(screen.getByText(/Atención en Sitio Activa|Especialista Designado|Recepción & Programación/i)).toBeDefined()
      expect(screen.getByText('Mouse inalámbrico no empareja')).toBeDefined()
      expect(screen.getByRole('button', { name: /radicar solicitud/i })).toBeDefined()
    })
  })

  it('Experience Lab: Renders role-specific variants with distinct mental models, copy, and CTAs', async () => {
    // 1. Funcionario Workbench
    mockUser = { _id: 'u1', nombre: 'Carlos Usuario', rol: 'funcionario', correo: 'carlos@sena.edu.co' }
    const { unmount: unmountF } = render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText(/Mis Solicitudes de Soporte TIC/i)).toBeDefined()
      expect(screen.getAllByText('Falla de conexión en proyector').length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /radicar solicitud/i })).toBeDefined()
    })
    unmountF()

    // 2. Técnico Console
    mockUser = { _id: 'u1', nombre: 'Carlos Técnico', rol: 'tecnico', correo: 'carlos@sena.edu.co' }
    const { unmount: unmountT } = render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getAllByText('Equipo no enciende en aula 101').length).toBeGreaterThan(0)
      expect(screen.getByText(/Consola Operativa Técnica/i)).toBeDefined()
      expect(screen.getByText(/Ver Historial del Caso/i)).toBeDefined()
    })
    unmountT()

    // 3. Líder TIC L2 (Ganador por defecto) vs L1 vs L3
    mockUser = { _id: 'u1', nombre: 'Admin User', rol: 'lider', correo: 'admin@sena.edu.co' }
    const { unmount: unmountL2 } = render(
      <MemoryRouter initialEntries={['/adminSolicitud?l_variant=l2-decision-queue']}>
        <ExperienceProvider>
          <AdminSolicitud />
        </ExperienceProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText(/Decisiones Pendientes/i)).toBeDefined()
      expect(screen.queryByLabelText(/Seleccionar solicitud/i)).toBeNull()
    })
    unmountL2()

    const { unmount: unmountL1 } = render(
      <MemoryRouter initialEntries={['/adminSolicitud?l_variant=l1-dispatch-desk']}>
        <ExperienceProvider>
          <AdminSolicitud />
        </ExperienceProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText(/Decisiones Pendientes/i)).toBeDefined()
      expect(screen.queryByText(/Mesa de Despacho Operativo/i)).toBeNull()
    })
    unmountL1()

    const { unmount: unmountL3 } = render(
      <MemoryRouter initialEntries={['/adminSolicitud?l_variant=l3-exception-center']}>
        <ExperienceProvider>
          <AdminSolicitud />
        </ExperienceProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText(/Decisiones Pendientes/i)).toBeDefined()
      expect(screen.queryByText(/Centro de Excepciones Operativas/i)).toBeNull()
    })
    unmountL3()
  })
})

