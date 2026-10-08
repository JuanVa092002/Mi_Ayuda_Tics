import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'
import Funcionario from '@/pages/funcionario/Funcionario'
import * as ticketApi from '@/features/tickets'

// Usuarios simulados
const mockTecnico = { _id: 'u-tec-1', nombre: 'Andrés Técnico', rol: 'tecnico', correo: 'andres@sena.edu.co' }
const mockFuncionario = { _id: 'u-func-1', nombre: 'Carlos Docente', rol: 'funcionario', correo: 'carlos@sena.edu.co' }
let currentUser = mockTecnico

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(() => ({
    user: currentUser,
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

describe('QA Deep Stabilization Suite: Ciclo Completo Funcionario ↔ Técnico & Modal de Campo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ticketApi, 'obtenerAmbientes').mockResolvedValue({ data: [{ _id: 'amb-1', nombre: 'Ambiente 101' }] } as any)
    vi.spyOn(ticketApi, 'obtenerTiposCaso').mockResolvedValue({ data: [{ _id: 'tc-1', nombre: 'Falla Técnica' }] } as any)
  })

  it('1. FLUJO COMPLETO: Técnico inicia en sitio, registra bitácora con chips y funcionario recibe la actualización', async () => {
    currentUser = mockTecnico

    const mockCase: any = {
      _id: 'caso-field-101',
      codigoCaso: '2026-10-00101',
      descripcion: '[TIPO: ACADEMICO | MODO: EXPRESS | PUESTO: P-12 | EQUIPO: VIDEOBEAM]\nProyector no da video en clase presencial',
      estado: 'asignado',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-1', nombre: 'Sistemas 1' },
      usuario: { _id: 'u-func-1', nombre: 'Carlos Docente', telefono: '3101112233' },
      telefono: '3101112233',
      historial: [],
    }

    vi.spyOn(ticketApi, 'getCasosAsignados').mockResolvedValue([mockCase])
    vi.spyOn(ticketApi, 'getCasos').mockResolvedValue({ data: [{ _id: 'tc-1', nombre: 'Hardware' }] } as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue([])
    vi.spyOn(ticketApi, 'iniciarAtencion').mockImplementation(async () => {
      mockCase.estado = 'en_progreso'
      return { success: true } as any
    })
    vi.spyOn(ticketApi, 'agregarActualizacion').mockImplementation(async (_id, msg) => {
      mockCase.historial.push({
        _id: 'hist-1',
        type: 'diagnostic_updated',
        message: msg,
        createdAt: new Date().toISOString(),
        author: { nombre: 'Andrés Técnico', rol: 'tecnico' },
      } as any)
      return { success: true } as any
    })

    const { unmount } = render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    // Esperar a que cargue la consola técnica
    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00101/).length).toBeGreaterThan(0)
    })

    // 1. Accionar "Iniciar en sitio"
    const startBtn = screen.getByRole('button', { name: /iniciar en sitio/i })
    expect(startBtn).toBeDefined()
    fireEvent.click(startBtn)

    await waitFor(() => {
      expect(ticketApi.iniciarAtencion).toHaveBeenCalledWith('caso-field-101')
    })

    // 2. Abrir Modal de Intervención de Campo
    const openModalBtn = await screen.findByRole('button', { name: /intervención de campo/i })
    expect(openModalBtn).toBeDefined()
    fireEvent.click(openModalBtn)

    await waitFor(() => {
      expect(screen.getByText(/1\. Bitácora de Campo/i)).toBeDefined()
      expect(screen.getByText(/2\. Consultar al Funcionario/i)).toBeDefined()
    })

    // 3. Probar chips predefinidos de Bitácora
    const chipHardware = screen.getByText(/Diagnóstico de hardware/i)
    fireEvent.click(chipHardware)

    const textarea = screen.getByPlaceholderText(/describe qué componentes verificaste/i) as HTMLTextAreaElement
    expect(textarea.value).toContain('Diagnóstico de hardware y pruebas de encendido concluidas.')

    // 4. Cambiar a otro chip de red para probar reemplazo directo del atajo
    const chipRed = screen.getByText(/Reemplazo de patch cord/i)
    fireEvent.click(chipRed)
    expect(textarea.value).toContain('Reemplazo de patch cord')
    expect(textarea.value).not.toContain('Diagnóstico de hardware')

    // 5. Guardar bitácora
    const submitBtn = screen.getByRole('button', { name: /registrar en bitácora/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(ticketApi.agregarActualizacion).toHaveBeenCalledWith(
        'caso-field-101',
        expect.stringContaining('Reemplazo de patch cord')
      )
    })

    unmount()

    // 6. Verificar que el Funcionario ve la bitácora en su vista
    currentUser = mockFuncionario
    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockResolvedValue([mockCase])

    const { unmount: unmountFunc1 } = render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/En atención activa/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Atención en Sitio Activa/i).length).toBeGreaterThan(0)
    })

    unmountFunc1()
  })

  it('2. MODAL DE INTERVENCIÓN - PESTAÑA CONSULTA: Bloqueo operativo a esperando_usuario y respuesta del funcionario', async () => {
    currentUser = mockTecnico

    const mockCase: any = {
      _id: 'caso-field-102',
      codigoCaso: '2026-10-00102',
      descripcion: 'PC administrativo no detecta impresora en ventanilla',
      estado: 'en_progreso',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-2', nombre: 'Matrículas' },
      usuario: { _id: 'u-func-1', nombre: 'Carlos Docente', telefono: '3101112233' },
      telefono: '3101112233',
      historial: [],
    }

    vi.spyOn(ticketApi, 'getCasosAsignados').mockResolvedValue([mockCase])
    vi.spyOn(ticketApi, 'getCasos').mockResolvedValue({ data: [] } as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue([])
    vi.spyOn(ticketApi, 'solicitarInformacion').mockImplementation(async (_id, msg) => {
      mockCase.estado = 'esperando_usuario'
      mockCase.historial.push({
        _id: 'hist-q1',
        type: 'waiting_for_requester',
        message: msg,
        createdAt: new Date().toISOString(),
      } as any)
      return { success: true } as any
    })

    const { unmount } = render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00102/).length).toBeGreaterThan(0)
    })

    // Abrir Modal de Intervención de Campo
    const openModalBtn = await screen.findByRole('button', { name: /intervención de campo/i })
    fireEvent.click(openModalBtn)

    await waitFor(() => {
      expect(screen.getByText(/1\. Bitácora de Campo/i)).toBeDefined()
    })

    // Cambiar a la pestaña "Consultar al Funcionario"
    const tabConsulta = screen.getByRole('button', { name: /2\. Consultar al Funcionario/i })
    fireEvent.click(tabConsulta)

    // Seleccionar chip predefinido de consulta de credenciales
    const chipCredenciales = screen.getByText(/Requerimos que inicies sesión en tu perfil/i)
    fireEvent.click(chipCredenciales)

    const textareaConsulta = screen.getByPlaceholderText(/indica claramente qué requieres para continuar/i) as HTMLTextAreaElement
    expect(textareaConsulta.value).toContain('Requerimos que inicies sesión')

    // Enviar consulta
    const sendConsultaBtn = screen.getByRole('button', { name: /enviar y poner en espera/i })
    fireEvent.click(sendConsultaBtn)

    await waitFor(() => {
      expect(ticketApi.solicitarInformacion).toHaveBeenCalledWith(
        'caso-field-102',
        expect.stringContaining('Requerimos que inicies sesión')
      )
    })

    unmount()

    // Comprobar que en Funcionario aparece el banner de respuesta requerida y puede responder
    currentUser = mockFuncionario
    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockResolvedValue([mockCase])
    vi.spyOn(ticketApi, 'responderSolicitud').mockImplementation(async () => {
      mockCase.estado = 'en_progreso'
      return { success: true } as any
    })

    const { unmount: unmountFuncionario } = render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/El técnico necesita tu respuesta/i)).toBeDefined()
      expect(screen.getByPlaceholderText(/escribe aquí tu aclaración/i)).toBeDefined()
    })

    // Funcionario envía su respuesta
    const replyInput = screen.getByPlaceholderText(/escribe aquí tu aclaración/i)
    fireEvent.change(replyInput, { target: { value: 'Ya inicié sesión y estoy en el puesto disponible' } })
    const replyBtn = screen.getByRole('button', { name: /enviar respuesta/i })
    fireEvent.click(replyBtn)

    await waitFor(() => {
      expect(ticketApi.responderSolicitud).toHaveBeenCalledWith(
        'caso-field-102',
        'Ya inicié sesión y estoy en el puesto disponible'
      )
    })

    unmountFuncionario()
  })

  it('3. FORMALIZACIÓN Y VISTO BUENO: Funcionario da visto bueno con actualización optimista', async () => {
    currentUser = mockFuncionario

    const mockResolvedCase: any = {
      _id: 'caso-field-103',
      codigoCaso: '2026-10-00103',
      descripcion: 'Teclado no responde',
      estado: 'resuelto',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-3', nombre: 'Taller 2' },
      solucion: {
        descripcionSolucion: 'Se reconectó el cable USB en puerto trasero 3.0 funcional.',
      },
      historial: [],
      capabilities: {
        canConfirm: true,
      },
    }

    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockResolvedValue([mockResolvedCase])
    vi.spyOn(ticketApi, 'confirmarSolucion').mockImplementation(async () => {
      mockResolvedCase.estado = 'cerrado'
      return { success: true, solicitud: { estado: 'cerrado' } } as any
    })

    const { unmount } = render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    // Funcionario debe ver el llamado a validar y el botón de Visto Bueno
    await waitFor(() => {
      expect(screen.getByText(/Solución Técnica Lista/i)).toBeDefined()
      expect(screen.getByRole('button', { name: /dar visto bueno/i })).toBeDefined()
    })

    const confirmBtn = screen.getByRole('button', { name: /dar visto bueno/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(ticketApi.confirmarSolucion).toHaveBeenCalledWith('caso-field-103')
    })

    unmount()
  })

  it('4. BLINDAJE DE IDENTIDAD: Funcionario y técnico se representan fidedignamente sin falsos rótulos de Mesa TIC', async () => {
    const mockJuanPerez = { _id: 'u-func-juan', nombre: 'Juan Perez', rol: 'funcionario', correo: 'juan@sena.edu.co' }
    currentUser = mockJuanPerez

    const mockInteractiveCase: any = {
      _id: 'caso-field-104',
      codigoCaso: '2026-10-00104',
      descripcion: 'Falla en monitor',
      estado: 'en_progreso',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-1', nombre: 'Ambiente 101' },
      usuario: { _id: 'u-func-juan', nombre: 'Juan Perez', rol: 'funcionario' },
      tecnico: { _id: 'u-tec-1', nombre: 'Rafael Pastas', rol: 'tecnico' },
      historial: [
        {
          _id: 'evt-1',
          type: 'created',
          message: 'Solicitud registrada.',
          createdAt: new Date().toISOString(),
          author: { _id: 'u-func-juan', nombre: 'Juan Perez', rol: 'funcionario' },
        },
        {
          _id: 'evt-2',
          type: 'waiting_for_requester',
          message: '¿Te encuentras en la oficina/aula para darnos acceso físico al equipo?',
          createdAt: new Date().toISOString(),
          author: { _id: 'u-tec-1', nombre: 'Rafael Pastas', rol: 'tecnico' },
        },
        {
          _id: 'evt-3',
          type: 'requester_reply',
          message: 'Si me encuentro en el Aula. Esperandolos',
          createdAt: new Date().toISOString(),
          author: { _id: 'u-func-juan', nombre: 'Juan Perez', rol: 'funcionario' },
        },
      ],
    }

    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockResolvedValue([mockInteractiveCase])
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue(mockInteractiveCase.historial)

    const { unmount } = render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    // Esperar a que cargue el caso y se renderice el detalle
    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00104/).length).toBeGreaterThan(0)
    })

    const openHistoryBtn = await screen.findByRole('button', { name: /ver historial del caso/i })
    fireEvent.click(openHistoryBtn)

    // Verificar que la respuesta de Juan Perez aparece como Tú (Solicitante) y NO como Mesa TIC
    await waitFor(() => {
      // Si el drawer está sincronizando o abierto
      const match = screen.queryByText(/Si me encuentro en el Aula/i)
      if (!match) {
        // ver si está el spinner
        const loading = screen.queryByText(/Sincronizando historial/i)
        if (loading) throw new Error('Still loading history')
        const drawerClose = screen.queryByText(/Cerrar Historial/i)
        if (!drawerClose) throw new Error('Drawer not open yet')
        throw new Error('Text not found in drawer')
      }
      expect(match).toBeDefined()
      expect(screen.getAllByText(/Tú \(Solicitante\)/i).length).toBeGreaterThan(0)
      expect(screen.queryByText(/MESA TIC.*Juan Perez.*Gestión Operativa/i)).toBeNull()
    })

    unmount()
  })
})

