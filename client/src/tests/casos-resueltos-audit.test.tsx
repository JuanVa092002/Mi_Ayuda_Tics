import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CasosResueltosTabla from '@/pages/tecnico/CasosResueltosTabla'
import * as ticketApi from '@/features/tickets'

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { _id: 'tec-1', nombre: 'Andrés Técnico', rol: 'tecnico', correo: 'andres@sena.edu.co' },
    isAuthenticated: true,
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

describe('Técnico — Casos Resueltos Suite de Auditoría y Trazabilidad', () => {
  const mockCasosFinalizados = [
    {
      _id: 'caso-res-1',
      codigoCaso: '2026-10-00101',
      descripcion: '[TIPO: ACADEMICO | PUESTO: 12] Pantalla no proyecta en videobeam EPSON.',
      estado: 'finalizado',
      fecha: '2026-10-04T10:00:00Z',
      ambiente: { _id: 'amb-1', nombre: 'Ambiente 101 - Software' },
      usuario: { _id: 'usr-1', nombre: 'Sandra Milena - Instructora' },
      solucion: {
        descripcionSolucion: 'Se reemplazó cable HDMI y se calibró resolución nativa a 1080p con éxito.',
        evidencia: { url: 'https://cdn.sena.edu.co/evidencia-hdmi.jpg' },
      },
    },
    {
      _id: 'caso-res-2',
      codigoCaso: '2026-10-00102',
      descripcion: 'Boca de red sin enlace en puesto docente.',
      estado: 'resuelto',
      fecha: '2026-10-03T15:30:00Z',
      ambiente: { _id: 'amb-2', nombre: 'Ambiente 202 - Redes' },
      usuario: { _id: 'usr-2', nombre: 'Carlos Coordinador' },
      solucion: {
        descripcionSolucion: 'Crimpeado de conector RJ45 y certificación de enlace gigabit.',
      },
    },
  ]

  const mockHistorialEventos = [
    {
      _id: 'evt-1',
      type: 'created',
      message: 'Solicitud radicada por Sandra Milena.',
      createdAt: '2026-10-04T10:00:00Z',
      author: { nombre: 'Sandra Milena', rol: 'funcionario' },
    },
    {
      _id: 'evt-2',
      type: 'assigned',
      message: 'Asignado a Andrés Técnico.',
      createdAt: '2026-10-04T10:05:00Z',
      author: { nombre: 'Líder TIC', rol: 'lider' },
    },
    {
      _id: 'evt-3',
      type: 'started',
      message: 'Atención técnica iniciada en sitio.',
      createdAt: '2026-10-04T10:15:00Z',
      author: { nombre: 'Andrés Técnico', rol: 'tecnico' },
    },
    {
      _id: 'evt-4',
      type: 'resolved',
      message: 'Solución aplicada: reemplazo de cable HDMI.',
      createdAt: '2026-10-04T10:45:00Z',
      author: { nombre: 'Andrés Técnico', rol: 'tecnico' },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ticketApi, 'getCasosFinalizados').mockResolvedValue(mockCasosFinalizados as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue(mockHistorialEventos as any)
  })

  it('1. Renderiza el histórico de casos resueltos con total items, datos de cierre y thumbnails de evidencia', async () => {
    render(
      <MemoryRouter>
        <CasosResueltosTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Base de Soluciones & Historial Resuelto/i)).toBeInTheDocument()
      expect(screen.getByText(/Explorar Soluciones \(2 casos\)/i)).toBeInTheDocument()
      expect(screen.getByText(/#2026-10-00101/)).toBeInTheDocument()
      expect(screen.getByText(/#2026-10-00102/)).toBeInTheDocument()
      expect(screen.getAllByText(/Ambiente 101 - Software/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Sandra Milena - Instructora/)).toBeInTheDocument()
      expect(screen.getByText(/Se reemplazó cable HDMI/i)).toBeInTheDocument()
    })
  })

  it('2. Búsqueda y filtrado reactivo por ticket, solicitante o solución', async () => {
    render(
      <MemoryRouter>
        <CasosResueltosTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/#2026-10-00101/)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar falla, causa, cable, switch, pc/i)
    fireEvent.change(searchInput, { target: { value: 'Crimpeado' } })

    await waitFor(() => {
      expect(screen.queryByText(/#2026-10-00101/)).not.toBeInTheDocument()
      expect(screen.getByText(/#2026-10-00102/)).toBeInTheDocument()
    })
  })

  it('3. Abre el Drawer de Auditoría y muestra la línea de tiempo completa del caso resuelto', async () => {
    render(
      <MemoryRouter>
        <CasosResueltosTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/#2026-10-00101/)).toBeInTheDocument()
    })

    const auditarBtns = screen.getAllByRole('button', { name: /auditar historial/i })
    fireEvent.click(auditarBtns[0])

    await waitFor(() => {
      expect(screen.getByText(/Auditoría y Trazabilidad del Caso/i)).toBeInTheDocument()
      expect(screen.getByText(/Dictamen de Solución Registrado/i)).toBeInTheDocument()
      expect(screen.getByText(/Línea de Tiempo del Requerimiento/i)).toBeInTheDocument()
      expect(screen.getByText(/Atención técnica iniciada en sitio/i)).toBeInTheDocument()
    })

    const cerrarBtn = screen.getByRole('button', { name: /cerrar auditoría/i })
    fireEvent.click(cerrarBtn)

    await waitFor(() => {
      expect(screen.queryByText(/Auditoría y Trazabilidad del Caso/i)).not.toBeInTheDocument()
    })
  })

  it('4. Abre y cierra el visor de evidencia fotográfica en alta resolución al hacer click en el thumbnail', async () => {
    render(
      <MemoryRouter>
        <CasosResueltosTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTitle(/ver fotografía de evidencia técnica/i)).toBeInTheDocument()
    })

    const thumbBtn = screen.getByTitle(/ver fotografía de evidencia técnica/i)
    fireEvent.click(thumbBtn)

    await waitFor(() => {
      expect(screen.getByText(/Evidencia Fotográfica de la Solución/i)).toBeInTheDocument()
      expect(screen.getByAltText(/evidencia ampliada/i)).toBeInTheDocument()
    })

    const closeImageBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeImageBtn)

    await waitFor(() => {
      expect(screen.queryByText(/Evidencia Fotográfica de la Solución/i)).not.toBeInTheDocument()
    })
  })

  it('5. Alterna entre la vista de tarjetas y la vista compacta de escaneo rápido', async () => {
    render(
      <MemoryRouter>
        <CasosResueltosTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/#2026-10-00101/)).toBeInTheDocument()
    })

    const compactBtn = screen.getByTitle(/vista compacta de escaneo rápido/i)
    fireEvent.click(compactBtn)

    // En vista compacta debe mantenerse la información esencial con el botón Reusar
    await waitFor(() => {
      expect(screen.getByText(/#2026-10-00101/)).toBeInTheDocument()
      expect(screen.getAllByText(/Reusar/i).length).toBeGreaterThan(0)
    })
  })

  it('6. Permite exportar/copiar el informe consolidado SENA al portapapeles', async () => {
    let copiedText = ''
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation((txt: string) => {
          copiedText = txt
          return Promise.resolve()
        }),
      },
    })

    render(
      <MemoryRouter>
        <CasosResueltosTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/#2026-10-00101/)).toBeInTheDocument()
    })

    const exportBtn = screen.getByTitle(/copiar relación completa de casos para el informe mensual/i)
    fireEvent.click(exportBtn)

    await waitFor(() => {
      expect(copiedText).toContain('RELACIÓN DE CASOS DE SOPORTE TIC ATENDIDOS Y RESUELTOS (SENA CTPI)')
      expect(copiedText).toContain('2026-10-00101')
    })
  })
})

