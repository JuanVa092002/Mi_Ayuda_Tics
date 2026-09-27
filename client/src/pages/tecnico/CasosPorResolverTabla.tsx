import { useState, useEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import {
  AppShell,
  SearchField,
  PaginationFooter,
  StatusBadge,
  Button,
  WorkCanvas,
  SplitWorkspace,
  Pane,
  SlideOverDrawer,
  AdaptiveSkeletonList,
} from '@/shared/ui'
import {
  ResolutionModal,
  getCasosAsignados,
  getCasos,
  submitSolucionCaso,
  iniciarAtencion,
  agregarActualizacion,
  solicitarInformacion,
  registrarSolucionParcial,
  registrarSolucionTotal,
  WorkflowManualRetryNotice,
} from '@/features/tickets'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import type { CaseForResolution, Solicitud, TipoCaso, TipoSolucion } from '@/shared/types'

export default function CasosPorResolverTabla(): ReactNode {
  const [cases, setCases] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseForResolution | null>(null)
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null)
  const [caseTypes, setCaseTypes] = useState<TipoCaso[]>([])
  const [loading, setLoading] = useState(true)
  const [workflowTarget, setWorkflowTarget] = useState<Solicitud | null>(null)
  const [workflowKind, setWorkflowKind] = useState<'update' | 'info' | 'partial' | 'total' | null>(null)
  const [workflowText, setWorkflowText] = useState({ mensaje: '', queSeHizo: '', queFalta: '', siguienteAccion: '' })
  const [workflowError, setWorkflowError] = useState<unknown>(null)
  const [workflowLastPayload, setWorkflowLastPayload] = useState<unknown>(undefined)
  const [startRetry, setStartRetry] = useState<{ id: string; error: unknown } | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [queueFilter, setQueueFilter] = useState<
    'trabajo' | 'por_iniciar' | 'en_atencion' | 'esperando_funcionario' | 'esperando_confirmacion'
  >('trabajo')

  useEffect(() => {
    const fetchCases = async (): Promise<void> => {
      try {
        const solicitudesAsignadas = await getCasosAsignados()
        const activeTickets = solicitudesAsignadas.filter(
          (c) => c.estado !== 'finalizado' && c.estado !== 'cerrado' && c.estado !== 'cancelado'
        )
        setCases(activeTickets)
        if (activeTickets.length > 0) {
          // Select in-progress case if exists, else first
          const inProgress = activeTickets.find(
            (c) => c.estado === 'en_progreso' || c.estado === 'en_atencion'
          )
          setActiveCaseId(inProgress ? inProgress._id : activeTickets[0]._id)
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }

    const fetchCaseTypes = async (): Promise<void> => {
      try {
        const response = await getCasos()
        if (Array.isArray(response.data)) {
          setCaseTypes(response.data)
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }

    void (async () => {
      setLoading(true)
      await Promise.all([fetchCases(), fetchCaseTypes()])
      setLoading(false)
    })()
  }, [])

  const queueOf = (row: Solicitud): string => {
    if (row.queue) return row.queue
    if (row.workflowVersion === 2) {
      if (row.estado === 'asignado') return 'por_iniciar'
      if (row.estado === 'en_progreso') return 'en_atencion'
      if (row.estado === 'esperando_usuario') return 'esperando_funcionario'
      if (row.estado === 'resuelto') return 'esperando_confirmacion'
    }
    if (row.estado === 'asignado' || row.estado === 'pendiente') return 'en_atencion'
    return 'en_atencion'
  }

  const queuedCases = cases.filter((row) => {
    const queue = queueOf(row)
    if (queueFilter === 'trabajo') {
      return queue === 'por_iniciar' || queue === 'en_atencion' || queue === 'esperando_funcionario'
    }
    return queue === queueFilter
  })

  const filteredData = queuedCases.filter(
    (row) =>
      (row.codigoCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof row.usuario === 'object' && row.usuario?.nombre
        ? row.usuario.nombre
        : ''
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (row.ambiente?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  // Determine the Focus Case: either the one currently in progress or the oldest pending
  const inProgressCase = cases.find(
    (c) => c.estado === 'en_progreso' || c.estado === 'en_atencion'
  )
  const focusCase = inProgressCase || cases[0] || null

  // Inspected case for side pane
  const inspectedCase = cases.find((c) => c._id === activeCaseId) || focusCase || null

  const openModal = (caseData: Solicitud): void => {
    setSelectedCase({
      ...caseData,
      solucion: '',
      tipoCaso: '',
      tipoSolucion: undefined,
    })
    setModalIsOpen(true)
  }

  const closeModal = (): void => {
    setModalIsOpen(false)
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!selectedCase) return

      const payload = {
        descripcionSolucion: selectedCase.solucion ?? '',
        tipoCaso: selectedCase.tipoCaso ?? '',
        tipoSolucion: selectedCase.tipoSolucion as TipoSolucion,
      }

      if (!payload.descripcionSolucion || !payload.tipoCaso || !payload.tipoSolucion) {
        toast.error('Por favor completa todos los campos antes de enviar.')
        return
      }

      await submitSolucionCaso(selectedCase._id, payload)

      if (payload.tipoSolucion === 'finalizado') {
        setCases((prev) => prev.filter((c) => c._id !== selectedCase._id))
      }
      closeModal()
      toast.success('Solución enviada exitosamente')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const refreshCases = async (): Promise<void> => {
    const solicitudesAsignadas = await getCasosAsignados()
    const active = solicitudesAsignadas.filter(
      (c) => c.estado !== 'finalizado' && c.estado !== 'cerrado' && c.estado !== 'cancelado'
    )
    setCases(active)
  }

  const closeWorkflowModal = (): void => {
    if (workflowTarget && workflowKind) {
      const action =
        workflowKind === 'update'
          ? 'update'
          : workflowKind === 'info'
            ? 'wait_for_requester'
            : workflowKind === 'partial'
              ? 'partial_solution'
              : 'resolve'
      clearWorkflowAttemptKey(action, workflowTarget._id)
    }
    setWorkflowKind(null)
    setWorkflowTarget(null)
    setWorkflowError(null)
    setWorkflowLastPayload(undefined)
  }

  const currentWorkflowPayload = (): unknown => {
    if (workflowKind === 'update' || workflowKind === 'info') return { mensaje: workflowText.mensaje }
    if (workflowKind === 'partial') {
      return {
        queSeHizo: workflowText.queSeHizo,
        queFalta: workflowText.queFalta,
        siguienteAccion: workflowText.siguienteAccion,
      }
    }
    if (workflowKind === 'total') return { queSeHizo: workflowText.queSeHizo }
    return undefined
  }

  const runStart = (solicitudId: string): void => {
    void iniciarAtencion(solicitudId)
      .then(() => {
        setStartRetry(null)
        toast.success('Atención técnica iniciada')
        return refreshCases()
      })
      .catch((error) => {
        setStartRetry({ id: solicitudId, error })
        toast.error(getApiErrorMessage(error))
      })
  }

  const submitWorkflow = async (payloadOverride?: unknown): Promise<void> => {
    if (!workflowTarget || !workflowKind) return
    const payload = payloadOverride ?? currentWorkflowPayload()
    try {
      if (workflowKind === 'update') {
        await agregarActualizacion(workflowTarget._id, (payload as { mensaje: string }).mensaje)
      }
      if (workflowKind === 'info') {
        await solicitarInformacion(workflowTarget._id, (payload as { mensaje: string }).mensaje)
      }
      if (workflowKind === 'partial') {
        await registrarSolucionParcial(
          workflowTarget._id,
          payload as { queSeHizo: string; queFalta: string; siguienteAccion: string }
        )
      }
      if (workflowKind === 'total') {
        await registrarSolucionTotal(workflowTarget._id, payload as { queSeHizo: string })
      }
      toast.success('Acción registrada con éxito')
      closeWorkflowModal()
      await refreshCases()
    } catch (error) {
      setWorkflowError(error)
      setWorkflowLastPayload(payload)
      const failure = classifyWorkflowMutationFailure(error)
      if (!failure.offersManualRetry) {
        toast.error(getApiErrorMessage(error))
      }
    }
  }

  const queueTabs = [
    {
      id: 'trabajo',
      label: 'Cola de Trabajo',
      count: cases.filter((c) =>
        ['por_iniciar', 'en_atencion', 'esperando_funcionario'].includes(queueOf(c))
      ).length,
    },
    {
      id: 'por_iniciar',
      label: 'Por Iniciar',
      count: cases.filter((c) => queueOf(c) === 'por_iniciar').length,
    },
    {
      id: 'en_atencion',
      label: 'En Atención Activa',
      count: cases.filter((c) => queueOf(c) === 'en_atencion').length,
    },
    {
      id: 'esperando_funcionario',
      label: 'Esperando Funcionario',
      count: cases.filter((c) => queueOf(c) === 'esperando_funcionario').length,
    },
    {
      id: 'esperando_confirmacion',
      label: 'Esperando Confirmación',
      count: cases.filter((c) => queueOf(c) === 'esperando_confirmacion').length,
    },
  ] as const

  return (
    <AppShell subtitleContext="Consola de Resolución Operativa Técnica">
      <WorkCanvas>
        {/* Top Hero: "Focus Case" Console (Unmistakable Operational Hero) */}
        {focusCase ? (
          <section
            className="rounded-2xl border p-5 lg:p-6 relative overflow-hidden"
            style={{
              borderColor: 'var(--border-strong-c)',
              background: 'linear-gradient(135deg, #04324d 0%, #084364 100%)',
              color: '#ffffff',
              boxShadow: 'var(--sh-md)',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-verde-sena text-white">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Caso en Foco Prioritario
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-200">
                    #{focusCase.codigoCaso || focusCase._id.slice(-6)}
                  </span>
                  <StatusBadge status={focusCase.estado} />
                </div>
                <h2 className="text-xl lg:text-2xl font-extrabold text-white leading-snug">
                  {focusCase.descripcion}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-200 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-emerald-400">location_on</span>
                    {focusCase.ambiente?.nombre || 'Ambiente no especificado'}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-slate-300">person</span>
                    {typeof focusCase.usuario === 'object' ? focusCase.usuario?.nombre : 'Funcionario'}
                  </span>
                  {focusCase.telefono ? (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <span className="material-symbols-outlined !text-[15px]">call</span>
                        {focusCase.telefono}
                      </span>
                    </>
                  ) : null}
                  <span>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-slate-300">schedule</span>
                    {focusCase.fecha}
                  </span>
                </div>
              </div>

              {/* Instant Action Cluster */}
              <div className="shrink-0 flex flex-wrap items-center gap-2.5 bg-black/20 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
                {focusCase.workflowVersion === 2 ? (
                  <>
                    {focusCase.capabilities?.canStart ? (
                      <Button
                        variant="success"
                        size="md"
                        onClick={() => runStart(focusCase._id)}
                        icon="play_arrow"
                        className="shadow-md"
                      >
                        Iniciar atención
                      </Button>
                    ) : null}

                    {focusCase.capabilities?.canUpdate ? (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setWorkflowError(null)
                          setWorkflowLastPayload(undefined)
                          setWorkflowTarget(focusCase)
                          setWorkflowKind('update')
                        }}
                        icon="edit_note"
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      >
                        Bitácora
                      </Button>
                    ) : null}

                    {focusCase.capabilities?.canResolve ? (
                      <Button
                        variant="success"
                        size="md"
                        onClick={() => {
                          setWorkflowError(null)
                          setWorkflowLastPayload(undefined)
                          setWorkflowTarget(focusCase)
                          setWorkflowKind('total')
                        }}
                        icon="task_alt"
                        className="shadow-md"
                      >
                        Finalizar caso
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => openModal(focusCase)}
                    icon="check_circle"
                  >
                    Resolver caso
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveCaseId(focusCase._id)}
                  icon="visibility"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Ver en inspector
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {/* Operational Filter Bar & Search */}
        <section
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border bg-surface p-4"
          style={{ borderColor: 'var(--border-c)', boxShadow: 'var(--sh-xs)' }}
        >
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtros de bandeja técnica">
            {queueTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={queueFilter === tab.id}
                onClick={() => {
                  setQueueFilter(tab.id)
                  setCurrentPage(1)
                }}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
                  queueFilter === tab.id
                    ? 'bg-azul-sena text-white shadow-xs'
                    : 'bg-surface-subtle text-slate-700 hover:bg-slate-100 border border-border-subtle'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    queueFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por caso, ambiente o usuario..."
              label="Buscar en incidencias técnicas"
            />
          </div>
        </section>

        {/* Operational Split Workspace: Queue Cards on Left, Persistent Inspector on Right */}
        <SplitWorkspace
          queue={
            <Pane
              title="Cola Operativa Clasificada"
              meta={`Página ${currentPage} de ${Math.max(1, totalPages)} · ${totalItems} requerimientos`}
              footer={
                <PaginationFooter
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  itemLabel="casos"
                />
              }
            >
              {loading ? (
                <AdaptiveSkeletonList count={4} />
              ) : currentItems.length === 0 ? (
                <div className="py-20 text-center px-4">
                  <span className="material-symbols-outlined !text-[44px] text-slate-300">task_alt</span>
                  <p className="mt-2 text-sm font-bold text-slate-700">Sin casos pendientes en esta cola</p>
                  <p className="text-xs text-slate-400 mt-0.5">El filtro seleccionado se encuentra totalmente atendido.</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-c)' }} role="list">
                  {currentItems.map((item) => {
                    const isSelected = inspectedCase?._id === item._id
                    const isFocus = item.estado === 'en_progreso' || item.estado === 'en_atencion'
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => setActiveCaseId(item._id)}
                        className={`w-full text-left p-4 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-surface-selected border-l-4 border-l-verde-sena'
                            : 'hover:bg-surface-subtle'
                        }`}
                      >
                        {isFocus ? (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            En intervención
                          </span>
                        ) : null}

                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-azul-sena">
                            #{item.codigoCaso || item._id.slice(-6)}
                          </span>
                          <span className="text-[11px] text-slate-400">· {item.fecha}</span>
                        </div>

                        <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 mb-2">
                          {item.descripcion}
                        </h3>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600 truncate max-w-[170px]">
                            {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Funcionario'}
                          </span>
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-verde-sena border border-emerald-200">
                            {item.ambiente?.nombre || 'General'}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between">
                          <StatusBadge status={item.estado} />
                          {item.foto ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-azul-sena">
                              <span className="material-symbols-outlined !text-[15px]">photo_camera</span>
                              Foto adjunta
                            </span>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </Pane>
          }
          detail={
            <div>
              {inspectedCase ? (
                <div
                  className="rounded-2xl border overflow-hidden sticky top-[72px]"
                  style={{
                    borderColor: 'var(--border-c)',
                    boxShadow: 'var(--sh-sm)',
                    background: 'var(--surface-0)',
                  }}
                >
                  {/* Header of Detail Pane */}
                  <div
                    className="p-5 border-b"
                    style={{ borderColor: 'var(--border-c)', background: 'var(--surface-1)' }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-azul-sena">
                          #{inspectedCase.codigoCaso || inspectedCase._id.slice(-6)}
                        </span>
                        <StatusBadge status={inspectedCase.estado} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Fecha: {inspectedCase.fecha}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-azul-sena leading-snug">
                      {inspectedCase.descripcion}
                    </h2>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-5">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle">
                        <span className="text-[10px] font-black uppercase text-slate-400">Funcionario</span>
                        <p className="text-xs font-bold text-azul-sena mt-0.5 truncate">
                          {typeof inspectedCase.usuario === 'object'
                            ? inspectedCase.usuario?.nombre
                            : 'Desconocido'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {inspectedCase.telefono ? `Tel: ${inspectedCase.telefono}` : 'Sin teléfono'}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle">
                        <span className="text-[10px] font-black uppercase text-slate-400">Ubicación Física</span>
                        <p className="text-xs font-bold text-azul-sena mt-0.5 truncate">
                          {inspectedCase.ambiente?.nombre || 'General'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Sede CTPI</p>
                      </div>
                    </div>

                    {/* Evidence Viewer if present */}
                    {inspectedCase.foto ? (
                      <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle">
                        <p className="text-xs font-bold text-azul-sena mb-2.5 flex items-center gap-1.5">
                          <span className="material-symbols-outlined !text-[18px]">photo_camera</span>
                          Evidencia Fotográfica del Fallo
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(inspectedCase.foto?.url || null)}
                            className="h-20 w-28 rounded-xl overflow-hidden border border-border-subtle group relative cursor-pointer"
                          >
                            <img
                              src={inspectedCase.foto.url}
                              alt="Evidencia fotográfica"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <span className="material-symbols-outlined !text-[18px]">zoom_in</span>
                            </div>
                          </button>
                          <div className="text-xs text-slate-500 space-y-0.5">
                            <p className="font-bold text-slate-700">Captura adjunta por el usuario</p>
                            <p>Haz clic sobre la imagen para abrirla en alta resolución.</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Operational Action Bar */}
                    <div className="pt-2 border-t border-border-subtle space-y-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Acciones Operativas Disponibles
                      </p>

                      {inspectedCase.workflowVersion === 2 ? (
                        <div className="flex flex-wrap items-center gap-2.5">
                          {inspectedCase.capabilities?.canStart ? (
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => runStart(inspectedCase._id)}
                              icon="play_arrow"
                            >
                              Iniciar atención en sitio
                            </Button>
                          ) : null}

                          {inspectedCase.capabilities?.canUpdate ? (
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() => {
                                setWorkflowError(null)
                                setWorkflowLastPayload(undefined)
                                setWorkflowTarget(inspectedCase)
                                setWorkflowKind('update')
                              }}
                              icon="edit_note"
                            >
                              Bitácora
                            </Button>
                          ) : null}

                          {inspectedCase.capabilities?.canRequestInfo ? (
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() => {
                                setWorkflowError(null)
                                setWorkflowLastPayload(undefined)
                                setWorkflowTarget(inspectedCase)
                                setWorkflowKind('info')
                              }}
                              icon="help_outline"
                            >
                              Solicitar información
                            </Button>
                          ) : null}

                          {inspectedCase.capabilities?.canResolve ? (
                            <Button
                              variant="success"
                              size="md"
                              onClick={() => {
                                setWorkflowError(null)
                                setWorkflowLastPayload(undefined)
                                setWorkflowTarget(inspectedCase)
                                setWorkflowKind('total')
                              }}
                              icon="task_alt"
                            >
                              Finalizar caso técnico
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <Button
                          variant="success"
                          size="md"
                          onClick={() => openModal(inspectedCase)}
                          icon="check_circle"
                        >
                          Formalizar resolución del caso
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
                  <p className="text-base font-bold text-azul-sena">Selecciona un caso de la cola</p>
                  <p className="mt-1 text-xs text-slate-500">
                    La evidencia, la bitácora y los botones de resolución se muestran en este panel contextual.
                  </p>
                </div>
              )}
            </div>
          }
        />
      </WorkCanvas>

      {/* Legacy/Modal Resolution */}
      {selectedCase && (
        <ResolutionModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          onSubmit={handleSubmit}
          solutionDescription={selectedCase.solucion ?? ''}
          setSolutionDescription={(value) => setSelectedCase({ ...selectedCase, solucion: value })}
          caseType={selectedCase.tipoCaso ?? ''}
          setCaseType={(value) => setSelectedCase({ ...selectedCase, tipoCaso: value })}
          solutionType={selectedCase.tipoSolucion ?? ''}
          setSolutionType={(value) => setSelectedCase({ ...selectedCase, tipoSolucion: value })}
          caseTypes={caseTypes}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Evidencia ampliada"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2 rounded-full cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Workflow Action Slide-over Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(workflowTarget && workflowKind)}
        onClose={closeWorkflowModal}
        title={
          workflowKind === 'update'
            ? 'Registrar Avance en Bitácora'
            : workflowKind === 'info'
              ? 'Solicitar Información al Funcionario'
              : workflowKind === 'partial'
                ? 'Registrar Solución Parcial'
                : 'Registrar Solución Total y Conclusión'
        }
        subtitle={
          workflowTarget
            ? `Caso #${workflowTarget.codigoCaso || workflowTarget._id.slice(-6)} · Registro con trazabilidad inmediata`
            : undefined
        }
        width="lg"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={closeWorkflowModal}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={() => void submitWorkflow()} icon="save">
              Guardar Registro
            </Button>
          </>
        }
      >
        {workflowKind === 'update' || workflowKind === 'info' ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {workflowKind === 'update'
                ? 'Detalle de la actividad técnica'
                : 'Información requerida del usuario'}
            </label>
            <textarea
              className="w-full min-h-36 rounded-xl border border-border-subtle p-3.5 text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              placeholder={
                workflowKind === 'update'
                  ? 'Escribe qué pruebas, diagnósticos o ajustes realizaste en sitio...'
                  : 'Indica con claridad qué datos o validaciones requieres del funcionario...'
              }
              value={workflowText.mensaje}
              onChange={(event) => setWorkflowText((prev) => ({ ...prev, mensaje: event.target.value }))}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Acciones de resolución implementadas
              </label>
              <textarea
                className="w-full min-h-28 rounded-xl border border-border-subtle p-3.5 text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                placeholder="Describe concretamente la solución aplicada a los equipos o software..."
                value={workflowText.queSeHizo}
                onChange={(event) => setWorkflowText((prev) => ({ ...prev, queSeHizo: event.target.value }))}
              />
            </div>
            {workflowKind === 'partial' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Pendientes identificados
                  </label>
                  <textarea
                    className="w-full min-h-20 rounded-xl border border-border-subtle p-3 text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    placeholder="Qué parte queda pendiente por repuestos, garantías o autorizaciones..."
                    value={workflowText.queFalta}
                    onChange={(event) => setWorkflowText((prev) => ({ ...prev, queFalta: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Siguiente acción coordinada
                  </label>
                  <textarea
                    className="w-full min-h-20 rounded-xl border border-border-subtle p-3 text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    placeholder="Paso a seguir y fecha estimada de continuación..."
                    value={workflowText.siguienteAccion}
                    onChange={(event) => setWorkflowText((prev) => ({ ...prev, siguienteAccion: event.target.value }))}
                  />
                </div>
              </>
            ) : null}
          </div>
        )}

        <WorkflowManualRetryNotice
          error={workflowError}
          lastPayload={workflowLastPayload}
          currentPayload={currentWorkflowPayload()}
          onRetry={() => void submitWorkflow(workflowLastPayload)}
        />
      </SlideOverDrawer>
    </AppShell>
  )
}
