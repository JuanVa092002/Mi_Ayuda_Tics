import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { getApiErrorMessage } from '@/shared/api/apiError'
import {
  AppShell,
  SearchField,
  PaginationFooter,
  StatusBadge,
  AdaptiveSkeletonList,
  AdaptiveSkeletonDetail,
  SemanticIcon,
  FeedbackBanner,
  InlineAlert,
  toast,
} from '@/shared/ui'
import {
  ResolutionModal,
  getCasosAsignados,
  getCasos,
  submitSolucionCaso,
  iniciarAtencion,
  agregarActualizacion,
  solicitarInformacion,
  registrarSolucionTotal,
  registrarSolucionParcial,
  obtenerHistorialCaso,
  WorkflowManualRetryNotice,
} from '@/features/tickets'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import type { CaseForResolution, Solicitud, TipoCaso, TipoSolucion } from '@/shared/types'
import { FuncionarioTimeline } from '@/pages/funcionario/components/FuncionarioTimeline'
import { InterventionActionModal, type InterventionTab } from './components/InterventionActionModal'
import { IncidentHeaderABVariants } from './components/IncidentHeaderABVariants'
import { parseEnrichedDescription, detectVisualSymptom, getTecnicoPriorityScore } from '@/shared/utils/ticketContext'

type TecnicoQueueFilter = 'todos' | 'en_atencion' | 'por_iniciar' | 'esperando_usuario'
type SortMode = 'urgency' | 'location'

export default function CasosPorResolverTabla(): ReactNode {
  const [cases, setCases] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseForResolution | null>(null)
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null)
  const [caseTypes, setCaseTypes] = useState<TipoCaso[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Modal unificado de Intervención Operativa (Bitácora & Consulta al Funcionario)
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false)
  const [interventionInitialTab, setInterventionInitialTab] = useState<InterventionTab>('bitacora')

  // Visor de imagen de evidencia técnica en alta resolución
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState(false)

  const [startRetry, setStartRetry] = useState<{ id: string; error: unknown } | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const [lastActionNotice, setLastActionNotice] = useState<{
    variant: 'info' | 'success' | 'warning' | 'danger'
    title: string
    description: string
    affectedCaseId?: string
    nextStep?: string
  } | null>(null)

  const [queueFilter, setQueueFilter] = useState<TecnicoQueueFilter>('todos')
  const [selectedAmbienteFilter, setSelectedAmbienteFilter] = useState<string>('todos')
  const [sortMode, setSortMode] = useState<SortMode>('urgency')

  const fetchCases = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setFetchError(null)
    }
    try {
      const assigned = await getCasosAsignados()
      const list = Array.isArray(assigned) ? assigned : []
      setCases(list)
      if (list.length > 0 && !activeCaseId) {
        // Auto-seleccionar el caso más prioritario operativamente para el técnico
        const sorted = [...list].sort((a, b) => {
          const diff =
            getTecnicoPriorityScore(a.estado, a.descripcion) -
            getTecnicoPriorityScore(b.estado, b.descripcion)
          if (diff !== 0) return diff
          const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
          const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
          return dateB - dateA
        })
        setActiveCaseId(sorted[0]._id)
      }
      } catch (error) {
      console.error('Error fetching assigned cases:', error)
      if (!silent) {
        setFetchError(getApiErrorMessage(error))
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    void fetchCases()
    void getCasos()
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setCaseTypes(res.data)
        }
      })
      .catch(() => {})

    // Escuchar actualizaciones en vivo del canal SSE (ej: cuando le asignan un nuevo caso o el funcionario responde)
    const handleTicketLiveUpdate = (ev: Event) => {
      const customEv = ev as CustomEvent
      if (customEv?.detail?.solicitudId && customEv?.detail?.estado) {
        setCases((prev) =>
          prev.map((c) =>
            c._id === customEv.detail.solicitudId
              ? { ...c, estado: customEv.detail.estado }
              : c
          )
        )
      }
      void fetchCases(true)
    }
    window.addEventListener('ticket:updated', handleTicketLiveUpdate)
    return () => {
      window.removeEventListener('ticket:updated', handleTicketLiveUpdate)
    }
  }, [])

  // Lista de ambientes únicos para filtro de ruta de campo
  const ambientesDisponibles = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; count: number }>()
    cases.forEach((c) => {
      const ambId = c.ambiente?._id || 'general'
      const ambNombre = c.ambiente?.nombre || 'General / Despacho'
      const current = map.get(ambId)
      if (current) {
        current.count += 1
      } else {
        map.set(ambId, { id: ambId, nombre: ambNombre, count: 1 })
      }
    })
    return Array.from(map.values())
  }, [cases])

  // Filtrado y ordenamiento inteligente para el técnico
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        const s = searchTerm.toLowerCase().trim()
        const matchesSearch =
          !s ||
          (c.codigoCaso || '').toLowerCase().includes(s) ||
          (c.descripcion || '').toLowerCase().includes(s) ||
          (typeof c.usuario === 'object' && c.usuario?.nombre ? c.usuario.nombre.toLowerCase().includes(s) : false) ||
          (c.ambiente?.nombre || '').toLowerCase().includes(s)

        if (!matchesSearch) return false

        const est = (c.estado || '').toLowerCase()
        if (queueFilter === 'por_iniciar' && !(est === 'asignado' || est === 'nuevo' || est === 'solicitado')) return false
        if (queueFilter === 'en_atencion' && !(est === 'en_progreso' || est === 'en_atencion')) return false
        if (queueFilter === 'esperando_usuario' && !(est === 'esperando_usuario' || est === 'requiere_informacion')) return false

        if (selectedAmbienteFilter !== 'todos') {
          const ambId = c.ambiente?._id || 'general'
          if (ambId !== selectedAmbienteFilter) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortMode === 'location') {
          const ambA = a.ambiente?.nombre || ''
          const ambB = b.ambiente?.nombre || ''
          const locCmp = ambA.localeCompare(ambB)
          if (locCmp !== 0) return locCmp
          // Dentro del mismo ambiente, ordenar por fecha más reciente
          const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
          const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
          return dateB - dateA
        }

        // Prioridad Operativa por Urgencia (Plan de Vuelo del Técnico):
        // 1. P0 (Score 5): En intervención técnica activa en sitio (en atención)
        // 2. P1 (Score 12-15): Emergencias operativas disponibles (Clase en Vivo / Atención al Público)
        // 3. P2 (Score 22-26): Asignados y nuevos listos para iniciar
        // 4. P3 (Score 45): En espera de usuario (pausados)
        // 5. P4 (Score 60): Casos finalizados / resueltos
        const scoreDiff =
          getTecnicoPriorityScore(a.estado, a.descripcion) -
          getTecnicoPriorityScore(b.estado, b.descripcion)

        if (scoreDiff !== 0) return scoreDiff

        // Desempate por fecha (los más recientes primero)
        const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
        const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
        return dateB - dateA
      })
  }, [cases, searchTerm, queueFilter, selectedAmbienteFilter, sortMode])

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredCases.slice(startIndex, startIndex + itemsPerPage)

  const activeJob = cases.find((c) => c._id === activeCaseId) || (currentItems.length > 0 ? currentItems[0] : null)

  const [liveHistorial, setLiveHistorial] = useState<import('@/shared/types').SolicitudHistorialEvent[] | null>(null)
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  // Carga y sincronización en tiempo real del historial inmutable para el técnico
  const fetchLiveHistorial = async (id: string) => {
    setLoadingHistorial(true)
    try {
      const items = await obtenerHistorialCaso(id)
      setLiveHistorial(items)
    } catch (err) {
      console.error('Error fetching technician case history:', err)
    } finally {
      setLoadingHistorial(false)
    }
  }

  useEffect(() => {
    if (isTimelineDrawerOpen && activeJob?._id) {
      void fetchLiveHistorial(activeJob._id)
    }
  }, [isTimelineDrawerOpen, activeJob?._id])

  useEffect(() => {
    const handleTicketLiveUpdate = (ev: Event) => {
      const customEv = ev as CustomEvent
      if (
        isTimelineDrawerOpen &&
        activeJob?._id &&
        (!customEv.detail?.solicitudId || customEv.detail?.solicitudId === activeJob._id)
      ) {
        void fetchLiveHistorial(activeJob._id)
      }
    }
    window.addEventListener('ticket:updated', handleTicketLiveUpdate)
    return () => {
      window.removeEventListener('ticket:updated', handleTicketLiveUpdate)
    }
  }, [isTimelineDrawerOpen, activeJob?._id])

  const enrichedActiveJob: Solicitud | null = activeJob
    ? {
        ...activeJob,
        historial: liveHistorial || activeJob.historial,
      }
    : null

  // Métricas del turno operativo
  const totalAsignados = cases.length
  const enAtencionCount = cases.filter((c) => c.estado === 'en_progreso' || c.estado === 'en_atencion').length
  const porIniciarCount = cases.filter((c) => c.estado === 'asignado' || c.estado === 'nuevo' || c.estado === 'solicitado').length
  const esperandoCount = cases.filter((c) => c.estado === 'esperando_usuario' || c.estado === 'requiere_informacion').length

  // Iniciar atención en sitio
  const runStart = async (id: string) => {
    setStartRetry(null)
    try {
      await iniciarAtencion(id)
      toast.success('Atención técnica iniciada en sitio.')
      setLastActionNotice({
        variant: 'info',
        title: 'Intervención en Curso',
        description: `Has registrado formalmente el inicio de labores para el caso #${id.slice(-6)}. El funcionario fue notificado.`,
        affectedCaseId: id,
        nextStep: 'Realiza el diagnóstico presencial, registra avances si es necesario y formaliza la solución al concluir.',
      })
      setCases((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                estado: 'en_progreso',
                capabilities: { ...c.capabilities, canStart: false, canUpdate: true, canResolve: true },
              }
            : c
        )
      )
    } catch (err) {
      const classified = classifyWorkflowMutationFailure(err)
      if (classified.offersManualRetry) {
        setStartRetry({ id, error: err })
      } else {
        clearWorkflowAttemptKey('start', id)
        toast.error(classified.message || 'Error al iniciar atención')
      }
    }
  }

  // Registrar avance / nota técnica
  const handleSaveUpdate = async (mensaje: string) => {
    if (!activeJob || !mensaje.trim()) return
    try {
      await agregarActualizacion(activeJob._id, mensaje.trim())
      toast.success('Nota técnica registrada en bitácora.')
      setLastActionNotice({
        variant: 'info',
        title: 'Bitácora Actualizada',
        description: `Se registró el avance técnico en el expediente del caso #${activeJob.codigoCaso || activeJob._id.slice(-6)}.`,
        affectedCaseId: activeJob._id,
        nextStep: 'El funcionario ya puede ver este avance en su registro.',
      })
      void fetchCases()
      if (activeJob._id) {
        void fetchLiveHistorial(activeJob._id)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
      throw err
    }
  }

  // Solicitar información o pruebas al funcionario
  const handleRequestInfo = async (mensaje: string) => {
    if (!activeJob || !mensaje.trim()) return
    try {
      await solicitarInformacion(activeJob._id, mensaje.trim())
      toast.success('Solicitud enviada al funcionario.')
      setLastActionNotice({
        variant: 'warning',
        title: 'Esperando Respuesta del Funcionario',
        description: `Se notificó al funcionario para ampliar detalles o validar acceso al caso #${activeJob.codigoCaso || activeJob._id.slice(-6)}.`,
        affectedCaseId: activeJob._id,
        nextStep: 'El caso quedó en pausa. Puedes avanzar con otro caso de tu turno.',
      })
      setCases((prev) =>
        prev.map((c) => (c._id === activeJob._id ? { ...c, estado: 'esperando_usuario' } : c))
      )
      if (activeJob._id) {
        void fetchLiveHistorial(activeJob._id)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
      throw err
    }
  }

  // Abrir modal de solución formal
  const handleOpenResolutionModal = (caso: Solicitud) => {
    const caseType = caseTypes.find((t) => t.nombre === caso.tipoCaso) || caseTypes[0]
    setSelectedCase({
      ...caso,
      tipoCaso: caseType?._id || (typeof caso.tipoCaso === 'string' ? caso.tipoCaso : caso.tipoCaso?._id) || '',
    } as unknown as CaseForResolution)
    setModalIsOpen(true)
  }

  const handleCloseResolutionModal = () => {
    setModalIsOpen(false)
    setSelectedCase(null)
  }

  // Formalizar solución final
  const handleFormSubmit = async (data: {
    solucion: string
    tipoSolucion: TipoSolucion
    observaciones: string
    file?: File
  }) => {
      if (!selectedCase) return
    const id = selectedCase._id
    try {
      if (data.tipoSolucion === 'pendiente') {
        await registrarSolucionParcial(id, {
          queSeHizo: data.solucion,
          queFalta: data.observaciones || 'Pendiente seguimiento o repuesto',
          siguienteAccion: 'Continuar atención en ambiente',
        })
        toast.success('Solución parcial registrada con éxito.')
        setLastActionNotice({
          variant: 'info',
          title: 'Atención Parcial Registrada',
          description: `Se registró el avance técnico del caso #${selectedCase.codigoCaso || id.slice(-6)}.`,
          affectedCaseId: id,
          nextStep: 'El ticket permanece en atención mientras se gestiona la solución total.',
        })
      } else {
        // Por defecto o finalizado, intentamos registrarSolucionTotal (flujo v2)
        try {
          await registrarSolucionTotal(id, {
            queSeHizo: data.solucion,
            causaIdentificada: data.observaciones,
          })
        } catch (err: any) {
          // Si el caso antiguo fuera v1, fallback a la ruta legacy
          if (err?.response?.status === 409 && err?.response?.data?.message?.includes('flujo anterior')) {
            await submitSolucionCaso(id, {
              descripcionSolucion: data.solucion,
              tipoCaso: selectedCase.tipoCaso || caseTypes[0]?._id || '',
              tipoSolucion: data.tipoSolucion,
            })
          } else {
            throw err
          }
        }
        toast.success('Solución formalizada con éxito.')
        setLastActionNotice({
          variant: 'success',
          title: 'Caso Finalizado Satisfactoriamente',
          description: `Has completado la intervención del caso #${selectedCase.codigoCaso || id.slice(-6)}.`,
          affectedCaseId: id,
          nextStep: 'El funcionario ha recibido la notificación de cierre y visto bueno final.',
        })
      }
      setModalIsOpen(false)
      setSelectedCase(null)
      void fetchCases()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const isAsignado = activeJob?.estado === 'asignado' || activeJob?.estado === 'nuevo' || activeJob?.estado === 'solicitado'
  const isEnAtencion = activeJob?.estado === 'en_progreso' || activeJob?.estado === 'en_atencion'
  const isEsperandoUsuario = activeJob?.estado === 'esperando_usuario' || activeJob?.estado === 'requiere_informacion'
  const isCerrado = activeJob?.estado === 'cerrado'
  const isResuelto = activeJob?.estado === 'resuelto' || activeJob?.estado === 'finalizado'

  const getStepStatus = (stepNum: number): 'completed' | 'current' | 'waiting' => {
    if (isCerrado) {
      return 'completed'
    }
    if (isResuelto) {
      if (stepNum < 4) return 'completed'
      if (stepNum === 4) return 'current'
      return 'waiting'
    }
    if (isEnAtencion || isEsperandoUsuario) {
      if (stepNum < 3) return 'completed'
      if (stepNum === 3) return 'current'
      return 'waiting'
    }
    if (isAsignado) {
      if (stepNum === 1) return 'completed'
      if (stepNum === 2) return 'current'
      return 'waiting'
    }
    if (stepNum === 1) return 'current'
    return 'waiting'
  }

  const stepsConfig = [
    {
      num: 1,
      title: 'Radicado por Usuario',
      subtitle: activeJob?.fecha ? `Ingreso: ${activeJob.fecha}` : 'Solicitud recibida',
      icon: 'inbox',
      activeColor: {
        border: 'border-[#04324d]/30 ring-1 ring-[#04324d]/20',
        bg: 'bg-sky-50/60',
        badge: 'bg-[#04324d] text-white',
        text: 'text-[#04324d]',
        dot: 'bg-[#04324d]',
      },
      completedColor: {
        border: 'border-slate-200/90',
        bg: 'bg-slate-50/70',
        badge: 'bg-slate-700 text-white',
        text: 'text-slate-800',
        dot: 'bg-slate-400',
      },
    },
    {
      num: 2,
      title: 'Asignado a tu Guardia',
      subtitle: 'Caso en tu turno CTPI',
      icon: 'engineering',
      activeColor: {
        border: 'border-purple-300 ring-1 ring-purple-300/40',
        bg: 'bg-purple-50/70',
        badge: 'bg-purple-700 text-white',
        text: 'text-purple-950',
        dot: 'bg-purple-600',
      },
      completedColor: {
        border: 'border-purple-200/80',
        bg: 'bg-purple-50/30',
        badge: 'bg-purple-600 text-white',
        text: 'text-purple-900',
        dot: 'bg-purple-500',
      },
    },
    {
      num: 3,
      title: 'Tu Intervención en Sitio',
      subtitle: isEsperandoUsuario
        ? 'Esperando respuesta del funcionario'
        : isEnAtencion
        ? 'Pruebas y diagnóstico activo'
        : 'Pendiente desplazamiento a aula',
      icon: isEsperandoUsuario ? 'contact_support' : 'handyman',
      activeColor: {
        border: isEsperandoUsuario
          ? 'border-amber-400 ring-1 ring-amber-400/50'
          : 'border-amber-300 ring-1 ring-amber-300/40',
        bg: 'bg-amber-50/80',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-950',
        dot: 'bg-amber-500',
      },
      completedColor: {
        border: 'border-amber-200/70',
        bg: 'bg-amber-50/30',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-900',
        dot: 'bg-amber-500',
      },
    },
    {
      num: 4,
      title: isCerrado ? 'Caso Archivado' : 'Cierre Técnico',
      subtitle: isCerrado
        ? 'Visto bueno recibido y archivado'
        : isResuelto
        ? 'Esperando visto bueno del funcionario'
        : 'Pendiente formalizar solución',
      icon: 'verified',
      activeColor: {
        border: 'border-emerald-400 ring-1 ring-emerald-400/50',
        bg: 'bg-emerald-50/80',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-950',
        dot: 'bg-emerald-500',
      },
      completedColor: {
        border: 'border-emerald-200/80',
        bg: 'bg-emerald-50/40',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-900',
        dot: 'bg-emerald-500',
      },
    },
  ]

  const funcionarioNombre =
    typeof activeJob?.usuario === 'object' && activeJob?.usuario?.nombre
      ? activeJob.usuario.nombre
      : 'Funcionario SENA'

  const funcionarioTelefono =
    activeJob?.telefono ||
    (typeof activeJob?.usuario === 'object' && activeJob?.usuario?.telefono ? activeJob.usuario.telefono : null)

  const funcionarioEmail =
    typeof activeJob?.usuario === 'object' && activeJob?.usuario?.correo
      ? activeJob.usuario.correo
      : null

  return (
    <AppShell subtitleContext="Consola de Campo">
      <div className="mx-auto w-full max-w-[1540px] px-3.5 py-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
        
        {/* SHIFT HEADER: Resumen táctico de guardia y control de turno */}
        <header className="rounded-2xl border bg-white p-4 sm:p-5 shadow-xs border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                  Consola Operativa Técnica · Soporte en Sitio
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider text-azul-sena bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Atención en Campo · CTPI
                </span>
            </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Gestión operativa, desplazamiento físico a ambientes, bitácora técnica y cierre de incidencias.
              </p>
            </div>

            {/* Turno Metrics Strip */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-slate-50/80 px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200/80 shadow-2xs">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">inventory_2</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">En tu turno</p>
                  <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">{totalAsignados}</p>
            </div>
          </div>

              <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-blue-50/60 px-3 py-2 sm:px-4 sm:py-2.5 border border-blue-200/80 shadow-2xs">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-100/80 flex items-center justify-center text-azul-sena shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">engineering</span>
                      </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-azul-sena uppercase tracking-wider truncate">En Atención</p>
                  <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">{enAtencionCount}</p>
                          </div>
                        </div>

              <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-emerald-50/60 px-3 py-2 sm:px-4 sm:py-2.5 border border-emerald-200/80 shadow-2xs">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-800 shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">pending_actions</span>
                          </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider truncate">Por Iniciar</p>
                  <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">{porIniciarCount}</p>
                        </div>
                          </div>

              {esperandoCount > 0 ? (
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-amber-50 px-3 py-2 sm:px-4 sm:py-2.5 border border-amber-300 shadow-2xs animate-pulse">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 shrink-0">
                    <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">hourglass_top</span>
                        </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">En Espera de Usuario</p>
                    <p className="text-sm sm:text-base font-black text-amber-950 leading-none mt-0.5">{esperandoCount}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* FEEDBACK BANNER OPERACIONAL */}
        {lastActionNotice ? (
          <FeedbackBanner
            tone={lastActionNotice.variant === 'danger' ? 'danger' : lastActionNotice.variant === 'warning' ? 'warning' : 'success'}
            title={lastActionNotice.title}
            description={lastActionNotice.description}
            nextStep={lastActionNotice.nextStep}
            affectedCaseId={lastActionNotice.affectedCaseId}
            onDismiss={() => setLastActionNotice(null)}
          />
        ) : null}

        {/* ========================================================= */}
        {/* MASTER-DETAIL COCKPIT: Cola Izquierda + Expediente Técnico */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          
          {/* COLUMNA IZQUIERDA (5 cols en laptop 1280, 4 cols en XL): Cola de Casos */}
          <div className={`lg:col-span-5 xl:col-span-4 ${activeCaseId ? 'hidden lg:block' : 'block'}`}>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
              
              {/* Barra de Búsqueda, Filtros y Rutas por Ubicación */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                    <SemanticIcon name="cola" className="text-slate-600 !text-[18px]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Cola Asignada</h2>
                            </div>
                  <div className="flex items-center gap-1.5">
                    {/* Toggle de ordenamiento: Por Urgencia o Por Ubicación */}
                    <button
                      type="button"
                      onClick={() => {
                        setSortMode(sortMode === 'urgency' ? 'location' : 'urgency')
                        setCurrentPage(1)
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        sortMode === 'location'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                      title={sortMode === 'location' ? 'Ordenado por ambiente/bloque físico' : 'Ordenado por urgencia de estado'}
                    >
                      <span className="material-symbols-outlined !text-[13px]">
                        {sortMode === 'location' ? 'pin_drop' : 'sort'}
                      </span>
                      <span>{sortMode === 'location' ? 'Ruta física' : 'Urgencia'}</span>
                    </button>
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                      {filteredCases.length}
                    </span>
                          </div>
                          </div>

                <SearchField
                  placeholder="Buscar caso, solicitante o aula..."
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val)
                    setCurrentPage(1)
                  }}
                />

                {/* Filtros rápidos por estado */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/60 rounded-xl text-xs">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'en_atencion', label: 'En curso' },
                    { id: 'por_iniciar', label: 'Por iniciar' },
                    { id: 'esperando_usuario', label: 'En espera' },
                  ].map((tab) => {
                    const isTabActive = queueFilter === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setQueueFilter(tab.id as TecnicoQueueFilter)
                          setCurrentPage(1)
                        }}
                        className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center cursor-pointer text-[11px] whitespace-nowrap ${
                          isTabActive
                            ? 'bg-white text-azul-sena shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                        </div>

                {/* Filtro de Ruta por Ambiente / Bloque si hay múltiples */}
                {ambientesDisponibles.length > 1 && (
                  <div className="pt-0.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar text-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                        <span className="material-symbols-outlined !text-[13px]">domain</span>
                        <span>Ambiente:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAmbienteFilter('todos')
                          setCurrentPage(1)
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                          selectedAmbienteFilter === 'todos'
                            ? 'bg-azul-sena text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Todos ({cases.length})
                      </button>
                      {ambientesDisponibles.map((amb) => (
                        <button
                          key={amb.id}
                          type="button"
                          onClick={() => {
                            setSelectedAmbienteFilter(amb.id)
                            setCurrentPage(1)
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                            selectedAmbienteFilter === amb.id
                              ? 'bg-azul-sena text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate max-w-[120px]">{amb.nombre}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                            selectedAmbienteFilter === amb.id
                              ? 'bg-white/25 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {amb.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Casos */}
              {loading ? (
                <div className="p-4">
                  <AdaptiveSkeletonList count={5} />
                </div>
              ) : fetchError ? (
                <div className="p-5">
                  <InlineAlert
                    tone="danger"
                    title="Fallo al obtener casos"
                    action={{ label: 'Reintentar', onClick: () => void fetchCases() }}
                  >
                    {fetchError}
                  </InlineAlert>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <SemanticIcon name="solucionado" className="!text-[36px] mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Sin incidencias en este filtro</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm ? 'Prueba con otro término de búsqueda.' : 'No tienes casos pendientes bajo este criterio.'}
                  </p>
                            </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto" role="list">
                  {currentItems.map((item, idx) => {
                    const isSelected = activeJob?._id === item._id
                    const isEsperando = item.estado === 'esperando_usuario' || item.estado === 'requiere_informacion'
                    const isEnCurso = item.estado === 'en_progreso' || item.estado === 'en_atencion'
                    const parsed = parseEnrichedDescription(item.descripcion)

                    // OPP-1: Agrupador visual por proximidad física (Ambiente/Bloque)
                    const prevItem = idx > 0 ? currentItems[idx - 1] : null
                    const currentAmbienteName = item.ambiente?.nombre || 'General / Despacho'
                    const prevAmbienteName = prevItem?.ambiente?.nombre || 'General / Despacho'
                    const showClusterHeader = sortMode === 'location' && (idx === 0 || currentAmbienteName !== prevAmbienteName)

                    return (
                      <div key={item._id} className="flex flex-col">
                        {showClusterHeader && (
                          <div className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs px-3.5 py-1.5 border-y border-slate-200/80 flex items-center justify-between text-[11px] font-black text-slate-700 shadow-2xs">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined !text-[15px] text-emerald-600">location_on</span>
                              <span>{currentAmbienteName}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Sector de Intervención
                            </span>
                          </div>
                        )}
                          <button 
                          type="button"
                          onClick={() => {
                            setActiveCaseId(item._id)
                            if (window.innerWidth < 1024) {
                              window.scrollTo({ top: 120, behavior: 'smooth' })
                            }
                          }}
                          className={`w-full text-left p-3 transition-all duration-200 ease-out flex flex-col gap-2 relative cursor-pointer group border-b border-slate-100 ${
                            isSelected
                              ? 'bg-blue-50/90 border-l-[4px] border-l-azul-sena shadow-xs ring-1 ring-blue-200/80 z-10'
                              : isEnCurso
                              ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-l-[4px] border-l-emerald-500'
                              : isEsperando
                              ? 'bg-amber-50/20 hover:bg-amber-50/40 border-l-[4px] border-l-amber-400 opacity-90'
                              : 'bg-white hover:bg-slate-50/90 border-l-[4px] border-l-transparent hover:translate-x-0.5'
                          }`}
                        >
                          {/* Fila 1: Código, Estado de Ejecución y StatusBadge */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`font-mono text-xs font-black tracking-tight ${
                                isSelected ? 'text-azul-sena' : 'text-slate-800'
                              }`}>
                                #{item.codigoCaso || item._id.slice(-6)}
                              </span>
                              {isEnCurso && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                                  <span>En atención</span>
                                </span>
                              )}
                            </div>
                            <div className="shrink-0">
                              <StatusBadge status={item.estado} role="tecnico" />
                            </div>
                          </div>

                          {/* Fila 2: Síntoma Visual Institucional + Badges de Alto Impacto */}
                          {(() => {
                            const symptom = detectVisualSymptom(parsed, item.descripcion)
                            return (
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                {/* Badge de Síntoma Visual 1:1 con el Funcionario */}
                                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/90 flex items-center gap-1">
                                  <span className="material-symbols-outlined !text-[13px] text-azul-sena">{symptom.icono}</span>
                                  <span>{symptom.titulo}</span>
                                </span>

                                {parsed.impactoServicio === 'atencion_publico' && (
                                  <span className="font-black text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 animate-pulse">
                                    <span className="material-symbols-outlined !text-[12px] text-amber-700">emergency</span>
                                    <span>Atención al Público</span>
                                  </span>
                                )}
                                {parsed.modoExpress && (
                                  <span className="font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-[12px] text-rose-700 animate-bounce">bolt</span>
                                    <span>Clase en Vivo</span>
                                  </span>
                                )}
                              </div>
                            )
                          })()}

                          {/* Fila 3: Título / Descripción limpia sin headers crudos */}
                          <h3 className={`text-xs sm:text-[13px] font-bold line-clamp-2 leading-snug transition-colors ${
                            isSelected ? 'text-slate-900 font-black' : 'text-slate-700 group-hover:text-slate-900'
                          }`}>
                            {parsed.rawDescription || item.descripcion}
                          </h3>

                          {/* Fila 4: Ubicación Unificada (Cero Duplicidad, Cero Ficha) + Solicitante */}
                          {(() => {
                            // Algoritmo de desduplicación territorial
                            const baseAmbiente = item.ambiente?.nombre?.trim() || ''
                            const oficina = parsed.oficina?.trim() || ''
                            const puesto = parsed.puesto?.trim() || ''

                            // Si oficina es idéntica o está contenida en baseAmbiente, no duplicar
                            const isOficinaSame = oficina && baseAmbiente.toLowerCase().includes(oficina.toLowerCase())
                            const isAmbienteSame = baseAmbiente && oficina.toLowerCase().includes(baseAmbiente.toLowerCase())
                            
                            const mainLocation = isOficinaSame || isAmbienteSame
                              ? (baseAmbiente || oficina)
                              : [baseAmbiente, oficina].filter(Boolean).join(' · ')

                            const subLocation = puesto ? `Puesto ${puesto.replace(/^puesto\s*/i, '')}` : ''

                            return (
                              <div className="flex items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-slate-100/80">
                                <div className="flex items-center gap-1 min-w-0 font-bold text-slate-800 truncate" title={`${mainLocation} ${subLocation ? `(${subLocation})` : ''}`}>
                                  <span className="material-symbols-outlined !text-[14px] text-emerald-600 shrink-0">location_on</span>
                                  <span className="truncate">{mainLocation || 'General'}</span>
                                  {subLocation && (
                                    <span className="text-slate-500 font-semibold truncate shrink-0">
                                      · {subLocation}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 max-w-[130px] truncate" title={typeof item.usuario === 'object' ? item.usuario?.nombre : 'Funcionario'}>
                                  <span className="material-symbols-outlined !text-[13px] text-slate-400 shrink-0">person</span>
                                  <span className="truncate">
                                    {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Funcionario'}
                                  </span>
                                </div>
                              </div>
                            )
                          })()}
                          </button>
                        </div>
                    )
                  })}
                </div>
              )}

              {/* Paginación */}
              {filteredCases.length > itemsPerPage ? (
                <div className="border-t border-slate-200 bg-slate-50">
                  <PaginationFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredCases.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    itemLabel="solicitudes"
                    className="!p-2.5"
                  />
                </div>
              ) : null}

            </div>
          </div>

          {/* COLUMNA DERECHA (7 cols en laptop 1280, 8 cols en XL): Consola de Intervención Técnica */}
          <div className={`lg:col-span-7 xl:col-span-8 ${!activeCaseId ? 'hidden lg:block' : 'block'}`}>
            
            {/* Barra de Retorno Rápido en Mobile */}
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setActiveCaseId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-azul-sena hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                <span>Volver a la cola de casos</span>
              </button>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Consola de Campo
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <AdaptiveSkeletonDetail />
              </div>
            ) : activeJob ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden transition-all duration-300">
                
                {/* 1. PORTADA TÉCNICA DEL INCIDENTE (BENTO GRID OPERATIVO DEFINITIVO) */}
                <IncidentHeaderABVariants
                  solicitud={activeJob}
                  copiedCode={copiedCode}
                  onCopyCode={() => {
                    const code = activeJob.codigoCaso || activeJob._id.slice(-6)
                    void navigator.clipboard.writeText(code)
                    setCopiedCode(true)
                    setTimeout(() => setCopiedCode(false), 2000)
                  }}
                />

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  
                  {/* 2. COMMAND ACTION DECK: Acciones Operativas Claras */}
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50/90 via-white to-blue-50/40 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-azul-sena">
                        <span className="material-symbols-outlined !text-[15px]">tune</span>
                        <span className="text-[11px] font-black uppercase tracking-wider font-mono">
                          Consola de Acción en Sitio
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                        {isAsignado
                          ? 'Confirma tu desplazamiento o inicio de atención en el ambiente.'
                          : isEsperandoUsuario
                          ? 'Intervención en pausa. Esperando que el funcionario responda o brinde acceso.'
                          : isEnAtencion
                          ? 'Intervención técnica en curso. Registra bitácora o concluye la solución.'
                          : 'Requerimiento resuelto.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {isAsignado ? (
                        <>
                          {/* P2: Acción 1-Clic "En camino al aula" (Aviso en tiempo real + Inicio formal) */}
                          <button
                            type="button"
                            onClick={async () => {
                              await runStart(activeJob._id)
                              await handleSaveUpdate('🏃 Especialista técnico en camino al ambiente con herramientas y repuestos (ETA ~5 min).')
                            }}
                            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-azul-sena to-blue-800 hover:from-blue-900 hover:to-slate-900 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-[18px]">directions_run</span>
                            <span>En camino al aula (~5 min)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void runStart(activeJob._id)}
                            className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-[18px]">play_arrow</span>
                            <span>Iniciar en sitio</span>
                          </button>
                        </>
                      ) : null}

                      {isEnAtencion ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setInterventionInitialTab('bitacora')
                              setIsInterventionModalOpen(true)
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer active:scale-95"
                            title="Abrir centro de intervención: registrar avances en bitácora o consultar al funcionario"
                          >
                            <span className="material-symbols-outlined !text-[18px] text-azul-sena">rate_review</span>
                            <span>Intervención de Campo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenResolutionModal(activeJob)}
                            className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-verde-sena to-[#2e8800] hover:from-[#329600] hover:to-[#277400] text-white font-black text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined !text-[18px]">task_alt</span>
                            <span>Formalizar Solución</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Retry notice ante errores de red o concurrencia */}
                  {startRetry && startRetry.id === activeJob._id ? (
                    <WorkflowManualRetryNotice
                      error={startRetry.error}
                      lastPayload={{ id: startRetry.id }}
                      currentPayload={{ id: startRetry.id }}
                      onRetry={() => void runStart(startRetry.id)}
                    />
                  ) : null}

                  {/* 3. FIELD CONTEXT CARDS: Ubicación física exacta + Contacto directo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    
                    {/* Ficha Ambiente / Ubicación Física Enriquecida */}
                    {(() => {
                      const parsedLocation = parseEnrichedDescription(activeJob.descripcion)
                      const oficinaName = parsedLocation.oficina?.trim()
                      const puestoName = parsedLocation.puesto?.trim()
                      const baseAmb = activeJob.ambiente?.nombre || 'General'
                      const isOficinaSame = oficinaName && baseAmb.toLowerCase().includes(oficinaName.toLowerCase())
                      const displayTitle = isOficinaSame || !oficinaName ? baseAmb : `${baseAmb} · ${oficinaName}`

                      return (
                        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                              <span className="material-symbols-outlined !text-[16px] text-emerald-600">apartment</span>
                              Ubicación Presencial / Aula
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 tracking-tight">
                              Soporte en Sitio
                            </span>
                          </div>

                          <div className="flex items-start gap-3 pt-0.5">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black flex items-center justify-center text-xs shadow-2xs shrink-0 mt-0.5">
                              CTPI
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                                {displayTitle}
                              </p>
                              {puestoName ? (
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined !text-[14px] text-azul-sena">desktop_windows</span>
                                  <span>{puestoName.startsWith('Puesto') || puestoName.startsWith('Ventanilla') ? puestoName : `Puesto: ${puestoName}`}</span>
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  Sede Central CTPI · Verifica el aula o puesto asignado
                                </p>
                              )}

                              {(parsedLocation.ficha || parsedLocation.jornada) && (
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                                  {parsedLocation.ficha && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="material-symbols-outlined !text-[13px] text-slate-400">school</span>
                                      Ficha: {parsedLocation.ficha}
                                    </span>
                                  )}
                                  {parsedLocation.jornada && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="material-symbols-outlined !text-[13px] text-amber-500">wb_sunny</span>
                                      Jornada: {parsedLocation.jornada}
                                    </span>
                                  )}
                      </div>
                )}
          </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Ficha Funcionario Solicitante con llamada directa de un toque */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                          <span className="material-symbols-outlined !text-[16px] text-azul-sena">person</span>
                          Funcionario Solicitante
                        </span>
                        <span className="text-[11px] font-bold text-azul-sena tracking-tight">
                          Usuario SENA
                        </span>
            </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-azul-sena text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                            {funcionarioNombre[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                              {funcionarioNombre}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {funcionarioTelefono ? `Cel: ${funcionarioTelefono}` : funcionarioEmail || 'Sin teléfono'}
                            </p>
                          </div>
                        </div>

                        {funcionarioTelefono && (
                          <a
                            href={`tel:${funcionarioTelefono}`}
                            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-2xs cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                            title="Llamar directamente al funcionario"
                          >
                            <span className="material-symbols-outlined !text-[18px]">call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. INSPECCIÓN TÉCNICA DE EVIDENCIA: Foto del fallo con visor zoom */}
                  {activeJob.foto && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <div className="md:col-span-7 xl:col-span-8 p-4 sm:p-5 flex flex-col justify-between gap-3">
                          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 text-azul-sena flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined !text-[18px]">image_search</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                                  Inspección Visual Previa
                                </span>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                                  Evidencia del Fallo Adjuntada por el Funcionario
                                </h4>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed pt-1">
                              Examina la fotografía antes de dirigirte al ambiente para preparar las herramientas, cables de repuesto o controladores adecuados.
                            </p>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(activeJob.foto?.url || '')}
                              className="inline-flex items-center gap-1.5 text-xs font-black text-azul-sena hover:underline cursor-pointer"
                            >
                              <span className="material-symbols-outlined !text-[16px]">zoom_in</span>
                              <span>Ampliar fotografía de falla</span>
              </button>
                          </div>
                        </div>

                        <div className="md:col-span-5 xl:col-span-4 p-3 bg-slate-50/70 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(activeJob.foto?.url || '')}
                            className="group relative w-full h-32 sm:h-36 md:h-28 rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                            title="Clic para ampliar en alta definición"
                          >
                            <img
                              src={activeJob.foto?.url}
                              alt="Evidencia del fallo"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold backdrop-blur-2xs">
                              <span className="material-symbols-outlined !text-[16px]">fullscreen</span>
                              <span>Inspeccionar</span>
                            </div>
              </button>
            </div>
          </div>
                    </div>
                  )}

                  {/* 5. TRAZABILIDAD & HISTORIAL SINCRONIZADO 1:1 CON FUNCIONARIO */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-azul-sena font-mono">
                            Línea de Vida Operativa ·
                          </span>
                          <h3 className="text-sm font-black text-slate-900">Estado de Atención en Campo</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Control de avance de tu intervención y trazabilidad con el funcionario</p>
                      </div>

                      {/* BOTÓN DISPARADOR: HISTORIAL EN STEPPER SINCRONIZADO */}
                      <button
                        type="button"
                        onClick={() => setIsTimelineDrawerOpen(true)}
                        className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-black text-xs transition-all cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined !text-[17px] text-emerald-700">history_edu</span>
                        <span>Ver Historial del Caso</span>
                      </button>
                    </div>

                    {/* Stepper inteligente de 4 fases */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
                      {stepsConfig.map((st) => {
                        const status = getStepStatus(st.num)
                        const isCompleted = status === 'completed'
                        const isCurrent = status === 'current'

                        const currentStyle = isCurrent
                          ? st.activeColor
                          : isCompleted
                          ? st.completedColor
                          : {
                              border: 'border-slate-100',
                              bg: 'bg-slate-50/50 opacity-60',
                              badge: 'bg-slate-200 text-slate-500',
                              text: 'text-slate-500',
                              icon: 'text-slate-400',
                            }

                        return (
                          <div
                            key={st.num}
                            onClick={() => setIsTimelineDrawerOpen(true)}
                            className={`relative p-3.5 rounded-xl border transition-all cursor-pointer hover:ring-2 hover:ring-azul-sena/40 hover:scale-[1.02] ${currentStyle.border} ${currentStyle.bg}`}
                            title="Clic para abrir el historial sincronizado"
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs shrink-0 ${currentStyle.badge}`}
                                >
                                  {isCompleted ? '✓' : st.num}
                                </div>
                                <span className={`text-xs font-black tracking-tight ${currentStyle.text}`}>
                                  {st.title}
                                </span>
                              </div>

                              <span
                                className={`material-symbols-outlined !text-[16px] shrink-0 ${
                                  isCurrent
                                    ? currentStyle.text
                                    : isCompleted
                                    ? 'text-slate-500'
                                    : 'text-slate-300'
                                }`}
                              >
                                {st.icon}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-tight">
                              {st.subtitle}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <span className="material-symbols-outlined !text-[48px] text-slate-300 mx-auto mb-3">
                  pending_actions
                </span>
                <h3 className="text-base font-bold text-slate-700">Sin Caso Seleccionado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Selecciona una de las solicitudes de tu cola asignada para iniciar atención o consultar el expediente técnico.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL UNIFICADO CON TABS: INTERVENCIÓN OPERATIVA (BITÁCORA & CONSULTA) */}
        <InterventionActionModal
          isOpen={isInterventionModalOpen}
          initialTab={interventionInitialTab}
          solicitud={activeJob}
          onClose={() => setIsInterventionModalOpen(false)}
          onSaveBitacora={handleSaveUpdate}
          onRequestInfo={handleRequestInfo}
        />

        {/* MODAL DE SOLUCIÓN FORMAL */}
          <ResolutionModal
            isOpen={modalIsOpen}
          onRequestClose={handleCloseResolutionModal}
          onSubmit={handleFormSubmit}
          caso={selectedCase}
            caseTypes={caseTypes}
          />

        {/* MODAL DE IMAGEN EN PANTALLA COMPLETA */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-white/20">
              <img
                src={previewImage}
                alt="Evidencia en tamaño completo"
                className="max-h-[85vh] w-auto object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[20px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DRAWER CANÓNICO: STEPPER SINCRONIZADO (1:1 CON FUNCIONARIO)               */}
        {/* ========================================================================= */}
        {isTimelineDrawerOpen && activeJob && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 sm:p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">sync</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">Historial Sincronizado</h3>
                      <p className="text-[11px] sm:text-xs text-slate-500">Mapeado con el stepper de 4 etapas</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTimelineDrawerOpen(false)}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-[20px]">close</span>
                  </button>
                </div>

                {/* Micro-Stepper dentro del Header del Drawer */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-1">
                  {stepsConfig.map((s) => {
                    const isDone = getStepStatus(s.num) === 'completed'
                    const isCurr = getStepStatus(s.num) === 'current'
                    return (
                      <div
                        key={s.num}
                        className={`p-1 sm:p-1.5 rounded-lg text-center text-[9px] sm:text-[10px] font-bold border transition-all ${
                          isCurr
                            ? 'bg-white border-emerald-400 text-emerald-800 shadow-2xs font-black'
                            : isDone
                            ? 'bg-emerald-100/70 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100/60 border-slate-200/60 text-slate-400'
                        }`}
                      >
                        <span className="block truncate">
                          {s.num}. {s.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 hairline-scrollbar">
                {loadingHistorial && !liveHistorial ? (
                  <div className="flex items-center justify-center p-8 space-x-2 text-slate-500">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="text-xs font-bold">Sincronizando historial en tiempo real...</span>
                  </div>
                ) : (
                  <FuncionarioTimeline
                    solicitud={enrichedActiveJob || activeJob}
                    onOpenPreview={(url) => setPreviewImage(url)}
                  />
                )}
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Trazabilidad Institucional SENA
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimelineDrawerOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer text-center"
                >
                  Cerrar Historial
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
