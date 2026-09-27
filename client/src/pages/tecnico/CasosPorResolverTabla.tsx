import { useState, useEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { AppShell, SearchField, PaginationFooter, StatusBadge } from '@/shared/ui'
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
  const [caseTypes, setCaseTypes] = useState<TipoCaso[]>([])
  const [loading, setLoading] = useState(true)
  const [workflowTarget, setWorkflowTarget] = useState<Solicitud | null>(null)
  const [workflowKind, setWorkflowKind] = useState<'update' | 'info' | 'partial' | 'total' | null>(null)
  const [workflowText, setWorkflowText] = useState({ mensaje: '', queSeHizo: '', queFalta: '', siguienteAccion: '' })
  const [workflowError, setWorkflowError] = useState<unknown>(null)
  const [workflowLastPayload, setWorkflowLastPayload] = useState<unknown>(undefined)
  const [startRetry, setStartRetry] = useState<{ id: string; error: unknown } | null>(null)
  const [queueFilter, setQueueFilter] = useState<
    'trabajo' | 'por_iniciar' | 'en_atencion' | 'esperando_funcionario' | 'esperando_confirmacion'
  >('trabajo')

  useEffect(() => {
    const fetchCases = async (): Promise<void> => {
      try {
        const solicitudesAsignadas = await getCasosAsignados()
        setCases(solicitudesAsignadas.filter(c => c.estado !== 'finalizado' && c.estado !== 'cerrado' && c.estado !== 'cancelado'))
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
      .includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  // Current In-Progress Ticket for Focus Hero
  const inProgressTicket = cases.find(c => c.estado === 'en_progreso' || c.estado === 'en_atencion')

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
    setCases(solicitudesAsignadas.filter(c => c.estado !== 'finalizado' && c.estado !== 'cerrado' && c.estado !== 'cancelado'))
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
      toast.success('Acción registrada')
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Active Focus Header */}
        <section className="rounded-3xl bg-linear-to-br from-[#04324d] via-[#032539] to-[#021824] text-white p-6 sm:p-8 shadow-[0_12px_36px_rgba(4,50,77,0.15)] border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-[#39a900] animate-pulse" />
                Panel de Trabajo de Soporte en Sitio
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Bandeja de Resolución de Incidentes
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Atiende requerimientos priorizados, registra bitácoras de campo y formaliza la solución técnica.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
              <div className="text-center px-3 border-r border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asignados</p>
                <p className="text-2xl font-black text-white mt-0.5">{cases.length}</p>
              </div>
              <div className="text-center px-3 border-r border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">En Curso</p>
                <p className="text-2xl font-black text-amber-400 mt-0.5">
                  {cases.filter(c => c.estado === 'en_progreso' || c.estado === 'en_atencion').length}
                </p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Por Iniciar</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">
                  {cases.filter(c => c.estado === 'asignado').length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Focus Widget: If there is a ticket in progress, prominently guide the tech */}
        {inProgressTicket ? (
          <section className="rounded-3xl bg-white border hairline-border border-emerald-300/80 p-6 sm:p-7 shadow-[0_8px_24px_rgba(57,169,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#39a900]" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-[#39a900] animate-pulse" />
                    En Atención Activa #{inProgressTicket.codigoCaso || inProgressTicket._id.slice(-6)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Ambiente: <strong className="text-azul-sena">{inProgressTicket.ambiente?.nombre || 'General'}</strong>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-on-surface line-clamp-1">
                  {inProgressTicket.descripcion}
                </h3>
                <p className="text-xs text-slate-500">
                  Solicitante: <strong className="text-slate-700">{typeof inProgressTicket.usuario === 'object' ? inProgressTicket.usuario?.nombre : 'Desconocido'}</strong> {inProgressTicket.telefono ? `· Tel: ${inProgressTicket.telefono}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(inProgressTicket); setWorkflowKind('update') }}
                  className="px-4 py-2 rounded-xl border hairline-border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Bitácora
                </button>
                <button
                  type="button"
                  onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(inProgressTicket); setWorkflowKind('total') }}
                  className="px-5 py-2 rounded-xl bg-[#39a900] hover:bg-[#329600] text-white text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  Finalizar Solución
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {/* Workflow Queues & Search Navigation Toolbar */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border hairline-border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap gap-1.5">
              {queueTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setQueueFilter(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    queueFilter === tab.id
                      ? 'bg-azul-sena text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-azul-sena'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    queueFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'
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
                placeholder="Buscar ticket, solicitante o ambiente..."
              />
            </div>
          </div>

          {/* Table View with Natural Flow */}
          <div className="bg-white rounded-3xl border hairline-border border-slate-200/80 shadow-[0_8px_30px_rgba(4,50,77,0.03)] overflow-hidden">
            <div className="premium-table-container">
              <table className="premium-table">
                <thead className="premium-thead">
                  <tr>
                    <th className="premium-th min-w-[110px]">Ticket</th>
                    <th className="premium-th min-w-[120px]">Fecha</th>
                    <th className="premium-th min-w-[150px]">Ambiente / Sede</th>
                    <th className="premium-th min-w-[180px]">Funcionario</th>
                    <th className="premium-th min-w-[280px]">Detalle del Incidente</th>
                    <th className="premium-th text-center w-[80px]">Evidencia</th>
                    <th className="premium-th min-w-[130px]">Estado</th>
                    <th className="premium-th text-center w-[140px]">Acción Inmediata</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-60" role="status" aria-live="polite">
                          <div className="h-9 w-9 animate-spin rounded-full border-3 border-slate-200 border-t-azul-sena" />
                          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Sincronizando casos técnicos...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((row) => (
                      <tr key={row._id} className="premium-tr">
                        <td className="premium-td">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[16px] text-azul-sena font-variation-['wght'_300]">confirmation_number</span>
                            <span className="font-mono text-xs font-bold text-azul-sena">#{row.codigoCaso || row._id?.slice(-6) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface">
                            <span className="material-symbols-outlined !text-[15px] text-slate-400">calendar_today</span>
                            <span>{row.fecha}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                            <span className="material-symbols-outlined !text-[16px] text-emerald-600 font-variation-['FILL'_1]">location_on</span>
                            <span>{row.ambiente?.nombre || 'General'}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-on-surface truncate max-w-[160px]">
                              {(typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : undefined) || 'N/A'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal">{row.telefono || 'Sin teléfono'}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <p className="text-xs font-normal text-on-surface leading-relaxed line-clamp-2 max-w-sm">
                            {row.descripcion}
                          </p>
                        </td>
                        <td className="premium-td text-center">
                          {row.foto ? (
                            <a href={row.foto.url} target="_blank" rel="noreferrer" className="inline-block group/thumb">
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 group-hover/thumb:border-azul-sena transition-all">
                                <img src={row.foto.url} alt="Evidencia" className="w-full h-full object-cover" />
                              </div>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Sin foto</span>
                          )}
                        </td>
                        <td className="premium-td">
                          <StatusBadge status={row.displayStatus ? row.estado : row.estado} />
                        </td>
                        <td className="premium-td text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {row.workflowVersion === 2 ? (
                              <>
                                {row.capabilities?.canStart ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => runStart(row._id)}
                                      className="px-3.5 py-1.5 rounded-xl bg-azul-sena hover:bg-[#032539] text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
                                    >
                                      Iniciar Atención
                                    </button>
                                    {startRetry?.id === row._id ? (
                                      <WorkflowManualRetryNotice
                                        error={startRetry.error}
                                        pending={false}
                                        onRetry={() => runStart(row._id)}
                                      />
                                    ) : null}
                                  </>
                                ) : null}

                                <div className="flex items-center gap-2">
                                  {row.capabilities?.canUpdate ? (
                                    <button
                                      type="button"
                                      onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('update') }}
                                      className="text-[11px] font-bold text-slate-600 hover:text-azul-sena underline cursor-pointer"
                                    >
                                      Avance
                                    </button>
                                  ) : null}
                                  {row.capabilities?.canRequestInfo ? (
                                    <button
                                      type="button"
                                      onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('info') }}
                                      className="text-[11px] font-bold text-slate-600 hover:text-azul-sena underline cursor-pointer"
                                    >
                                      Pedir info
                                    </button>
                                  ) : null}
                                  {row.capabilities?.canResolve ? (
                                    <button
                                      type="button"
                                      onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('total') }}
                                      className="text-[11px] font-black text-verde-sena hover:text-emerald-800 underline cursor-pointer"
                                    >
                                      Solucionar
                                    </button>
                                  ) : null}
                                </div>
                              </>
                            ) : (
                              <button 
                                onClick={() => openModal(row)}
                                className="px-3.5 py-1.5 rounded-xl bg-azul-sena hover:bg-[#032539] text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
                              >
                                Resolver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-60">
                          <span className="material-symbols-outlined !text-[48px] text-slate-400">task_alt</span>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Todo al día en esta bandeja de soporte</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="casos asignados"
            />
          </div>
        </section>
      </div>

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

      {workflowTarget && workflowKind ? (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold text-azul-sena mb-2">
              {workflowKind === 'update' && 'Registrar Avance en Bitácora'}
              {workflowKind === 'info' && 'Solicitar Información al Funcionario'}
              {workflowKind === 'partial' && 'Registrar Solución Parcial'}
              {workflowKind === 'total' && 'Registrar Solución Total y Conclusión'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">Caso #{workflowTarget.codigoCaso || workflowTarget._id.slice(-6)}</p>

            {workflowKind === 'update' || workflowKind === 'info' ? (
              <textarea
                className="w-full min-h-28 rounded-2xl border hairline-border border-slate-200 p-3 text-sm focus:border-azul-sena focus:outline-none"
                placeholder={workflowKind === 'update' ? 'Escribe qué pruebas o acciones realizaste en sitio...' : 'Indica qué datos requieres del funcionario...'}
                value={workflowText.mensaje}
                onChange={(event) => setWorkflowText((prev) => ({ ...prev, mensaje: event.target.value }))}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  className="w-full min-h-24 rounded-2xl border hairline-border border-slate-200 p-3 text-sm focus:border-azul-sena focus:outline-none"
                  placeholder="Qué se solucionó concretamente..."
                  value={workflowText.queSeHizo}
                  onChange={(event) => setWorkflowText((prev) => ({ ...prev, queSeHizo: event.target.value }))}
                />
                {workflowKind === 'partial' ? (
                  <>
                    <textarea
                      className="w-full min-h-16 rounded-xl border hairline-border border-slate-200 p-3 text-sm"
                      placeholder="Qué parte queda pendiente..."
                      value={workflowText.queFalta}
                      onChange={(event) => setWorkflowText((prev) => ({ ...prev, queFalta: event.target.value }))}
                    />
                    <textarea
                      className="w-full min-h-16 rounded-xl border hairline-border border-slate-200 p-3 text-sm"
                      placeholder="Siguiente acción requerida..."
                      value={workflowText.siguienteAccion}
                      onChange={(event) => setWorkflowText((prev) => ({ ...prev, siguienteAccion: event.target.value }))}
                    />
                  </>
                ) : null}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t hairline-border border-slate-100 pt-4">
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
