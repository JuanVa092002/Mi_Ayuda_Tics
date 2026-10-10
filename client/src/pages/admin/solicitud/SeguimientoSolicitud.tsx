import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import {
  historialSolicitudesLider,
  reasignarTecnico,
  cancelarSolicitud,
  WorkflowManualRetryNotice,
  LeaderTicketDrawer,
  LeaderMediaThumb,
} from '@/features/tickets'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import {
  canLeaderCancel,
  countLeaderOps,
  filterLeaderOps,
  formatSolicitudFecha,
  leaderFacingStatusLabel,
  leaderOpsSituation,
  leaderCaseNarrative,
  leaderReassignIsPrimary,
  leaderResponsibilityLine,
  leaderUrgencyMarks,
  reassignConsequence,
  solutionPreview,
  tecnicoActiveLoad,
  validateRequiredMotivo,
  type LeaderOpsFilter,
  type LeaderOpsSituation,
} from '@/features/tickets/leader-inbox'
import { getTecnicosAprobados } from '@/features/users'
import { getApiErrorMessage } from '@/shared/api/apiError'
import {
  Button,
  SlideOverDrawer,
  PaginationFooter,
  InlineAlert,
  SearchField,
  SemanticIcon,
  StatusBadge,
  AdaptiveSkeletonList,
  toast,
} from '@/shared/ui'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'
import type { Solicitud, User } from '@/shared/types'

interface SituationVisualConfig {
  icon: string
  label: string
  chipClass: string
  badgeTone: 'inbox' | 'assigned' | 'progress' | 'done' | 'cancelled' | 'neutral'
  railClass: string
  numberClass: string
  bgSelectedClass: string
  borderClass: string
  iconBgClass: string
  iconColorClass: string
  cardBgClass: string
}

const SITUATION_CONFIG: Record<LeaderOpsSituation, SituationVisualConfig> = {
  por_iniciar: {
    icon: 'schedule',
    label: 'Por Iniciar',
    chipClass: 'bg-blue-50 text-blue-900 border-blue-200',
    badgeTone: 'progress',
    railClass: 'border-l-blue-600',
    numberClass: 'text-blue-950',
    bgSelectedClass: 'border-blue-500 bg-blue-50/90 shadow-xs ring-2 ring-blue-500/30',
    borderClass: 'border-blue-200/90',
    iconBgClass: 'bg-blue-100/90',
    iconColorClass: 'text-azul-sena',
    cardBgClass: 'bg-blue-50/50 hover:bg-blue-50/80',
  },
  en_atencion: {
    icon: 'engineering',
    label: 'En Atención',
    chipClass: 'bg-amber-50 text-amber-950 border-amber-200',
    badgeTone: 'assigned',
    railClass: 'border-l-amber-500',
    numberClass: 'text-amber-950',
    bgSelectedClass: 'border-amber-500 bg-amber-50/90 shadow-xs ring-2 ring-amber-500/30',
    borderClass: 'border-amber-200/90',
    iconBgClass: 'bg-amber-100/90',
    iconColorClass: 'text-amber-800',
    cardBgClass: 'bg-amber-50/50 hover:bg-amber-50/80',
  },
  esperando_funcionario: {
    icon: 'forum',
    label: 'Espera Funcionario',
    chipClass: 'bg-sky-50 text-sky-950 border-sky-200',
    badgeTone: 'progress',
    railClass: 'border-l-sky-500',
    numberClass: 'text-sky-950',
    bgSelectedClass: 'border-sky-500 bg-sky-50/90 shadow-xs ring-2 ring-sky-500/30',
    borderClass: 'border-sky-200/90',
    iconBgClass: 'bg-sky-100/90',
    iconColorClass: 'text-sky-800',
    cardBgClass: 'bg-sky-50/50 hover:bg-sky-50/80',
  },
  esperando_confirmacion: {
    icon: 'verified',
    label: 'Espera Cierre',
    chipClass: 'bg-violet-50 text-violet-950 border-violet-200',
    badgeTone: 'progress',
    railClass: 'border-l-violet-600',
    numberClass: 'text-violet-950',
    bgSelectedClass: 'border-violet-500 bg-violet-50/90 shadow-xs ring-2 ring-violet-500/30',
    borderClass: 'border-violet-200/90',
    iconBgClass: 'bg-violet-100/90',
    iconColorClass: 'text-violet-800',
    cardBgClass: 'bg-violet-50/50 hover:bg-violet-50/80',
  },
  terminados: {
    icon: 'task_alt',
    label: 'Cerrados',
    chipClass: 'bg-emerald-50 text-emerald-950 border-emerald-200',
    badgeTone: 'done',
    railClass: 'border-l-emerald-600',
    numberClass: 'text-emerald-950',
    bgSelectedClass: 'border-emerald-500 bg-emerald-50/90 shadow-xs ring-2 ring-emerald-500/30',
    borderClass: 'border-emerald-200/90',
    iconBgClass: 'bg-emerald-100/90',
    iconColorClass: 'text-verde-sena',
    cardBgClass: 'bg-emerald-50/50 hover:bg-emerald-50/80',
  },
}

export default function SeguimientoSolicitud(): ReactNode {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [liveRefreshError, setLiveRefreshError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [opsFilter, setOpsFilter] = useState<LeaderOpsFilter>('operacion')
  const [urgencyQuickFilter, setUrgencyQuickFilter] = useState<'todos' | 'clase' | 'publico'>('todos')
  const [viewMode, setViewMode] = useState<'workspace' | 'table'>('workspace')
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [action, setAction] = useState<{ type: 'reassign' | 'cancel'; solicitud: Solicitud } | null>(null)
  const [tecnicos, setTecnicos] = useState<User[]>([])
  const [selectedTecnico, setSelectedTecnico] = useState('')
  const [motivo, setMotivo] = useState('')
  const [actionError, setActionError] = useState<unknown>(null)
  const [actionLastPayload, setActionLastPayload] = useState<unknown>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [openedRevision, setOpenedRevision] = useState<number | null>(null)
  const [freshIds, setFreshIds] = useState<string[]>([])
  const snapshotRef = useRef<Map<string, string> | null>(null)
  const itemsPerPage = viewMode === 'workspace' ? 7 : 10

  const rowSignature = (solicitud: Solicitud) => {
    const tecnicoId = typeof solicitud.tecnico === 'object' ? solicitud.tecnico?._id : solicitud.tecnico
    return `${solicitud.estado}|${tecnicoId ?? ''}|${solicitud.workflowRevision ?? ''}|${solicitud.queue ?? ''}`
  }

  const markFresh = (ids: string[]) => {
    if (ids.length === 0) return
    setFreshIds(ids)
    window.setTimeout(() => setFreshIds([]), 5000)
  }

  useEffect(() => {
    void fetchHistorial()
    const onLive = () => {
      void fetchHistorial(true)
    }
    window.addEventListener('ticket:updated', onLive)
    return () => window.removeEventListener('ticket:updated', onLive)
  }, [])

  const fetchHistorial = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setFetchError(null)
    }
    try {
      const data = await historialSolicitudesLider()
      if (snapshotRef.current) {
        const changed = data
          .filter((solicitud) => snapshotRef.current?.get(solicitud._id) !== rowSignature(solicitud))
          .map((solicitud) => solicitud._id)
        markFresh(changed)
      }
      snapshotRef.current = new Map(data.map((solicitud) => [solicitud._id, rowSignature(solicitud)]))
      setSolicitudes(data)
      setLiveRefreshError(null)
    } catch (error) {
      const message = getApiErrorMessage(error)
      if (silent) setLiveRefreshError(message)
      else setFetchError(message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, opsFilter, urgencyQuickFilter])

  const opsCounts = useMemo(() => countLeaderOps(solicitudes), [solicitudes])

  const activeTotal =
    opsCounts.por_iniciar +
    opsCounts.en_atencion +
    opsCounts.esperando_funcionario +
    opsCounts.esperando_confirmacion

  const filteredSolicitudes = useMemo(() => {
    const byOps = filterLeaderOps(solicitudes, opsFilter)
    const query = searchTerm.toLowerCase().trim()

    return byOps.filter((solicitud) => {
      const parsed = parseEnrichedDescription(solicitud.descripcion)

      if (urgencyQuickFilter === 'clase' && !parsed.modoExpress) return false
      if (urgencyQuickFilter === 'publico' && parsed.impactoServicio !== 'atencion_publico') return false

      if (!query) return true

      const codigo = (solicitud.codigoCaso || '').toLowerCase()
      const desc = leaderCaseNarrative(solicitud.descripcion).toLowerCase()
      const amb = (solicitud.ambiente?.nombre || '').toLowerCase()
      const tec = typeof solicitud.tecnico === 'object' ? (solicitud.tecnico?.nombre || '').toLowerCase() : ''
      const user = typeof solicitud.usuario === 'object' ? (solicitud.usuario?.nombre || '').toLowerCase() : ''

      return (
        codigo.includes(query) ||
        desc.includes(query) ||
        amb.includes(query) ||
        tec.includes(query) ||
        user.includes(query)
      )
    })
  }, [solicitudes, opsFilter, urgencyQuickFilter, searchTerm])

  const totalItems = filteredSolicitudes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSolicitudes.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    if (filteredSolicitudes.length === 0) {
      setSelectedCaseId(null)
      return
    }
    if (!selectedCaseId || !filteredSolicitudes.some((c) => c._id === selectedCaseId)) {
      setSelectedCaseId(filteredSolicitudes[0]._id)
    }
  }, [filteredSolicitudes, selectedCaseId])

  const selectedSolicitud = filteredSolicitudes.find((c) => c._id === selectedCaseId) ?? null

  const liveReassignRow =
    action?.type === 'reassign'
      ? solicitudes.find((item) => item._id === action.solicitud._id)
      : undefined
  const reassignContextStale = Boolean(
    action?.type === 'reassign' &&
      liveReassignRow &&
      (liveReassignRow.workflowRevision ?? 0) !== (openedRevision ?? action.solicitud.workflowRevision ?? 0),
  )

  const adoptFreshReassignContext = (): void => {
    if (!liveReassignRow) return
    setAction({ type: 'reassign', solicitud: liveReassignRow })
    setOpenedRevision(liveReassignRow.workflowRevision ?? 0)
    setSelectedTecnico('')
    setActionError(null)
  }

  const openReassign = async (solicitud: Solicitud): Promise<void> => {
    try {
      const response = await getTecnicosAprobados()
      setTecnicos(response.tecnicos ?? [])
      setSelectedTecnico('')
      setMotivo('')
      setActionError(null)
      setActionLastPayload(undefined)
      setOpenedRevision(solicitud.workflowRevision ?? 0)
      setAction({ type: 'reassign', solicitud })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const closeAction = (): void => {
    if (action) {
      clearWorkflowAttemptKey(action.type === 'cancel' ? 'cancel' : 'reassign', action.solicitud._id)
    }
    setAction(null)
    setOpenedRevision(null)
    setActionError(null)
    setActionLastPayload(undefined)
  }

  const currentActionPayload = (): unknown => {
    if (!action) return undefined
    if (action.type === 'cancel') return { motivo: motivo.trim() }
    return { tecnico: selectedTecnico, motivo: motivo.trim() }
  }

  const submitAction = async (payloadOverride?: unknown): Promise<void> => {
    if (!action || submitting) return
    const payload = (payloadOverride ?? currentActionPayload()) as { motivo?: string; tecnico?: string }
    const motivoError = validateRequiredMotivo(payload.motivo ?? '')
    if (motivoError) return
    if (action.type === 'reassign' && !payload.tecnico) return
    setSubmitting(true)
    try {
      if (action.type === 'cancel') {
        await cancelarSolicitud(action.solicitud._id, payload.motivo ?? '')
        toast.success('Solicitud cancelada correctamente')
      } else {
        await reasignarTecnico(action.solicitud._id, {
          tecnico: payload.tecnico!,
          motivo: payload.motivo ?? '',
          expectedRevision: openedRevision ?? action.solicitud.workflowRevision ?? 0,
        })
        toast.success('Técnico reasignado con éxito')
      }
    } catch (error) {
      const message = getApiErrorMessage(error)
      const stale = message.includes('cambió desde que abriste')
      if (stale) {
        clearWorkflowAttemptKey('reassign', action.solicitud._id)
        try {
          const fresh = await historialSolicitudesLider()
          setSolicitudes(fresh)
          const current = fresh.find((item) => item._id === action.solicitud._id)
          if (current) {
            setAction({ type: 'reassign', solicitud: current })
            setOpenedRevision(current.workflowRevision ?? 0)
            setSelectedTecnico('')
          }
        } catch (refreshError) {
          setLiveRefreshError(getApiErrorMessage(refreshError))
        }
      }
      setActionError(error)
      setActionLastPayload(payload)
      const failure = classifyWorkflowMutationFailure(error)
      if (!failure.offersManualRetry) {
        toast.error(message)
      }
      setSubmitting(false)
      return
    }
    try {
      const fresh = await historialSolicitudesLider()
      if (snapshotRef.current) {
        markFresh(
          fresh
            .filter((solicitud) => snapshotRef.current?.get(solicitud._id) !== rowSignature(solicitud))
            .map((solicitud) => solicitud._id),
        )
      }
      snapshotRef.current = new Map(fresh.map((solicitud) => [solicitud._id, rowSignature(solicitud)]))
      setSolicitudes(fresh)
      setLiveRefreshError(null)
    } catch (error) {
      setLiveRefreshError(getApiErrorMessage(error))
    }
    closeAction()
    setSubmitting(false)
  }

  return (
    <LeaderLayout>
      <div className="mx-auto w-full max-w-[1540px] px-3.5 py-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5" data-testid="seguimiento-page">
        {/* OPERATIONS HEADER: Identidad y Telemetría Bento Canónica (Líder TIC) */}
        <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-verde-sena animate-pulse shrink-0" />
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-azul-sena">
                  Seguimiento y Trazabilidad Operativa
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider text-azul-sena bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Mesa de Ayuda TIC · CTPI
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Auditoría en tiempo real de intervenciones técnicas, tiempos de atención y resoluciones operativas.
              </p>
            </div>

            {/* Control de Modo de Vista: Workspace Inspector vs Tabla Clásica */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Vista:</span>
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('workspace')}
                  aria-pressed={viewMode === 'workspace'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'workspace'
                      ? 'bg-white text-azul-sena shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Vista dividida con inspector de caso y bitácora táctica"
                  data-testid="toggle-view-workspace"
                >
                  <span className="material-symbols-outlined !text-[16px]">view_sidebar</span>
                  <span className="hidden sm:inline">Inspector</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-azul-sena shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Vista en tabla extendida con todas las columnas"
                  data-testid="toggle-view-table"
                >
                  <span className="material-symbols-outlined !text-[16px]">table_rows</span>
                  <span className="hidden sm:inline">Tabla</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* BENTO KPI FILTERS: Segmentación Operativa de 1 Clic con Alta Consistencia Visual (Espejo de las cards superiores) */}
        <section aria-label="Filtros de situación de casos" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* Tarjeta General: Ver Operación Activa */}
          <button
            type="button"
            aria-pressed={opsFilter === 'operacion'}
            onClick={() => setOpsFilter('operacion')}
            className={`flex items-center gap-3 rounded-2xl p-3 sm:p-3.5 text-left transition-all cursor-pointer border ${
              opsFilter === 'operacion'
                ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-2 ring-blue-500/30'
                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
            }`}
            data-testid="filter-operacion"
          >
            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 ${
              opsFilter === 'operacion' ? 'bg-blue-200/80 text-azul-sena' : 'bg-blue-100/90 text-azul-sena'
            }`}>
              <span className="material-symbols-outlined !text-[20px] sm:!text-[22px]" aria-hidden="true">monitoring</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider truncate text-azul-sena">
                Operación Activa
              </p>
              <p className="text-base sm:text-lg font-black leading-none mt-0.5 text-azul-sena tabular-nums" data-testid="kpi-en-operacion">
                {activeTotal}
              </p>
            </div>
          </button>

          {/* Tarjetas Específicas por Situación */}
          {(['por_iniciar', 'en_atencion', 'esperando_funcionario', 'esperando_confirmacion', 'terminados'] as const).map((sitId) => {
            const config = SITUATION_CONFIG[sitId]
            const value = opsCounts[sitId]
            const isSelected = opsFilter === sitId

            return (
              <button
                key={sitId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setOpsFilter(sitId)}
                className={`flex items-center gap-3 rounded-2xl p-3 sm:p-3.5 text-left transition-all cursor-pointer border ${
                  isSelected
                    ? config.bgSelectedClass
                    : `bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs`
                }`}
                data-testid={sitId === 'terminados' ? 'kpi-cerrados' : `filter-${sitId}`}
              >
                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? `${config.iconBgClass} ${config.iconColorClass}` : `${config.iconBgClass} ${config.iconColorClass}`
                }`}>
                  <span className="material-symbols-outlined !text-[20px] sm:!text-[22px]" aria-hidden="true">
                    {config.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${config.iconColorClass}`}>
                    {config.label}
                  </p>
                  <p className={`text-base sm:text-lg font-black leading-none mt-0.5 tabular-nums ${config.numberClass}`}>
                    {value}
                  </p>
                </div>
              </button>
            )
          })}
        </section>

        {liveRefreshError ? (
          <InlineAlert
            tone="warning"
            title="Seguimiento desactualizado"
            action={{ label: 'Reintentar', onClick: () => void fetchHistorial() }}
          >
            No se pudo actualizar el seguimiento en vivo. Los datos en pantalla pueden estar desactualizados. {liveRefreshError}
          </InlineAlert>
        ) : null}

        {/* WORKSPACE MODE: MASTER-DETAIL INTERFACE (Idéntico a Cola de Nuevos y Consola de Técnico) */}
        {viewMode === 'workspace' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* PANEL IZQUIERDO (4 Cols): Cola de Casos Asignados */}
            <div className="lg:col-span-5 xl:col-span-4 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SemanticIcon name="cola" className="text-slate-600 !text-[18px]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Casos Asignados</h2>
                  </div>
                  <span className="text-xs font-bold text-azul-sena bg-blue-100 px-2 py-0.5 rounded-full">
                    {filteredSolicitudes.length}
                  </span>
                </div>

                <SearchField
                  placeholder="Buscar caso, técnico o aula..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  label="Buscar casos en seguimiento"
                />

                {/* Filtros Rápidos de Urgencia Institucional */}
                <div className="flex items-center gap-1 text-[11px] pt-0.5">
                  {[
                    { id: 'todos', label: 'Todos', icon: 'apps' },
                    { id: 'clase', label: 'Clase en Vivo', icon: 'bolt' },
                    { id: 'publico', label: 'Público', icon: 'emergency' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setUrgencyQuickFilter(f.id as typeof urgencyQuickFilter)}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        urgencyQuickFilter === f.id
                          ? 'bg-azul-sena text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined !text-[12px]">{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-4">
                  <AdaptiveSkeletonList count={4} />
                </div>
              ) : fetchError ? (
                <div className="p-5">
                  <InlineAlert
                    tone="danger"
                    title="Fallo al consultar solicitudes"
                    action={{ label: 'Reintentar', onClick: () => void fetchHistorial() }}
                  >
                    {fetchError}
                  </InlineAlert>
                </div>
              ) : filteredSolicitudes.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <SemanticIcon name="solucionado" className="!text-[36px] mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Sin casos coincidentes</p>
                  <p className="text-xs text-slate-400 mt-1">No hay requerimientos en este filtro de situación.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto" role="list">
                  {currentItems.map((item) => {
                    const isSelected = selectedSolicitud?._id === item._id
                    const situation = leaderOpsSituation(item)
                    const visualConfig = SITUATION_CONFIG[situation]
                    const parsed = parseEnrichedDescription(item.descripcion)
                    const symptom = detectVisualSymptom(parsed, item.descripcion)
                    const isAtencionPublico = parsed.impactoServicio === 'atencion_publico'
                    const isExpress = parsed.modoExpress
                    const baseAmbiente = item.ambiente?.nombre?.trim() || ''
                    const oficina = parsed.oficina?.trim() || ''
                    const puesto = parsed.puesto?.trim() || ''
                    const mainLocation = [baseAmbiente || 'CTPI', oficina].filter(Boolean).join(' · ')
                    const tecnicoName = typeof item.tecnico === 'object' && item.tecnico?.nombre ? item.tecnico.nombre : 'Sin técnico'

                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => setSelectedCaseId(item._id)}
                        className={`w-full text-left p-3.5 transition-all flex flex-col gap-2 relative cursor-pointer border-l-[5px] ${
                          visualConfig.railClass
                        } ${
                          isSelected
                            ? 'bg-blue-50/90 shadow-xs ring-1 ring-blue-200'
                            : 'hover:bg-slate-50 bg-white'
                        }`}
                        data-testid={`case-item-${item._id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-azul-sena">
                              #{item.codigoCaso || item._id.slice(-6)}
                            </span>
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-azul-sena animate-ping" />
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${visualConfig.chipClass}`}>
                            <span className="material-symbols-outlined !text-[12px]">{visualConfig.icon}</span>
                            <span>{leaderFacingStatusLabel(item)}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[14px] text-azul-sena" aria-hidden="true">{symptom.icono}</span>
                            <span>{symptom.titulo}</span>
                          </span>
                          {isAtencionPublico && (
                            <span className="font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[14px] text-amber-700" aria-hidden="true">emergency</span>
                              <span>Público</span>
                            </span>
                          )}
                          {isExpress && (
                            <span className="font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[14px] text-rose-700" aria-hidden="true">bolt</span>
                              <span>En Vivo</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {parsed.rawDescription || item.descripcion}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-100">
                          <span className="font-semibold text-slate-700 truncate max-w-[140px] flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined !text-[15px] text-azul-sena" aria-hidden="true">engineering</span>
                            <span className="truncate">{tecnicoName}</span>
                          </span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md text-[10px] truncate max-w-[150px] inline-flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[13px]" aria-hidden="true">location_on</span>
                            {mainLocation} {puesto ? `· P.${puesto}` : ''}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {filteredSolicitudes.length > itemsPerPage ? (
                <div className="p-3 border-t border-slate-200 bg-slate-50">
                  <PaginationFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredSolicitudes.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : null}
            </div>

            {/* PANEL DERECHO (8 Cols): INSPECTOR DE DETALLE BENTO Y CONTROL EJECUTIVO */}
            <div className="lg:col-span-7 xl:col-span-8">
              {selectedSolicitud ? (
                (() => {
                  const parsedJob = parseEnrichedDescription(selectedSolicitud.descripcion)
                  const symptom = detectVisualSymptom(parsedJob, selectedSolicitud.descripcion)
                  const codigo = selectedSolicitud.codigoCaso || selectedSolicitud._id.slice(-6)
                  const rawTitle = parsedJob.rawDescription || selectedSolicitud.descripcion
                  const baseAmbiente = selectedSolicitud.ambiente?.nombre?.trim() || ''
                  const oficina = parsedJob.oficina?.trim() || ''
                  const puesto = parsedJob.puesto?.trim() || ''
                  const ubicacionPrincipal = [baseAmbiente || 'Sede CTPI', oficina].filter(Boolean).join(' · ')
                  const situation = leaderOpsSituation(selectedSolicitud)
                  const visualConfig = SITUATION_CONFIG[situation]
                  const solution = solutionPreview(selectedSolicitud)
                  const hasSolution = solution !== 'Sin solución registrada'
                  const tecnicoName = typeof selectedSolicitud.tecnico === 'object' && selectedSolicitud.tecnico?.nombre
                    ? selectedSolicitud.tecnico.nombre
                    : 'Sin técnico'

                  return (
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs" data-testid="inspector-detail">
                      {/* BENTO ROW 1: Encabezado del caso, Estado y Acciones Rápidas */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                        <div className="md:col-span-8 p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-lg bg-white border border-slate-200 text-azul-sena shadow-2xs">
                                #{codigo}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black border ${visualConfig.chipClass}`}>
                                <span className="material-symbols-outlined !text-[15px]">{visualConfig.icon}</span>
                                <span>{leaderFacingStatusLabel(selectedSolicitud)}</span>
                              </span>
                            </div>

                            {/* Botones de Acción Inmediata (Horizontales) */}
                            <div className="flex items-center gap-2">
                              {leaderReassignIsPrimary(selectedSolicitud) && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="shadow-2xs font-bold"
                                  onClick={() => void openReassign(selectedSolicitud)}
                                  icon="swap_horiz"
                                  data-testid="inspector-reassign-btn"
                                >
                                  Reasignar
                                </Button>
                              )}
                              <Button
                                variant="tertiary"
                                size="sm"
                                className="font-bold text-azul-sena bg-white border border-slate-200 hover:bg-blue-50"
                                onClick={() => setDetailId(selectedSolicitud._id)}
                                icon="history"
                                data-testid="inspector-history-btn"
                              >
                                Historial
                              </Button>
                              {canLeaderCancel(selectedSolicitud) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-2xs font-bold"
                                  onClick={() => {
                                    setMotivo('')
                                    setActionError(null)
                                    setActionLastPayload(undefined)
                                    setAction({ type: 'cancel', solicitud: selectedSolicitud })
                                  }}
                                  icon="close"
                                  data-testid="inspector-cancel-btn"
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            Radicado {formatSolicitudFecha(selectedSolicitud.fecha)} · Sede Central CTPI
                          </div>

                          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {rawTitle}
                          </h2>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <span className="material-symbols-outlined text-azul-sena !text-[18px]" aria-hidden="true">location_on</span>
                              <span>{ubicacionPrincipal}</span>
                              {puesto && <span className="text-slate-400">· Puesto {puesto}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Tarjeta 2: Técnico Responsable y Síntoma Diagnosticado */}
                        <div className="md:col-span-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[16px] text-azul-sena" aria-hidden="true">engineering</span>
                              Técnico Asignado
                            </span>
                            <span className="text-azul-sena font-black">CTPI</span>
                          </div>

                          <div className="py-3 flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-azul-sena shadow-2xs shrink-0 font-bold text-sm">
                              {tecnicoName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 leading-snug truncate">{tecnicoName}</p>
                              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                {leaderResponsibilityLine(selectedSolicitud)}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[14px]" aria-hidden="true">{symptom.icono}</span>
                              Síntoma
                            </span>
                            <span className="font-bold text-slate-800 truncate max-w-[120px]">
                              {symptom.titulo}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BENTO ROW 2: Trazabilidad y Avance de la Solución */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                            <span className="inline-flex items-center gap-1 text-azul-sena">
                              <span className="material-symbols-outlined !text-[16px]">task_alt</span>
                              Avance / Solución Registrada
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasSolution ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-500'}`}>
                              {hasSolution ? 'Registrada' : 'Pendiente'}
                            </span>
                          </div>
                          <p className={`text-xs sm:text-sm leading-relaxed pt-1 ${hasSolution ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
                            {hasSolution ? solution : 'El técnico no ha formalizado una solución o avance en el sistema todavía.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                            <span className="inline-flex items-center gap-1 text-azul-sena">
                              <span className="material-symbols-outlined !text-[16px]">photo_camera</span>
                              Evidencia Fotográfica
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">Mesa TIC</span>
                          </div>
                          {selectedSolicitud.foto ? (
                            <div className="flex items-center gap-3 pt-1">
                              <LeaderMediaThumb size="row" foto={selectedSolicitud.foto} alt={`Evidencia de ${codigo}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800">Foto adjunta de la incidencia</p>
                                <p className="text-[11px] text-slate-500">Haz clic sobre la imagen para inspeccionar</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                              <span className="material-symbols-outlined !text-[18px]">no_photography</span>
                              <span>No se adjuntó evidencia gráfica en la solicitud</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
                  <span className="material-symbols-outlined !text-[44px] text-slate-300">touch_app</span>
                  <p className="mt-2 text-sm font-bold text-slate-700">Selecciona un caso para inspeccionar</p>
                  <p className="text-xs text-slate-400 mt-1">El panel derecho te mostrará el avance, técnico y controles ejecutivos.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TABULAR EXTENDED MODE: TABLA COMPLETA CON BOTONES HORIZONTALES */
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs" data-testid="table-container">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 bg-slate-50/60">
              <div>
                <div className="flex items-center gap-2">
                  <SemanticIcon name="cola" className="text-azul-sena !text-[20px]" />
                  <h2 className="text-base sm:text-lg font-black text-azul-sena">
                    Seguimiento Tabular de Casos
                  </h2>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-azul-sena">
                    {totalItems} {totalItems === 1 ? 'caso' : 'casos'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">
                  Visualización densa de la operación técnica, especialistas y acciones ejecutivas de 1 clic.
                </p>
              </div>

              <div className="w-full sm:w-80">
                <SearchField
                  placeholder="Buscar por código, descripción, ambiente o técnico..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  label="Buscar casos en seguimiento"
                />
              </div>
            </div>

            <div className="w-full overflow-x-auto hairline-scrollbar">
              <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left">
                <caption className="sr-only">
                  Seguimiento de casos asignados en MiAyudaTic. Columnas: Situación, Responsable, Caso, Ambiente, Solución y Acciones.
                </caption>
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th scope="col" className="border-b border-slate-200 px-4 py-3 w-[15%]">Situación</th>
                    <th scope="col" className="border-b border-slate-200 px-4 py-3 w-[17%]">Especialista</th>
                    <th scope="col" className="border-b border-slate-200 px-4 py-3 w-[26%]">Requerimiento</th>
                    <th scope="col" className="border-b border-slate-200 px-4 py-3 w-[14%]">Ubicación</th>
                    <th scope="col" className="border-b border-slate-200 px-4 py-3 w-[16%]">Avance / Solución</th>
                    <th scope="col" className="border-b border-slate-200 px-4 py-3 w-[12%] text-right pr-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                          <span className="material-symbols-outlined !text-[32px] text-azul-sena animate-spin" aria-hidden="true">
                            progress_activity
                          </span>
                          <p className="text-sm font-bold text-slate-700">Cargando tablero de seguimiento…</p>
                          <p className="text-xs text-slate-400">Sincronizando estados y revisiones del flujo de trabajo</p>
                        </div>
                      </td>
                    </tr>
                  ) : fetchError ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <span className="material-symbols-outlined !text-[36px] text-red-500" aria-hidden="true">
                            error
                          </span>
                          <p className="text-sm font-bold text-red-700">{fetchError}</p>
                          <Button variant="secondary" size="sm" onClick={() => void fetchHistorial()} icon="refresh">
                            Reintentar conexión
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((row) => {
                      const situation = leaderOpsSituation(row)
                      const visualConfig = SITUATION_CONFIG[situation]
                      const solution = solutionPreview(row)
                      const hasSolution = solution !== 'Sin solución registrada'
                      const parsed = parseEnrichedDescription(row.descripcion)
                      const symptom = detectVisualSymptom(parsed, row.descripcion)
                      const narrative = leaderCaseNarrative(row.descripcion)
                      const responsibility = leaderResponsibilityLine(row)
                      const ambiente = row.ambiente?.nombre || 'General / Despacho'
                      const fresh = freshIds.includes(row._id)
                      const urgencies = leaderUrgencyMarks(row.descripcion)
                      const isCancelled = row.estado === 'cancelado'

                      return (
                        <tr
                          key={row._id}
                          className={`transition-colors hover:bg-slate-50/80 border-l-[5px] ${visualConfig.railClass} ${
                            fresh ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          {/* 1. Situación / Estado */}
                          <td className="px-4 py-3.5 align-middle">
                            <div className="space-y-1">
                              {isCancelled ? (
                                <StatusBadge estado="cancelado" label="Cancelada" size="sm" />
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black border ${visualConfig.chipClass}`}
                                >
                                  <span className="material-symbols-outlined !text-[14px]" aria-hidden="true">
                                    {visualConfig.icon}
                                  </span>
                                  <span>{leaderFacingStatusLabel(row)}</span>
                                </span>
                              )}
                              {fresh && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-azul-sena bg-blue-100/70 px-2 py-0.5 rounded-md">
                                  <span className="h-1.5 w-1.5 rounded-full bg-azul-sena animate-ping" />
                                  Actualizado
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 2. Responsable / Técnico */}
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex items-start gap-2">
                              <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-azul-sena shrink-0 mt-0.5 font-bold text-xs">
                                {typeof row.tecnico === 'object' && row.tecnico?.nombre ? row.tecnico.nombre.slice(0, 1) : 'T'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 line-clamp-1 leading-snug" title={responsibility}>
                                  {typeof row.tecnico === 'object' && row.tecnico?.nombre
                                    ? row.tecnico.nombre
                                    : 'Sin técnico'}
                                </p>
                                <p className="text-[11px] font-medium text-slate-500 line-clamp-1" title={responsibility}>
                                  {responsibility}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Requerimiento */}
                          <td className="px-4 py-3.5 align-middle">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-azul-sena">
                                  #{row.codigoCaso || row._id.slice(-6)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {formatSolicitudFecha(row.fecha)}
                                </span>
                              </div>

                              <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed" title={narrative}>
                                {narrative}
                              </p>

                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                  <span className="material-symbols-outlined !text-[13px] text-azul-sena" aria-hidden="true">
                                    {symptom.icono}
                                  </span>
                                  <span>{symptom.titulo}</span>
                                </span>

                                {urgencies.map((mark) => (
                                  <span
                                    key={mark}
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black ${
                                      mark === 'clase_en_vivo'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined !text-[13px]" aria-hidden="true">
                                      {mark === 'clase_en_vivo' ? 'bolt' : 'emergency'}
                                    </span>
                                    <span>{mark === 'clase_en_vivo' ? 'Clase en Vivo' : 'Atención al Público'}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* 4. Ubicación */}
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex items-center gap-1.5 text-slate-800">
                              <span className="material-symbols-outlined !text-[16px] text-azul-sena shrink-0" aria-hidden="true">
                                location_on
                              </span>
                              <span className="font-semibold text-xs line-clamp-2" title={ambiente}>
                                {ambiente}
                              </span>
                            </div>
                            {parsed.oficina && (
                              <p className="text-[11px] text-slate-500 pl-5 truncate" title={parsed.oficina}>
                                Ofic: {parsed.oficina} {parsed.puesto ? `· P.${parsed.puesto}` : ''}
                              </p>
                            )}
                          </td>

                          {/* 5. Avance / Solución */}
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex items-start gap-2.5">
                              {row.foto ? (
                                <div className="shrink-0">
                                  <LeaderMediaThumb size="row" foto={row.foto} alt={`Evidencia #${row.codigoCaso || 'caso'}`} />
                                </div>
                              ) : null}
                              <p
                                className={`text-xs leading-snug ${
                                  hasSolution ? 'font-medium text-slate-800 line-clamp-2' : 'italic text-slate-400'
                                }`}
                                title={hasSolution ? solution : 'Sin solución o bitácora registrada'}
                              >
                                {hasSolution ? solution : 'Sin solución registrada'}
                              </p>
                            </div>
                          </td>

                          {/* 6. Acciones Operativas (Disposición Horizontal Limpia) */}
                          <td className="px-4 py-3.5 align-middle text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Botón Reasignar */}
                              {leaderReassignIsPrimary(row) && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="shadow-2xs font-bold whitespace-nowrap"
                                  onClick={() => void openReassign(row)}
                                  icon="swap_horiz"
                                  title="Reasignar a otro técnico especialista"
                                >
                                  Reasignar
                                </Button>
                              )}

                              {/* Botón Historial */}
                              <Button
                                variant="tertiary"
                                size="sm"
                                className="font-bold whitespace-nowrap text-azul-sena hover:bg-blue-50"
                                onClick={() => setDetailId(row._id)}
                                icon="history"
                                title="Ver bitácora y línea de tiempo del caso"
                              >
                                Historial
                              </Button>

                              {/* Botón Cancelar */}
                              {canLeaderCancel(row) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-2xs font-bold whitespace-nowrap"
                                  onClick={() => {
                                    setMotivo('')
                                    setActionError(null)
                                    setActionLastPayload(undefined)
                                    setAction({ type: 'cancel', solicitud: row })
                                  }}
                                  icon="close"
                                  title="Cancelar solicitud con justificación obligatoria"
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                          <SemanticIcon name="solucionado" className="!text-[36px] text-emerald-500 mb-1" />
                          <p className="text-sm font-bold text-slate-700">
                            {searchTerm
                              ? 'Ningún caso coincide con el término de búsqueda.'
                              : opsFilter === 'terminados'
                                ? 'No hay solicitudes archivadas o cerradas actualmente.'
                                : 'No hay casos en este estado de operación.'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {searchTerm ? 'Prueba con otro código, nombre o descripción.' : 'Todos los casos siguen el flujo normal asignado.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50/70 p-3">
              <PaginationFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="solicitudes"
              />
            </div>
          </section>
        )}
      </div>

      {/* DRAWER: Reasignación o Cancelación con Trazabilidad */}
      <SlideOverDrawer
        isOpen={Boolean(action)}
        onClose={closeAction}
        title={action?.type === 'cancel' ? 'Cancelar Solicitud de Incidencia' : 'Reasignar Solicitud a Técnico'}
        subtitle={action ? `Caso #${action.solicitud.codigoCaso}. Acción ejecutiva con trazabilidad obligatoria.` : undefined}
        width="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="md" onClick={closeAction}>
              Cerrar
            </Button>
            <Button
              variant={action?.type === 'cancel' ? 'destructive' : 'primary'}
              size="md"
              disabled={
                submitting ||
                reassignContextStale ||
                Boolean(validateRequiredMotivo(motivo)) ||
                (action?.type === 'reassign' && !selectedTecnico)
              }
              onClick={() => void submitAction()}
              icon={action?.type === 'cancel' ? 'close' : 'swap_horiz'}
            >
              {submitting ? 'Guardando…' : action?.type === 'cancel' ? 'Confirmar Cancelación' : 'Confirmar Reasignación'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {action?.type === 'reassign' ? (
            <div className="space-y-1.5">
              {tecnicos.length === 0 ? (
                <p className="text-xs text-slate-500">No hay técnicos aprobados disponibles en el sistema.</p>
              ) : (
                <>
                  <label className="text-xs font-bold text-slate-700" htmlFor="seguimiento-tecnico">
                    Técnico acreditado
                  </label>
                  <select
                    id="seguimiento-tecnico"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-azul-sena"
                    value={selectedTecnico}
                    onChange={(event) => setSelectedTecnico(event.target.value)}
                  >
                    <option value="">Selecciona técnico responsable</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico._id} value={tecnico._id}>
                        {tecnico.nombre} · {tecnicoActiveLoad(solicitudes, tecnico._id)} activos
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          ) : null}

          {action?.type === 'reassign' && reassignContextStale ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              <p>
                Este caso cambió mientras el panel estaba abierto. El técnico actual es{' '}
                {liveReassignRow && typeof liveReassignRow.tecnico === 'object'
                  ? liveReassignRow.tecnico?.nombre || 'otro'
                  : 'otro'}
                . La confirmación con el contexto anterior queda bloqueada.
              </p>
              <button type="button" className="mt-2 font-bold underline cursor-pointer" onClick={adoptFreshReassignContext}>
                Decidir con el estado actual
              </button>
            </div>
          ) : null}

          {action?.type === 'reassign' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-950">
              {reassignConsequence(action.solicitud)}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700" htmlFor="seguimiento-motivo">
              Motivo justificado (obligatorio)
            </label>
            <textarea
              id="seguimiento-motivo"
              className="w-full min-h-28 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-azul-sena"
              placeholder="Detalla la justificación operativa del cambio..."
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
            />
          </div>

          <WorkflowManualRetryNotice
            error={actionError}
            lastPayload={actionLastPayload}
            currentPayload={currentActionPayload()}
            onRetry={() => void submitAction(actionLastPayload)}
          />
        </div>
      </SlideOverDrawer>

      {/* DRAWER: Historial y Eventos */}
      {detailId ? <LeaderTicketDrawer solicitudId={detailId} onClose={() => setDetailId(null)} /> : null}
    </LeaderLayout>
  )
}
