import { useState, useEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { AppShell, SearchField, PaginationFooter, StatusBadge, Button, WorkCanvas, Metric, CommandBar, SplitWorkspace, Pane, SlideOverDrawer, AdaptiveSkeletonList } from '@/shared/ui'
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
      <WorkCanvas>
        <CommandBar
          metrics={
            <>
              <Metric label="En cola" value={cases.length} />
              <Metric
                label="En atención"
                tone="warn"
                value={cases.filter(c => c.estado === 'en_progreso' || c.estado === 'en_atencion').length}
              />
              <Metric label="Por iniciar" tone="ok" value={cases.filter(c => c.estado === 'asignado').length} />
            </>
          }
        >
          <div className="w-full lg:w-80">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar ticket, solicitante o ambiente"
              label="Buscar en incidentes"
            />
          </div>
        </CommandBar>

        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtros de bandeja">
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
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition-colors ${
                  queueFilter === tab.id
                    ? 'bg-brand-deep text-white'
                    : 'bg-surface text-ink hover:bg-surface-subtle border border-border-subtle'
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

        <SplitWorkspace
          queue={
          <Pane
            title="Cola priorizada"
            meta={`Página ${currentPage} de ${Math.max(1, totalPages)}`}
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
                  <p className="mt-2 text-sm font-bold text-slate-700">No hay tickets pendientes</p>
                  <p className="text-xs text-slate-400 mt-0.5">La cola seleccionada se encuentra al día.</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-c)' }} role="list">
                  {currentItems.map((item) => {
                    const isSelected = (inspectedCase?._id === item._id)
                    const isFocus = item.estado === 'en_progreso' || item.estado === 'en_atencion'
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => setActiveCaseId(item._id)}
                        className={`queue-item ${isSelected ? 'is-selected' : ''}`}
                      >
                        {isFocus ? (
                          <span
                            className="absolute top-2.5 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                          >
                            Activo
                          </span>
                        ) : null}

                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--brand)' }}>
                            #{item.codigoCaso || item._id.slice(-6)}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--ink-4)' }}>· {item.fecha}</span>
                        </div>

                        <h3 className="text-[13px] font-medium leading-snug line-clamp-2 mb-1.5" style={{ color: 'var(--ink-1)' }}>
                          {item.descripcion}
                        </h3>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[11px] truncate max-w-[170px]" style={{ color: 'var(--ink-2)' }}>
                            {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Desconocido'}
                          </span>
                          <span
                            className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                          >
                            {item.ambiente?.nombre || 'General'}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between">
                          <StatusBadge status={item.estado} />
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
                className="rounded-xl border overflow-hidden sticky top-[72px]"
                style={{ borderColor: 'var(--border-c)', boxShadow: 'var(--sh-sm)', background: 'var(--surface-0)' }}
              >
                {/* Header of Detail Pane */}
                <div
                  className="p-5 border-b"
                  style={{ borderColor: 'var(--border-c)', background: 'var(--surface-1)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[12px] font-bold px-2.5 py-1 rounded-md"
                        style={{ background: 'var(--surface-0)', border: '1px solid var(--border-c)', color: 'var(--brand)' }}
                      >
                        #{inspectedCase.codigoCaso || inspectedCase._id.slice(-6)}
                      </span>
                      <StatusBadge status={inspectedCase.estado} />
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--ink-3)' }}>
                      Radicado: {inspectedCase.fecha}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--ink-1)' }}>
                    {inspectedCase.descripcion}
                  </h2>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-5">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="meta-row">
                      <span className="meta-label">Funcionario solicitante</span>
                      <span className="meta-value">
                        {typeof inspectedCase.usuario === 'object' ? inspectedCase.usuario?.nombre : 'Desconocido'}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                        {inspectedCase.telefono ? `Tel: ${inspectedCase.telefono}` : 'Sin teléfono'}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Ambiente / Ubicación</span>
                      <span className="meta-value">{inspectedCase.ambiente?.nombre || 'General'}</span>
                      <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>CTPI</span>
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
              <div className="rounded-xl border border-dashed border-border-strong bg-surface p-12 text-center">
                <p className="text-base font-semibold text-ink">Selecciona un caso de la cola</p>
                <p className="mt-1 text-sm text-ink-muted">La evidencia y la resolución quedan en este panel.</p>
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
        subtitle={workflowTarget ? `Caso #${workflowTarget.codigoCaso || workflowTarget._id.slice(-6)} · Registro con trazabilidad inmediata` : undefined}
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
            <label className="text-xs font-semibold" style={{ color: 'var(--ink-1)' }}>
              {workflowKind === 'update' ? 'Detalle de la actividad técnica' : 'Información requerida del usuario'}
            </label>
            <textarea
              className="w-full min-h-36 rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              style={{ borderColor: 'var(--border-c)', background: 'var(--surface-0)', color: 'var(--ink-1)' }}
              placeholder={workflowKind === 'update' ? 'Escribe qué pruebas, diagnósticos o ajustes realizaste en sitio...' : 'Indica con claridad qué datos o validaciones requieres del funcionario...'}
              value={workflowText.mensaje}
              onChange={(event) => setWorkflowText((prev) => ({ ...prev, mensaje: event.target.value }))}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--ink-1)' }}>
                Acciones de resolución implementadas
              </label>
              <textarea
                className="w-full min-h-28 rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                style={{ borderColor: 'var(--border-c)', background: 'var(--surface-0)', color: 'var(--ink-1)' }}
                placeholder="Describe concretamente la solución aplicada a los equipos o software..."
                value={workflowText.queSeHizo}
                onChange={(event) => setWorkflowText((prev) => ({ ...prev, queSeHizo: event.target.value }))}
              />
            </div>
            {workflowKind === 'partial' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--ink-1)' }}>
                    Pendientes identificados
                  </label>
                  <textarea
                    className="w-full min-h-20 rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    style={{ borderColor: 'var(--border-c)', background: 'var(--surface-0)', color: 'var(--ink-1)' }}
                    placeholder="Qué parte queda pendiente por repuestos, garantías o autorizaciones..."
                    value={workflowText.queFalta}
                    onChange={(event) => setWorkflowText((prev) => ({ ...prev, queFalta: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--ink-1)' }}>
                    Siguiente acción coordinada
                  </label>
                  <textarea
                    className="w-full min-h-20 rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    style={{ borderColor: 'var(--border-c)', background: 'var(--surface-0)', color: 'var(--ink-1)' }}
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
