import { useState, useEffect, type ReactNode } from 'react'
import {
  asignarSolicitudTecnico,
  cancelarSolicitud,
  getSolicitudesPendientes,
  WorkflowManualRetryNotice,
} from '@/features/tickets'
import {
  canLeaderAssign,
  canLeaderCancel,
  formatSolicitudFecha,
  sortLeaderDispatch,
  validateRequiredMotivo,
} from '@/features/tickets/leader-inbox'
import { getTecnicosAprobados } from '@/features/users'
import { getApiErrorMessage } from '@/shared/api/apiError'
import {
  AppShell,
  SearchField,
  PaginationFooter,
  StatusBadge,
  Button,
  SlideOverDrawer,
  AdaptiveSkeletonList,
  SemanticIcon,
  FeedbackBanner,
  InlineAlert,
  toast,
} from '@/shared/ui'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import type { Solicitud, User } from '@/shared/types'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'

export default function AdminSolicitud(): ReactNode {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [liveRefreshError, setLiveRefreshError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [tecnicos, setTecnicos] = useState<User[]>([])
  const [loadingTecnicos, setLoadingTecnicos] = useState(false)
  const [tecnicosError, setTecnicosError] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<unknown>(null)
  const [assignLastPayload, setAssignLastPayload] = useState<{ tecnico: string } | undefined>(undefined)
  const [lastActionNotice, setLastActionNotice] = useState<{
    variant: 'success' | 'info' | 'warning' | 'danger'
    title: string
    description: string
    affectedCaseId?: string
    actor?: string
    nextStep?: string
  } | null>(null)

  const [cancelTarget, setCancelTarget] = useState<Solicitud | null>(null)
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<unknown>(null)
  const [cancelLastPayload, setCancelLastPayload] = useState<{ motivo: string } | undefined>(undefined)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    void fetchSolicitudes()
    void fetchTecnicos()

    const handleTicketLiveUpdate = () => {
      // Re-sincronización silenciosa en background sin CLS ni spinners invasivos
      void fetchSolicitudes(true)
    }

    window.addEventListener('ticket:updated', handleTicketLiveUpdate)
    return () => {
      window.removeEventListener('ticket:updated', handleTicketLiveUpdate)
    }
  }, [])

  const fetchSolicitudes = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setFetchError(null)
    }
    try {
      const data = await getSolicitudesPendientes()
      const list = sortLeaderDispatch(Array.isArray(data) ? data : [])
      setSolicitudes(list)
      setLiveRefreshError(null)
    } catch (error) {
      console.error('Error fetching solicitudes pendientes:', error)
      const message = getApiErrorMessage(error)
      if (silent) {
        setLiveRefreshError(message)
      } else {
        setFetchError(message)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const fetchTecnicos = async () => {
    setLoadingTecnicos(true)
    setTecnicosError(null)
    try {
      const res = await getTecnicosAprobados()
      setTecnicos(Array.isArray(res?.tecnicos) ? res.tecnicos : [])
    } catch (error) {
      console.error('Error fetching tecnicos:', error)
      setTecnicos([])
      setTecnicosError(getApiErrorMessage(error))
    } finally {
      setLoadingTecnicos(false)
    }
  }

  const [quickFilter, setQuickFilter] = useState<'todos' | 'aulas' | 'publico' | 'audiovisual' | 'red'>('todos')

  const filteredSolicitudes = solicitudes.filter((item) => {
    const s = searchTerm.toLowerCase()
    const matchesSearch =
      (item.codigoCaso || '').toLowerCase().includes(s) ||
      (item.descripcion || '').toLowerCase().includes(s) ||
      (typeof item.usuario === 'object' && item.usuario?.nombre ? item.usuario.nombre.toLowerCase().includes(s) : false) ||
      (item.ambiente?.nombre || '').toLowerCase().includes(s)

    if (!matchesSearch) return false

    if (quickFilter === 'todos') return true

    const parsed = parseEnrichedDescription(item.descripcion)
    const symptom = detectVisualSymptom(parsed, item.descripcion)

    if (quickFilter === 'aulas') {
      return Boolean(parsed.modoExpress || parsed.ficha)
    }
    if (quickFilter === 'publico') {
      return parsed.impactoServicio === 'atencion_publico'
    }
    if (quickFilter === 'audiovisual') {
      return symptom.id === 'pantalla_proyector'
    }
    if (quickFilter === 'red') {
      return symptom.id === 'red_internet'
    }

    return true
  })

  const totalPages = Math.ceil(filteredSolicitudes.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredSolicitudes.slice(startIndex, startIndex + itemsPerPage)
  const visibleKey = filteredSolicitudes.map((item) => item._id).join('|')

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  useEffect(() => {
    if (filteredSolicitudes.length === 0) {
      setSelectedCaseId(null)
      return
    }
    setSelectedCaseId((current) =>
      current && filteredSolicitudes.some((item) => item._id === current)
        ? current
        : filteredSolicitudes[0]._id,
    )
  }, [visibleKey])

  const selectedSolicitud = filteredSolicitudes.find((item) => item._id === selectedCaseId) ?? null

  const handleAssignClick = async (tecnico: User, solicitudId: string, cachedPayload?: { tecnico: string }) => {
    const target = solicitudes.find((item) => item._id === solicitudId)
    if (!target || !canLeaderAssign(target)) {
      toast.error('Este caso no se puede asignar desde la cola.')
      return
    }
    const payload = cachedPayload || { tecnico: tecnico._id }
    setAssigning(true)
    setAssignError(null)
    setAssignLastPayload(payload)

    try {
      await asignarSolicitudTecnico(solicitudId, payload)
      toast.success(`Caso asignado correctamente a ${tecnico.nombre}.`)
      setLastActionNotice({
        variant: 'success',
        title: 'Caso Asignado Correctamente',
        description: `${tecnico.nombre} quedó como responsable. La solicitud #${solicitudId.slice(-6)} salió de la cola de asignación.`,
        affectedCaseId: solicitudId,
        actor: tecnico.nombre,
        nextStep: 'El técnico recibió la notificación en su consola de campo para iniciar la intervención.',
      })
      setSolicitudes((prev) => prev.filter((item) => item._id !== solicitudId))
      if (selectedCaseId === solicitudId) setSelectedCaseId(null)
    } catch (err) {
      const classified = classifyWorkflowMutationFailure(err)
      if (classified.offersManualRetry) {
        setAssignError(err)
      } else {
        clearWorkflowAttemptKey('assign', solicitudId)
        toast.error(classified.message)
      }
    } finally {
      setAssigning(false)
    }
  }

  const handleCancelSubmit = async () => {
    const motivoError = validateRequiredMotivo(cancelMotivo)
    if (!cancelTarget || motivoError) {
      toast.error(motivoError || 'Debes indicar un motivo de cancelación.')
      return
    }
    const id = cancelTarget._id
    const payload = { motivo: cancelMotivo.trim() }
    setCancelling(true)
    setCancelError(null)
    setCancelLastPayload(payload)

    try {
      await cancelarSolicitud(id, payload.motivo)
      toast.success('Solicitud cancelada debidamente.')
      setLastActionNotice({
        variant: 'warning',
        title: 'Solicitud Cancelada',
        description: `Se canceló el caso #${id.slice(-6)} con motivo documentado: "${payload.motivo}".`,
        affectedCaseId: id,
        nextStep: 'El caso quedó registrado en el historial de cancelaciones.',
      })
      setSolicitudes((prev) => prev.filter((item) => item._id !== id))
      if (selectedCaseId === id) setSelectedCaseId(null)
      setCancelTarget(null)
      setCancelMotivo('')
    } catch (err) {
      const classified = classifyWorkflowMutationFailure(err)
      if (classified.offersManualRetry) {
        setCancelError(err)
      } else {
        clearWorkflowAttemptKey('cancel', id)
        toast.error(classified.message)
      }
    } finally {
      setCancelling(false)
    }
  }

  return (
    <AppShell subtitleContext="Centro de Mando">
      <div className="mx-auto w-full max-w-[1520px] px-4 py-5 sm:px-6 lg:px-8 space-y-5">
        
        {/* OPERATIONS HEADER: Telemetría soportada y control de despacho canónico (Bento Grid) */}
        <header className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                  Mando Operativo y Despacho de Soporte
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Centro de Control, Asignación Inmediata y Monitoreo · Sede Central CTPI
              </p>
            </div>

            {/* Mando Operativo Bento Telemetry */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/90 px-3 py-2 sm:px-4 sm:py-2.5 border border-amber-200/90 transition-all shadow-2xs">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-amber-200/70 flex items-center justify-center text-amber-800 shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">pending_actions</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">
                    Tickets Pendientes
                  </p>
                  <p className="text-sm sm:text-base font-black text-amber-950 leading-none mt-0.5">{filteredSolicitudes.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 px-3 py-2 sm:px-4 sm:py-2.5 border border-blue-200/90 transition-all shadow-2xs">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-100/80 flex items-center justify-center text-azul-sena shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">engineering</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-azul-sena uppercase tracking-wider truncate">Especialistas</p>
                  <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">
                    {tecnicosError ? '—' : tecnicos.length}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Sede Principal CTPI · Centro de Teleinformática y Producción Industrial
            </p>
            <div className="w-full sm:w-80">
              <SearchField
                placeholder="Buscar por código, ambiente o solicitante..."
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val)
                  setCurrentPage(1)
                }}
              />
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* DECISION QUEUE (Columna Izquierda - 4 cols en LG) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SemanticIcon name="cola" className="text-slate-500 !text-[18px]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Decisiones Pendientes</h2>
                  </div>
                  <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {filteredSolicitudes.length}
                  </span>
                </div>

                {/* Filtros Rápidos de 1 Clic para el Líder TIC */}
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  {[
                    { id: 'todos', label: 'Todos', icon: 'apps' },
                    { id: 'aulas', label: 'Clase en Vivo', icon: 'school' },
                    { id: 'publico', label: 'Atención Público', icon: 'emergency' },
                    { id: 'audiovisual', label: 'Pantallas', icon: 'videocam' },
                    { id: 'red', label: 'Internet', icon: 'wifi_off' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setQuickFilter(f.id as typeof quickFilter)
                        setCurrentPage(1)
                      }}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        quickFilter === f.id
                          ? 'bg-azul-sena text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined !text-[12px]">{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {liveRefreshError ? (
                <div className="p-3 border-b border-slate-200">
                  <InlineAlert
                    tone="warning"
                    title="La cola no se pudo actualizar"
                    action={{ label: 'Reintentar', onClick: () => void fetchSolicitudes() }}
                  >
                    {liveRefreshError} Los casos en pantalla pueden estar desactualizados.
                  </InlineAlert>
                </div>
              ) : null}

              {loading ? (
                <div className="p-4">
                  <AdaptiveSkeletonList count={5} />
                </div>
              ) : fetchError ? (
                <div className="p-5">
                  <InlineAlert
                    tone="danger"
                    title="Fallo al consultar solicitudes"
                    action={{ label: 'Reintentar', onClick: () => void fetchSolicitudes() }}
                  >
                    {fetchError}
                  </InlineAlert>
                </div>
              ) : filteredSolicitudes.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <SemanticIcon name="solucionado" className="!text-[36px] mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Bandeja de despacho al día</p>
                  <p className="text-xs text-slate-400 mt-1">No hay requerimientos pendientes de asignación.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto" role="list">
                  {currentItems.map((item) => {
                    const isSelected = selectedSolicitud?._id === item._id
                    const parsed = parseEnrichedDescription(item.descripcion)
                    const symptom = detectVisualSymptom(parsed, item.descripcion)
                    const isAtencionPublico = parsed.impactoServicio === 'atencion_publico'
                    const isExpress = parsed.modoExpress
                    const baseAmbiente = item.ambiente?.nombre?.trim() || ''
                    const oficina = parsed.oficina?.trim() || ''
                    const puesto = parsed.puesto?.trim() || ''
                    const isOficinaSame = oficina && baseAmbiente.toLowerCase().includes(oficina.toLowerCase())
                    const isAmbienteSame = baseAmbiente && oficina.toLowerCase().includes(baseAmbiente.toLowerCase())
                    const mainLocation = isOficinaSame || isAmbienteSame
                      ? (baseAmbiente || oficina || 'General')
                      : [baseAmbiente, oficina].filter(Boolean).join(' · ')

                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => setSelectedCaseId(item._id)}
                        className={`w-full text-left p-4 transition-all flex flex-col gap-2 relative cursor-pointer ${
                          isExpress
                            ? isSelected
                              ? 'bg-rose-50 border-l-[5px] border-l-rose-600 shadow-xs ring-1 ring-rose-200'
                              : 'bg-rose-50/80 hover:bg-rose-50 border-l-[5px] border-l-rose-500'
                            : isAtencionPublico
                              ? isSelected
                                ? 'bg-amber-50 border-l-[5px] border-l-amber-500 shadow-xs ring-1 ring-amber-200'
                                : 'bg-amber-50/70 hover:bg-amber-50 border-l-[5px] border-l-amber-400'
                              : isSelected
                                ? 'bg-blue-50/80 border-l-[5px] border-l-azul-sena shadow-xs ring-1 ring-blue-100'
                                : 'hover:bg-slate-50 bg-white border-l-[5px] border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-azul-sena">
                              #{item.codigoCaso || item._id.slice(-6)}
                            </span>
                            {isSelected && (
                              <span className={`h-2 w-2 rounded-full animate-ping ${
                                isExpress ? 'bg-rose-600' : isAtencionPublico ? 'bg-amber-500' : 'bg-azul-sena'
                              }`} />
                            )}
                          </div>
                          <StatusBadge estado={item.estado} label={item.displayStatus || item.estado} />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/90 flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[16px] text-azul-sena" aria-hidden="true">{symptom.icono}</span>
                            <span>{symptom.titulo}</span>
                          </span>
                          {isAtencionPublico && (
                            <span className="font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[16px] text-amber-700" aria-hidden="true">emergency</span>
                              <span>Atención al Público</span>
                            </span>
                          )}
                          {isExpress && (
                            <span className="font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[16px] text-rose-700" aria-hidden="true">bolt</span>
                              <span>Clase en Vivo</span>
                            </span>
                          )}
                        </div>

                        <h3 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${
                          isSelected
                            ? isExpress
                              ? 'text-rose-950 font-extrabold'
                              : isAtencionPublico
                                ? 'text-amber-950 font-extrabold'
                                : 'text-azul-sena font-extrabold'
                            : 'text-slate-800'
                        }`}>
                          {parsed.rawDescription || item.descripcion}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-100">
                          <span className="font-medium text-slate-700 truncate max-w-[140px] flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined !text-[16px] text-slate-500" aria-hidden="true">person</span>
                            <span className="truncate">
                              {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Sin solicitante'}
                            </span>
                          </span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[150px] inline-flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[14px]" aria-hidden="true">location_on</span>
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

            {/* REQUEST BRIEF & SPECIALIST PICKER: Formato Bento Canónico (Idéntico a la imagen) */}
            <div className="lg:col-span-8">
              {selectedSolicitud ? (
                (() => {
                  const parsedJob = parseEnrichedDescription(selectedSolicitud.descripcion)
                  const symptom = detectVisualSymptom(parsedJob, selectedSolicitud.descripcion)
                  const isAtencionPublico = parsedJob.impactoServicio === 'atencion_publico'
                  const isExpress = parsedJob.modoExpress
                  const codigo = selectedSolicitud.codigoCaso || selectedSolicitud._id.slice(-6)
                  const rawTitle = parsedJob.rawDescription || selectedSolicitud.descripcion
                  const baseAmbiente = selectedSolicitud.ambiente?.nombre?.trim() || ''
                  const oficina = parsedJob.oficina?.trim() || ''
                  const puesto = parsedJob.puesto?.trim() || ''
                  const isOficinaSame = oficina && baseAmbiente.toLowerCase().includes(oficina.toLowerCase())
                  const ubicacionPrincipal = isOficinaSame || !oficina ? (baseAmbiente || 'Sede CTPI') : `${baseAmbiente} · ${oficina}`

                  return (
                    <div className={`rounded-2xl shadow-xs overflow-hidden space-y-4 p-4 sm:p-6 transition-all ${
                      isExpress
                        ? 'border-2 border-rose-300 bg-rose-50/50'
                        : isAtencionPublico
                          ? 'border-2 border-amber-300 bg-amber-50/40'
                          : 'border border-slate-200/90 bg-white'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                        
                        {/* Tarjeta 1 (8 Cols): Código, Estado, Fecha y Requerimiento Principal */}
                        <div className={`md:col-span-8 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-3 ${
                          isExpress
                            ? 'bg-white border border-rose-200'
                            : isAtencionPublico
                              ? 'bg-white border border-amber-200'
                              : 'bg-slate-50/70 border border-slate-200/90'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-lg bg-white border border-slate-200 text-azul-sena shadow-2xs">
                                #{codigo}
                              </span>
                              <StatusBadge estado={selectedSolicitud.estado} label={selectedSolicitud.displayStatus || selectedSolicitud.estado} />
                            </div>

                            {canLeaderCancel(selectedSolicitud) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(selectedSolicitud)
                                  setCancelMotivo('')
                                  setCancelError(null)
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                              >
                                Cancelar caso
                              </button>
                            ) : null}
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            Radicado {formatSolicitudFecha(selectedSolicitud.fecha)}
                          </div>

                          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {rawTitle}
                          </h2>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/70 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <span className="material-symbols-outlined text-azul-sena !text-[18px]" aria-hidden="true">location_on</span>
                              <span>{ubicacionPrincipal}</span>
                              {puesto && <span className="text-slate-400">· Puesto {puesto}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70 pb-2">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[16px]" aria-hidden="true">{symptom.icono}</span>
                              Síntoma diagnosticado
                            </span>
                            <span className="text-azul-sena font-black">Mesa TIC</span>
                          </div>
                          <div className="py-3 flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-azul-sena shadow-2xs shrink-0">
                              <span className="material-symbols-outlined !text-[24px]" aria-hidden="true">{symptom.icono}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 leading-snug">{symptom.titulo}</p>
                              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{symptom.tag}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[14px]" aria-hidden="true">person</span>
                              Solicitante
                            </span>
                            <span className="font-bold text-slate-800 truncate max-w-[120px]">
                              {typeof selectedSolicitud.usuario === 'object' ? selectedSolicitud.usuario?.nombre : 'Funcionario'}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* BENTO ROW 2: Banner de Acción Requerida */}
                      <div className={`p-4 rounded-2xl shadow-2xs flex items-center gap-3.5 border ${
                        isExpress
                          ? 'bg-rose-100/80 border-rose-300'
                          : isAtencionPublico
                            ? 'bg-amber-100/80 border-amber-300'
                            : 'bg-linear-to-r from-blue-50/90 to-indigo-50/80 border-blue-200/90'
                      }`}>
                        <div className={`h-10 w-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs ${
                          isExpress ? 'bg-rose-600' : isAtencionPublico ? 'bg-amber-500' : 'bg-azul-sena'
                        }`}>
                          <span className="material-symbols-outlined !text-[22px]">
                            {isExpress ? 'bolt' : isAtencionPublico ? 'emergency' : 'assignment'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-bold uppercase tracking-wider ${
                            isExpress ? 'text-rose-800' : isAtencionPublico ? 'text-amber-900' : 'text-azul-sena'
                          }`}>
                            {isExpress ? 'Clase en vivo — despachar primero' : isAtencionPublico ? 'Atención al público — prioridad alta' : 'Decisión operativa del líder TIC'}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                            {isExpress
                              ? 'Hay formación en curso. Asigna un especialista antes que el resto de la cola.'
                              : isAtencionPublico
                                ? 'Hay personas esperando en ventanilla. Este caso va antes que un soporte ordinario.'
                                : 'Evalúa el requerimiento y despacha a uno de los especialistas listos para intervención en sitio.'}
                          </p>
                        </div>
                      </div>

                      {/* BENTO ROW 3: Contexto Físico y Evidencia Gráfica */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70 pb-1.5">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[16px] text-emerald-700" aria-hidden="true">location_on</span>
                              Ambiente de formación / oficina
                            </span>
                            <span className="text-emerald-700 font-bold">Soporte en sitio</span>
                          </div>
                          <div className="flex items-center gap-3 pt-1">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 font-black text-xs shrink-0">
                              CTPI
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 truncate">{ubicacionPrincipal}</p>
                              <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                                <span className="material-symbols-outlined !text-[14px]" aria-hidden="true">call</span>
                                {selectedSolicitud.telefono || 'Sin teléfono registrado'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70 pb-1.5">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined !text-[16px] text-azul-sena" aria-hidden="true">photo_camera</span>
                              Archivo de evidencia
                            </span>
                            <span className="text-azul-sena font-bold">Inspección gráfica</span>
                          </div>
                          {selectedSolicitud.foto ? (
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(selectedSolicitud.foto?.url || null)}
                                className="h-12 w-16 rounded-lg overflow-hidden border border-slate-300 shrink-0"
                              >
                                <img src={selectedSolicitud.foto.url} alt="Evidencia" className="h-full w-full object-cover" />
                              </button>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800">Foto adjunta por solicitante</p>
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(selectedSolicitud.foto?.url || null)}
                                  className="text-xs text-azul-sena font-bold hover:underline"
                                >
                                  Abrir en pantalla completa
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                              <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">no_photography</span>
                              <span>No se adjuntó evidencia gráfica en la radicación</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BENTO ROW 4: PANEL DE DESPACHO DE ESPECIALISTAS (1-Clic) */}
                      <div className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-azul-sena !text-[20px]" aria-hidden="true">engineering</span>
                              <h3 className="text-sm font-black text-slate-900">
                                Despachar caso #{codigo} a especialista
                              </h3>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              La asignación es inmediata y enviará la alerta en tiempo real a la consola de campo del técnico.
                            </p>
                          </div>
                          {!tecnicosError ? (
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shrink-0">
                              {tecnicos.length} especialistas listos
                            </span>
                          ) : null}
                        </div>

                        {loadingTecnicos ? (
                          <AdaptiveSkeletonList count={3} />
                        ) : tecnicosError ? (
                          <InlineAlert
                            tone="danger"
                            title="No se pudo cargar el equipo técnico"
                            action={{ label: 'Reintentar', onClick: () => void fetchTecnicos() }}
                          >
                            {tecnicosError}
                          </InlineAlert>
                        ) : tecnicos.length === 0 ? (
                          <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                            <p className="text-xs font-semibold text-slate-500">No hay técnicos aprobados en el sistema.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-0.5">
                            {tecnicos.map((tecnico) => (
                              <div
                                key={tecnico._id}
                                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-10 w-10 rounded-xl bg-azul-sena text-white font-black text-sm flex items-center justify-center shrink-0">
                                    {tecnico.nombre.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{tecnico.nombre}</p>
                                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                                      En Guardia {tecnico.telefono ? `· ${tecnico.telefono}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="primary"
                                  disabled={assigning || !canLeaderAssign(selectedSolicitud)}
                                  onClick={() => void handleAssignClick(tecnico, selectedSolicitud._id)}
                                  className="bg-azul-sena hover:bg-blue-800 text-white text-xs font-bold shrink-0 !py-2 !px-3 shadow-2xs"
                                >
                                  {assigning ? 'Despachando...' : `Asignar a ${tecnico.nombre.split(' ')[0]}`}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {assignError ? (
                          <WorkflowManualRetryNotice
                            error={assignError}
                            lastPayload={assignLastPayload}
                            currentPayload={assignLastPayload}
                            onRetry={() => {
                              if (!assignLastPayload || !selectedSolicitud) return
                              const tec = tecnicos.find((t) => t._id === assignLastPayload.tecnico)
                              if (tec) void handleAssignClick(tec, selectedSolicitud._id, assignLastPayload)
                            }}
                          />
                        ) : null}
                      </div>

                    </div>
                  )
                })()
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
                  <p className="text-base font-semibold text-slate-700">Selecciona una solicitud pendiente</p>
                  <p className="text-xs text-slate-500 mt-1">El contexto del aula y el selector de despacho de técnicos se activarán aquí.</p>
                </div>
              )}
            </div>
          </div>

        {/* ======================================================== */}
        {/* CancellationDrawer: Cancelación con justificación obligatoria */}
        {cancelTarget ? (
          <SlideOverDrawer
            isOpen={Boolean(cancelTarget)}
            onClose={() => setCancelTarget(null)}
            title="Cancelar Requerimiento Técnico"
            subtitle={`Caso #${cancelTarget.codigoCaso || cancelTarget._id.slice(-6)} · ${cancelTarget.ambiente?.nombre || 'General'}`}
            footer={
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setCancelTarget(null)}>
                  Volver
                </Button>
                <Button
                  variant="primary"
                  disabled={cancelling || Boolean(validateRequiredMotivo(cancelMotivo))}
                  onClick={() => void handleCancelSubmit()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="text-xs font-bold text-amber-800">Advertencia Operativa</p>
                <p className="text-xs text-amber-700 mt-1">
                  La cancelación debe ser justificada (duplicidad, resolución previa por el usuario o reporte erróneo).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Motivo de cancelación <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={cancelMotivo}
                  onChange={(e) => setCancelMotivo(e.target.value)}
                  placeholder="Explica detalladamente por qué se cancela esta solicitud..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-azul-sena focus:ring-1 focus:ring-azul-sena"
                />
              </div>

              {cancelError ? (
                <WorkflowManualRetryNotice
                  error={cancelError}
                  lastPayload={cancelLastPayload}
                  currentPayload={{ motivo: cancelMotivo }}
                  onRetry={() => void handleCancelSubmit()}
                />
              ) : null}
            </div>
          </SlideOverDrawer>
        ) : null}

        {/* Image Preview Modal */}
        {previewImage ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-3xl overflow-hidden rounded-2xl bg-white p-2">
              <img src={previewImage} alt="Vista ampliada" className="max-h-[85vh] w-full object-contain" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute right-4 top-4 rounded-full bg-slate-900/70 p-1.5 text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </AppShell>
  )
}
