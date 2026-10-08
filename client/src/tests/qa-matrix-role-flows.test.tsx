import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Funcionario from '@/pages/funcionario/Funcionario'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'
import * as ticketApi from '@/features/tickets'

// Actores de pruebas funcionales
const funcionarioReal = {
  _id: 'usr-fun-99',
  nombre: 'Sandra Milena - Instructora CTPI',
  rol: 'funcionario',
  correo: 'smilena@sena.edu.co',
}

const tecnicoReal = {
  _id: 'usr-tec-88',
  nombre: 'Jorge Técnico Especialista',
  rol: 'tecnico',
  correo: 'jorge.tec@sena.edu.co',
}

let activeUser: any = funcionarioReal

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(() => ({
    user: activeUser,
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

describe('QA Extremo de Producción — Creación Real de Solicitudes y Ciclo de Vida 360° Funcionario ↔ Técnico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. FUNCIONARIO: Radicación de una nueva solicitud con enriquecimiento, visualización en cola y estado inicial', async () => {
    activeUser = funcionarioReal

    const catalogoAmbientes = [
      { _id: 'amb-201', nombre: 'Ambiente 201 - Telemática', activo: true },
      { _id: 'amb-202', nombre: 'Ambiente 202 - Redes', activo: true },
    ]
    const catalogoTipos = [
      { _id: 'tc-red', nombre: 'Conectividad y Red' },
      { _id: 'tc-soft', nombre: 'Software Educativo' },
    ]

    const solicitudesDb: any[] = []

    vi.spyOn(ticketApi, 'obtenerAmbientes').mockResolvedValue({ data: catalogoAmbientes } as any)
    vi.spyOn(ticketApi, 'obtenerTiposCaso').mockResolvedValue({ data: catalogoTipos } as any)
    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockImplementation(async () => [...solicitudesDb])
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue([])

    const crearSolicitudSpy = vi.spyOn(ticketApi, 'crearSolicitud').mockImplementation(async (payload: any) => {
      const getField = (key: string) => payload instanceof FormData ? (payload.get(key) as string) : payload[key]
      const nuevoTicket = {
        _id: 'tk-creado-001',
        codigoCaso: '2026-10-00888',
        descripcion: getField('descripcion') || '',
        estado: 'nuevo',
        fecha: new Date().toISOString(),
        ambiente: catalogoAmbientes.find((a) => a._id === getField('ambiente')),
        tipoCaso: catalogoTipos.find((t) => t._id === (getField('tipoCaso') || getField('tipo_caso'))),
        usuario: funcionarioReal,
        capabilities: { canReply: false, canConfirm: false, canReopen: false },
        historial: [],
      }
      solicitudesDb.unshift(nuevoTicket)
      return nuevoTicket as any
    })

    render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    // Verificar estado inicial vacío
    await waitFor(() => {
      expect(screen.getByText(/no hay solicitudes en esta vista/i)).toBeInTheDocument()
    })

    // Abrir modal de radicar solicitud
    const radicarBtn = screen.getByRole('button', { name: /radicar solicitud/i })
    fireEvent.click(radicarBtn)

    // Validar apertura del modal
    expect(screen.getByText(/radicar solicitud de soporte tic/i)).toBeInTheDocument()

    // Seleccionar ambiente usando el chip o el buscador predictivo
    const inputAmbiente = screen.getByPlaceholderText(/escribe para buscar aula/i)
    fireEvent.change(inputAmbiente, { target: { value: 'Telemática' } })

    const optionAmbiente = await screen.findByRole('button', { name: /ambiente 201 - telemática/i })
    fireEvent.click(optionAmbiente)

    // Seleccionar síntoma inicial: Pantalla o Proyector
    const sintomaPantalla = screen.getByRole('button', { name: /pantalla o proyector/i })
    fireEvent.click(sintomaPantalla)

    // Validar que la descripción inicial sea la plantilla de Pantalla o Proyector
    const textareaDesc = screen.getByPlaceholderText(/detalla qué ocurre o qué mensaje muestra la pantalla/i) as HTMLTextAreaElement
    expect(textareaDesc.value).toContain('proyector / monitor no da señal de video')

    // CAMBIO LIBRE DE SÍNTOMA: Funcionario cambia de opinión y selecciona Red e Internet
    const sintomaRed = screen.getByRole('button', { name: /red e internet/i })
    fireEvent.click(sintomaRed)

    // Validar que la plantilla se actualizó dinámicamente a la de Red e Internet y no se quedó atascada
    expect(textareaDesc.value).toContain('Falla de conexión a internet institucional')

    // VALIDACIÓN DE AUTONOMÍA: Seleccionar un síntoma NO activa Urgente automáticamente
    // El botón de urgencia debe permanecer en 'NO' por defecto y no marcarse como urgente
    const botonesNo = screen.getAllByRole('button', { name: /^no$/i })
    expect(botonesNo.length).toBeGreaterThan(0)
    expect(screen.queryByText(/🚨 sí, urgente/i)).not.toBeInTheDocument()

    // LIBERTAD TOTAL DE PUESTO/EQUIPO: Funcionario puede escribir cualquier detalle sin bloqueos
    const inputPuesto = screen.getByPlaceholderText(/ej: toda el aula, proyector techo, pc 14/i)
    fireEvent.change(inputPuesto, { target: { value: 'Proyector EPSON Techo y Puesto 3' } })

    // Enriquecer descripción con chip contextual
    const chipWifi = screen.getByRole('button', { name: /\+ wi-fi no conecta/i })
    fireEvent.click(chipWifi)

    // Confirmar y radicar
    const submitBtn = screen.getByRole('button', { name: /confirmar y radicar/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(crearSolicitudSpy).toHaveBeenCalled()
    })

    // Validar que el payload contenga la descripción de Red e Internet con el chip y el puesto libremente digitado
    const sentPayload: any = crearSolicitudSpy.mock.calls[0][0]
    const sentDesc = sentPayload instanceof FormData ? (sentPayload.get('descripcion') as string) : sentPayload.descripcion
    expect(sentDesc).toContain('Falla de conexión a internet institucional')
    expect(sentDesc).toContain('PUESTO: Proyector EPSON Techo y Puesto 3')

    // Validar que el ticket aparezca de inmediato en la cola del funcionario con su código
    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00888/).length).toBeGreaterThan(0)
    })
  })

  it('2. TÉCNICO: Triage de caso recién asignado, inicio de atención en sitio y registro de bitácora técnica', async () => {
    activeUser = tecnicoReal

    const ticketEnCola: any = {
      _id: 'tk-creado-001',
      codigoCaso: '2026-10-00888',
      descripcion: 'Switch no enciende los puertos de los puestos 4 y 5',
      estado: 'asignado',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-201', nombre: 'Ambiente 201 - Telemática' },
      tipoCaso: { _id: 'tc-red', nombre: 'Conectividad y Red' },
      usuario: funcionarioReal,
      tecnico: tecnicoReal,
      historial: [],
    }

    vi.spyOn(ticketApi, 'getCasosAsignados').mockResolvedValue([ticketEnCola])
    vi.spyOn(ticketApi, 'getCasos').mockResolvedValue({ data: [{ _id: 'tc-red', nombre: 'Conectividad y Red' }] } as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue([])

    const iniciarAtencionSpy = vi.spyOn(ticketApi, 'iniciarAtencion').mockImplementation(async () => {
      ticketEnCola.estado = 'en_progreso'
      return { success: true } as any
    })

    const agregarActualizacionSpy = vi.spyOn(ticketApi, 'agregarActualizacion').mockImplementation(async (_id, msg) => {
      ticketEnCola.historial.push({
        _id: 'ev-1',
        type: 'updated',
        message: msg,
        createdAt: new Date().toISOString(),
        author: tecnicoReal,
      })
      return { success: true } as any
    })

    render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    // Localizar ticket en la lista de trabajo del técnico
    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00888/).length).toBeGreaterThan(0)
    })

    // Iniciar atención en sitio
    const iniciarBtn = screen.getByRole('button', { name: /iniciar en sitio/i })
    fireEvent.click(iniciarBtn)

    await waitFor(() => {
      expect(iniciarAtencionSpy).toHaveBeenCalledWith('tk-creado-001')
    })

    // Abrir modal de intervención de campo
    const bitacoraBtn = await screen.findByRole('button', { name: /intervención de campo/i })
    fireEvent.click(bitacoraBtn)

    await waitFor(() => {
      expect(screen.getByText(/1\. Bitácora de Campo/i)).toBeInTheDocument()
    })

    // Probar chip rápido de bitácora
    const chipCable = screen.getByText(/Diagnóstico de hardware/i)
    fireEvent.click(chipCable)

    // Guardar avance en bitácora
    const guardarNotaBtn = screen.getByRole('button', { name: /registrar en bitácora/i })
    fireEvent.click(guardarNotaBtn)

    await waitFor(() => {
      expect(agregarActualizacionSpy).toHaveBeenCalledWith(
        'tk-creado-001',
        expect.stringContaining('Diagnóstico de hardware y pruebas de encendido concluidas.')
      )
    })
  })

  it('3. INTERACCIÓN SIMULTÁNEA: Técnico solicita credenciales / funcionario responde y desbloquea el caso', async () => {
    // A. Técnico solicita información
    activeUser = tecnicoReal
    const ticketEsperando: any = {
      _id: 'tk-creado-001',
      codigoCaso: '2026-10-00888',
      descripcion: 'Switch no enciende los puertos de los puestos 4 y 5',
      estado: 'en_progreso',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-201', nombre: 'Ambiente 201 - Telemática' },
      tipoCaso: { _id: 'tc-red', nombre: 'Conectividad y Red' },
      usuario: funcionarioReal,
      tecnico: tecnicoReal,
      historial: [],
    }

    vi.spyOn(ticketApi, 'getCasosAsignados').mockResolvedValue([ticketEsperando])
    vi.spyOn(ticketApi, 'getCasos').mockResolvedValue({ data: [{ _id: 'tc-red', nombre: 'Conectividad y Red' }] } as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue([])

    const solicitarInfoSpy = vi.spyOn(ticketApi, 'solicitarInformacion').mockImplementation(async (_id, req) => {
      ticketEsperando.estado = 'esperando_usuario'
      ticketEsperando.historial.push({
        _id: 'ev-req-1',
        type: 'waiting_for_requester',
        message: req,
        createdAt: new Date().toISOString(),
        author: tecnicoReal,
      })
      return { success: true } as any
    })

    const { unmount } = render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00888/).length).toBeGreaterThan(0)
    })

    // Abrir modal de intervención de campo
    const interBtn = await screen.findByRole('button', { name: /intervención de campo/i })
    fireEvent.click(interBtn)

    await waitFor(() => {
      expect(screen.getByText(/2\. Consultar al Funcionario/i)).toBeInTheDocument()
    })

    // Cambiar a pestaña de consulta
    const tabConsulta = screen.getByText(/2\. Consultar al Funcionario/i)
    fireEvent.click(tabConsulta)

    // Seleccionar chip rápido de credenciales
    const chipCred = screen.getByText(/Requerimos que inicies sesión en tu perfil/i)
    fireEvent.click(chipCred)

    // Enviar y poner en espera
    const enviarEsperaBtn = screen.getByRole('button', { name: /enviar y poner en espera/i })
    fireEvent.click(enviarEsperaBtn)

    await waitFor(() => {
      expect(solicitarInfoSpy).toHaveBeenCalledWith(
        'tk-creado-001',
        expect.stringContaining('Requerimos que inicies sesión en tu perfil')
      )
    })

    unmount()

    // B. Funcionario recibe el banner de alerta y responde
    activeUser = funcionarioReal
    ticketEsperando.capabilities = { canReply: true, canConfirm: false, canReopen: false }

    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockResolvedValue([ticketEsperando])
    vi.spyOn(ticketApi, 'obtenerAmbientes').mockResolvedValue({ data: [] } as any)
    vi.spyOn(ticketApi, 'obtenerTiposCaso').mockResolvedValue({ data: [] } as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue(ticketEsperando.historial)

    const responderInfoSpy = vi.spyOn(ticketApi, 'responderSolicitud').mockImplementation(async (_id, _resp) => {
      ticketEsperando.estado = 'en_progreso'
      ticketEsperando.capabilities.canReply = false
      return { solicitud: { ...ticketEsperando, estado: 'en_progreso' } } as any
    })

    render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    // Validar presencia del banner de atención requerida
    await waitFor(() => {
      expect(screen.getByText(/El técnico necesita tu respuesta/i)).toBeInTheDocument()
    })

    // Escribir y enviar respuesta
    const inputRespuesta = screen.getByPlaceholderText(/escribe aquí tu aclaración/i)
    fireEvent.change(inputRespuesta, { target: { value: 'Usuario admin / clave Sena2026* asignada' } })

    const enviarRespBtn = screen.getByRole('button', { name: /enviar respuesta/i })
    fireEvent.click(enviarRespBtn)

    await waitFor(() => {
      expect(responderInfoSpy).toHaveBeenCalledWith(
        'tk-creado-001',
        'Usuario admin / clave Sena2026* asignada'
      )
    })
  })
})
