import { useState, useEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { AppShell, SearchField, PaginationFooter, StatusBadge, Button } from '@/shared/ui'
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
          c => c.estado !== 'finalizado' && c.estado !== 'cerrado' && c.estado !== 'cancelado'
        )
        setCases(activeTickets)
        if (activeTickets.length > 0) {
          // Default selection to either in_progress or first item
          const inProgress = activeTickets.find(c => c.estado === 'en_progreso' || c.estado === 'en_atencion')
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

  // Queue mapping
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

  const queuedCases = cases.filter(row => {
    const queue = queueOf(row)
    if (queueFilter === 'trabajo') {
      return queue === 'por_iniciar' || queue === 'en_atencion' || queue === 'esperando_funcionario'
    }
    return queue === queueFilter
  })

  const filteredData = queuedCases.filter(row =>
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

  // Current active inspected ticket
  const inspectedCase = cases.find(c => c._id === activeCaseId) || currentItems[0] || null

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
        setCases(prev => prev.filter(c => c._id !== selectedCase._id))
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
      c => c.estado !== 'finalizado' && c.estado !== 'cerrado' && c.estado !== 'cancelado'
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
          payload as { queSeHizo: string; queFalta: string; siguienteAccion: string },
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
    { id: 'trabajo', label: 'Cola de Trabajo', count: cases.filter(c => ['por_iniciar', 'en_atencion', 'esperando_funcionario'].includes(queueOf(c))).length },
    { id: 'por_iniciar', label: 'Por Iniciar', count: cases.filter(c => queueOf(c) === 'por_iniciar').length },
    { id: 'en_atencion', label: 'En Atención Activa', count: cases.filter(c => queueOf(c) === 'en_atencion').length },
    { id: 'esperando_funcionario', label: 'Esperando Funcionario', count: cases.filter(c => queueOf(c) === 'esperando_funcionario').length },
    { id: 'esperando_confirmacion', label: 'Esperando Confirmación', count: cases.filter(c => queueOf(c) === 'esperando_confirmacion').length },
  ] as const

  return (
    <AppShell subtitleContext="Terminal Operativa Técnica">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Technician Terminal Header */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span>Soporte Técnico en Sitio · Terminal de Resolución</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Bandeja Operativa de Incidentes
            </h1>
            <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
              Inspecciona requerimientos asignados, documenta bitácoras en campo y registra soluciones con trazabilidad total.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-surface-subtle border border-border-subtle px-4 py-2.5 rounded-xl text-center min-w-[100px]">
              <p className="text-xs font-medium text-ink-muted">Total cola</p>
              <p className="text-2xl font-extrabold text-brand-deep mt-0.5">{cases.length}</p>
            </div>
            <div className="bg-surface-subtle border border-border-subtle px-4 py-2.5 rounded-xl text-center min-w-[100px]">
              <p className="text-xs font-medium text-amber-700">En curso</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-0.5">
                {cases.filter(c => c.estado === 'en_progreso' || c.estado === 'en_atencion').length}
              </p>
            </div>
            <div className="bg-surface-subtle border border-border-subtle px-4 py-2.5 rounded-xl text-center min-w-[100px]">
              <p className="text-xs font-medium text-emerald-700">Por iniciar</p>
              <p className="text-2xl font-extrabold text-brand-green mt-0.5">
                {cases.filter(c => c.estado === 'asignado').length}
              </p>
            </div>
          </div>
        </section>

        {/* Queues & Filter Toolbar */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#dbe4e8] shadow-xs">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtros de bandeja">
            {queueTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={queueFilter === tab.id}
                onClick={() => {
                  setQueueFilter(tab.id)
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  queueFilter === tab.id
                    ? 'bg-azul-sena text-white shadow-xs'
                    : 'bg-[#f5f8f9] text-slate-600 hover:bg-slate-200/60 hover:text-azul-sena'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  queueFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ticket, solicitante o ambiente..."
              label="Buscar en incidentes"
            />
          </div>
        </section>

        {/* Master-Detail Split Workspace (Zero horizontal scroll) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Prioritized Work Queue (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-[#dbe4e8] shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-[#dbe4e8] bg-[#f5f8f9] flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-azul-sena">
                  Cola de Casos ({totalItems})
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Página {currentPage} de {Math.max(1, totalPages)}
                </span>
              </div>

              {loading ? (
                <div className="py-24 text-center">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-3 border-slate-200 border-t-azul-sena" />
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cargando cola técnica...</p>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="py-20 text-center px-4">
                  <span className="material-symbols-outlined !text-[44px] text-slate-300">task_alt</span>
                  <p className="mt-2 text-sm font-bold text-slate-700">No hay tickets pendientes</p>
                  <p className="text-xs text-slate-400 mt-0.5">La cola seleccionada se encuentra al día.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#dbe4e8]/70" role="list">
                  {currentItems.map((item) => {
                    const isSelected = (inspectedCase?._id === item._id)
                    const isFocus = item.estado === 'en_progreso' || item.estado === 'en_atencion'
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => setActiveCaseId(item._id)}
                        className={`w-full text-left p-4.5 transition-all cursor-pointer flex flex-col gap-2 relative ${
                          isSelected
                            ? 'bg-blue-50/50 ring-2 ring-inset ring-azul-sena/20 border-l-4 border-l-azul-sena'
                            : 'hover:bg-slate-50 bg-white'
                        }`}
                      >
                        {isFocus ? (
                          <span className="absolute top-3 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            En Atención
                          </span>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-azul-sena">
                            #{item.codigoCaso || item._id.slice(-6)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">· {item.fecha}</span>
                        </div>

                        <h3 className="text-sm font-bold text-on-surface line-clamp-2">
                          {item.descripcion}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                            {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Desconocido'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {item.ambiente?.nombre || 'General'}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between">
                          <StatusBadge status={item.estado} />
                          <span className="text-[11px] font-bold text-azul-sena flex items-center gap-0.5">
                            Ver inspección <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="p-3 border-t border-[#dbe4e8] bg-white">
                <PaginationFooter
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  itemLabel="casos"
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Resolution Inspector & Action Panel (7 cols on lg) */}
          <div className="lg:col-span-7">
            {inspectedCase ? (
              <div className="bg-white rounded-3xl border border-[#dbe4e8] shadow-sm overflow-hidden sticky top-24">
                
                {/* Header of Detail Pane */}
                <div className="p-6 border-b border-[#dbe4e8] bg-[#f5f8f9]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-white border border-[#dbe4e8] text-azul-sena shadow-2xs">
                        #{inspectedCase.codigoCaso || inspectedCase._id.slice(-6)}
                      </span>
                      <StatusBadge status={inspectedCase.estado} />
                    </div>

                    <span className="text-xs text-slate-400 font-semibold">
                      Radicado: {inspectedCase.fecha}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-on-surface mt-3 leading-snug">
                    {inspectedCase.descripcion}
                  </h2>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-6">
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#f5f8f9] border border-[#dbe4e8]">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Funcionario Solicitante</p>
                      <p className="text-sm font-bold text-azul-sena mt-1">
                        {typeof inspectedCase.usuario === 'object' ? inspectedCase.usuario?.nombre : 'Desconocido'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inspectedCase.telefono ? `Tel: ${inspectedCase.telefono}` : 'Sin teléfono registrado'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f5f8f9] border border-[#dbe4e8]">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ubicación / Ambiente</p>
                      <p className="text-sm font-bold text-azul-sena mt-1">
                        {inspectedCase.ambiente?.nombre || 'General'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Sede Central CTPI</p>
                    </div>
                  </div>

                  {/* Evidence Viewer if present */}
                  {inspectedCase.foto ? (
                    <div className="p-4 rounded-2xl border border-[#dbe4e8] bg-white">
                      <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[18px] text-azul-sena">image</span>
                        Evidencia Adjunta por el Usuario
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(inspectedCase.foto?.url || null)}
                          className="h-24 w-32 rounded-xl overflow-hidden border border-[#dbe4e8] group relative cursor-pointer"
                        >
                          <img
                            src={inspectedCase.foto.url}
                            alt="Evidencia fotográfica"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <span className="material-symbols-outlined !text-[20px]">zoom_in</span>
                          </div>
                        </button>
                        <div className="text-xs text-slate-500 space-y-1">
                          <p className="font-semibold text-slate-700">Captura fotográfica adjunta</p>
                          <p>Haz clic para ampliar la imagen en alta resolución.</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Immediate Operational Actions */}
                  <div className="pt-2 border-t border-border-subtle space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Acciones Operativas Inmediatas
                    </p>

                    {inspectedCase.workflowVersion === 2 ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {inspectedCase.capabilities?.canStart ? (
                          <>
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => runStart(inspectedCase._id)}
                              icon="play_arrow"
                            >
                              Iniciar atención en sitio
                            </Button>
                            {startRetry?.id === inspectedCase._id ? (
                              <WorkflowManualRetryNotice
                                error={startRetry.error}
                                pending={false}
                                onRetry={() => runStart(inspectedCase._id)}
                              />
                            ) : null}
                          </>
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
                            Añadir bitácora
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
                            icon="check_circle"
                          >
                            Finalizar caso técnico
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <Button
                        variant="primary"
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
              <div className="bg-white rounded-3xl border border-[#dbe4e8] p-12 text-center text-slate-400">
                <span className="material-symbols-outlined !text-[48px] text-slate-300">visibility</span>
                <p className="mt-2 text-sm font-bold text-slate-700">Selecciona un ticket de la cola</p>
                <p className="text-xs text-slate-400 mt-1">Podrás inspeccionar detalles, historial y ejecutar acciones de soporte.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legacy/Modal Resolution */}
      {selectedCase && (
        <ResolutionModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          onSubmit={handleSubmit}
          solutionDescription={selectedCase.solucion ?? ''}
          setSolutionDescription={value => setSelectedCase({ ...selectedCase, solucion: value })}
          caseType={selectedCase.tipoCaso ?? ''}
          setCaseType={value => setSelectedCase({ ...selectedCase, tipoCaso: value })}
          solutionType={selectedCase.tipoSolucion ?? ''}
          setSolutionType={value => setSelectedCase({ ...selectedCase, tipoSolucion: value })}
          caseTypes={caseTypes}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Evidencia ampliada" className="max-h-[85vh] w-auto object-contain rounded-xl" />
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

      {/* Workflow Action Dialog */}
      {workflowTarget && workflowKind ? (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[#dbe4e8]">
            <h2 className="text-lg font-bold text-azul-sena mb-1.5">
              {workflowKind === 'update' && 'Registrar Avance en Bitácora'}
              {workflowKind === 'info' && 'Solicitar Información al Funcionario'}
              {workflowKind === 'partial' && 'Registrar Solución Parcial'}
              {workflowKind === 'total' && 'Registrar Solución Total y Conclusión'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">Caso #{workflowTarget.codigoCaso || workflowTarget._id.slice(-6)}</p>

            {workflowKind === 'update' || workflowKind === 'info' ? (
              <textarea
                className="w-full min-h-28 rounded-2xl border border-[#dbe4e8] p-3 text-sm focus:border-azul-sena focus:outline-none"
                placeholder={workflowKind === 'update' ? 'Escribe qué pruebas o acciones realizaste en sitio...' : 'Indica qué datos requieres del funcionario...'}
                value={workflowText.mensaje}
                onChange={(event) => setWorkflowText((prev) => ({ ...prev, mensaje: event.target.value }))}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  className="w-full min-h-24 rounded-2xl border border-[#dbe4e8] p-3 text-sm focus:border-azul-sena focus:outline-none"
                  placeholder="Qué se solucionó concretamente..."
                  value={workflowText.queSeHizo}
                  onChange={(event) => setWorkflowText((prev) => ({ ...prev, queSeHizo: event.target.value }))}
                />
                {workflowKind === 'partial' ? (
                  <>
                    <textarea
                      className="w-full min-h-16 rounded-xl border border-[#dbe4e8] p-3 text-sm"
                      placeholder="Qué parte queda pendiente..."
                      value={workflowText.queFalta}
                      onChange={(event) => setWorkflowText((prev) => ({ ...prev, queFalta: event.target.value }))}
                    />
                    <textarea
                      className="w-full min-h-16 rounded-xl border border-[#dbe4e8] p-3 text-sm"
                      placeholder="Siguiente acción requerida..."
                      value={workflowText.siguienteAccion}
                      onChange={(event) => setWorkflowText((prev) => ({ ...prev, siguienteAccion: event.target.value }))}
                    />
                  </>
                ) : null}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-[#dbe4e8] pt-4">
              <button
                type="button"
                onClick={closeWorkflowModal}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-azul-sena text-white text-xs font-bold uppercase tracking-widest hover:bg-[#032539] transition-all shadow-sm"
                onClick={() => void submitWorkflow()}
              >
                Guardar Registro
              </button>
            </div>
            <WorkflowManualRetryNotice
              error={workflowError}
              lastPayload={workflowLastPayload}
              currentPayload={currentWorkflowPayload()}
              onRetry={() => void submitWorkflow(workflowLastPayload)}
            />
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
