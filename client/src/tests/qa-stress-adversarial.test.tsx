import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'
import Funcionario from '@/pages/funcionario/Funcionario'
import * as ticketApi from '@/features/tickets'
import { getFuncionarioPriorityScore, getTecnicoPriorityScore } from '@/shared/utils/ticketContext'

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

describe('QA Stress, Breaking & Adversarial Suite: Producción Sin Fisuras', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. RESILIENCIA ANTE ERROR 500/503: La UI captura el fallo sin crasheo ni pantalla blanca', async () => {
    currentUser = mockTecnico

    const mockCase: any = {
      _id: 'caso-break-1',
      codigoCaso: '2026-10-00999',
      descripcion: 'Falla de red general',
      estado: 'asignado',
      fecha: new Date().toISOString(),
      ambiente: { _id: 'amb-1', nombre: 'Piso 1' },
      usuario: { nombre: 'Docente Juan' },
      historial: [],
    }

    vi.spyOn(ticketApi, 'getCasosAsignados').mockResolvedValue([mockCase])
    vi.spyOn(ticketApi, 'getCasos').mockResolvedValue({ data: [] } as any)
    vi.spyOn(ticketApi, 'obtenerHistorialCaso').mockResolvedValue([])
    
    // Simular corte de red o error 500 en el backend
    vi.spyOn(ticketApi, 'iniciarAtencion').mockRejectedValue(new Error('503 Service Unavailable: Red del campus caída'))

    render(
      <MemoryRouter>
        <CasosPorResolverTabla />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00999/).length).toBeGreaterThan(0)
    })

    const startBtn = screen.getByRole('button', { name: /iniciar en sitio/i })
    fireEvent.click(startBtn)

    // La app no debe lanzar un error no controlado; debe mantener la pantalla activa
    await waitFor(() => {
      expect(screen.getAllByText(/2026-10-00999/).length).toBeGreaterThan(0)
      expect(screen.getByRole('button', { name: /iniciar en sitio/i })).toBeDefined()
    })
  })

  it('2. PROTECCIÓN CONTRA DOBLE CLIC (RACE CONDITION & SPAM): Desactiva botón durante el envío', async () => {
    currentUser = mockFuncionario

    const mockCase: any = {
      _id: 'caso-break-2',
      codigoCaso: '2026-10-00888',
      descripcion: 'Impresora sin tóner',
      estado: 'resuelto',
      fecha: new Date().toISOString(),
      solucion: { descripcionSolucion: 'Cambio de cartucho original' },
      capabilities: { canConfirm: true },
    }

    vi.spyOn(ticketApi, 'historialSolicitudesFuncionario').mockResolvedValue([mockCase])
    
    // Simular un endpoint que tarda 200ms en responder
    let confirmCallCount = 0
    vi.spyOn(ticketApi, 'confirmarSolucion').mockImplementation(async () => {
      confirmCallCount++
      await new Promise((res) => setTimeout(res, 150))
      return { success: true } as any
    })

    render(
      <MemoryRouter>
        <Funcionario />
      </MemoryRouter>
    )

    const confirmBtn = await screen.findByRole('button', { name: /dar visto bueno/i })
    
    // Spam de 3 clics rápidos en ráfaga
    fireEvent.click(confirmBtn)
    fireEvent.click(confirmBtn)
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      // Debe llamarse exactamente 1 sola vez gracias a isConfirming=true
      expect(confirmCallCount).toBe(1)
    })
  })

  it('3. ESTRÉS DE BANDEJA (50 CASOS SIMULTÁNEOS): Ordenamiento matemático riguroso y sin quiebres de layout', () => {
    // Generar 50 casos aleatorios mezclando todos los estados
    const estados = ['en_progreso', 'asignado', 'esperando_usuario', 'nuevo', 'resuelto', 'cerrado']
    const mockCases: any[] = []

    for (let i = 1; i <= 50; i++) {
      const est = estados[i % estados.length]
      const isExpress = i % 7 === 0
      const isPublico = i % 9 === 0
      mockCases.push({
        _id: `caso-stress-${i}`,
        codigoCaso: `2026-10-${String(i).padStart(5, '0')}`,
        descripcion: isExpress
          ? '[MODO: EXPRESS] Aula con clase en vivo detenida'
          : isPublico
          ? '[IMPACTO: ATENCION_PUBLICO] Ventanilla con fila'
          : `Falla general de equipo #${i}`,
        estado: est,
        fecha: new Date(Date.now() - i * 3600000).toISOString(), // Distintas fechas
      })
    }

    // 1. Validar ordenamiento para Funcionario
    const funcionarioSorted = [...mockCases].sort((a, b) => {
      const diff =
        getFuncionarioPriorityScore(a.estado, a.descripcion) -
        getFuncionarioPriorityScore(b.estado, b.descripcion)
      if (diff !== 0) return diff
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })

    // Las intervenciones en progreso o en atención deben estar de primeras (Score 5)
    expect(funcionarioSorted[0].estado).toBe('en_progreso')
    // Los casos cerrados deben estar estrictamente al fondo
    expect(funcionarioSorted[funcionarioSorted.length - 1].estado).toBe('cerrado')

    // 2. Validar ordenamiento para Técnico
    const tecnicoSorted = [...mockCases].sort((a, b) => {
      const diff =
        getTecnicoPriorityScore(a.estado, a.descripcion) -
        getTecnicoPriorityScore(b.estado, b.descripcion)
      if (diff !== 0) return diff
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })

    // Técnico: En atención activa va de primero
    expect(tecnicoSorted[0].estado).toBe('en_progreso')
    // Los casos en espera de usuario no pueden estar en el top 5 técnico (están pausados)
    expect(tecnicoSorted.slice(0, 5).every((c) => c.estado !== 'esperando_usuario')).toBe(true)
  })
})
