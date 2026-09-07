import { useState, useEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import AppLayout from '@/app/layouts/AppLayout'
import TecnicoLayout from '@/app/layouts/TecnicoLayout'
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
  const itemsPerPage = 5 
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

  // Search and Pagination Logic
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

  const getStatusBadge = (estado: string): ReactNode => {
    switch (estado) {
      case 'solicitado':
        return <span className="badge-base bg-blue-50 text-blue-700 border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>Pendiente
        </span>
      case 'asignado':
        return <span className="badge-base bg-amber-50 text-amber-700 border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>Asignado
        </span>
      case 'pendiente':
        return <span className="badge-base bg-orange-50 text-orange-700 border-orange-100">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>En Proceso
        </span>
      case 'en_progreso':
      case 'esperando_usuario':
      case 'resuelto':
      case 'nuevo':
        return <span className="badge-base bg-orange-50 text-orange-700 border-orange-100">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>{estado.replace('_', ' ')}
        </span>
      default:
        return <span className="badge-base bg-slate-100 text-slate-600 border-slate-200 uppercase">{estado}</span>
    }
  }

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

  return (
    <AppLayout>
      <TecnicoLayout>
        <main className="py-4 sm:py-6 lg:py-8 px-3 animate-in fade-in duration-500">
          <section className="premium-card rounded-3xl overflow-hidden flex flex-col h-full w-[min(96vw,1560px)] ml-auto mr-auto xl:ml-[clamp(24px,4vw,72px)] xl:mr-auto animate-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Casos por Resolver</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Gestión operativa y resolución técnica de solicitudes.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {(
                  [
                    ['trabajo', 'Trabajo técnico'],
                    ['por_iniciar', 'Por iniciar'],
                    ['en_atencion', 'En atención'],
                    ['esperando_funcionario', 'Esperando al Funcionario'],
                    ['esperando_confirmacion', 'Esperando confirmación'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setQueueFilter(id)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      queueFilter === id
                        ? 'bg-primary-container text-white border-primary-container'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-full sm:w-80 lg:w-96 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px] group-focus-within:text-primary-container transition-colors">search</span>
              <input 
                className="w-full pl-11 pr-4 py-2.5 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all" 
                placeholder="Buscar por código, usuario o detalle..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="premium-table-container max-h-[calc(100vh-350px)]">
            <table className="premium-table">
              <thead className="premium-thead">
                <tr>
                  <th className="premium-th min-w-[120px]">Ticket</th>
                  <th className="premium-th min-w-[130px]">Fecha</th>
                  <th className="premium-th min-w-[150px]">Ubicación</th>
                  <th className="premium-th min-w-[200px]">Usuario / Contacto</th>
                  <th className="premium-th min-w-[300px]">Detalle del Problema</th>
                  <th className="premium-th text-center w-[80px]">Evidencia</th>
                  <th className="premium-th min-w-[140px]">Estado</th>
                  <th className="premium-th text-center w-[120px] min-w-[110px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40" role="status" aria-live="polite">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#04324d]" />
                        <p className="text-sm font-black uppercase tracking-[0.2em]">Cargando casos...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((row) => (
                    <tr key={row._id} className="premium-tr group">
                      <td className="premium-td">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined !text-[16px] text-primary-container/40 font-variation-['wght'_300]">confirmation_number</span>
                            <span className="text-[13px] font-bold text-primary-container leading-none">#{row.codigoCaso || row._id?.slice(-6) || 'N/A'}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">ID Interno</span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-on-surface">
                            <span className="material-symbols-outlined !text-[16px] text-slate-300">calendar_today</span>
                            {row.fecha}
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">Reportado</span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[13px] font-medium text-on-surface leading-snug">
                            <span className="material-symbols-outlined !text-[18px] text-emerald-500 font-variation-['FILL'_1]">location_on</span>
                            {row.ambiente?.nombre || 'General'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">Sede / Ambiente</span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined !text-[14px] text-slate-500">person</span>
                            </div>
                            <span className="text-[13px] font-bold text-on-surface truncate max-w-[150px]">{(typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : undefined) || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-8">
                             <span className="material-symbols-outlined !text-[12px] text-slate-300">phone</span>
                             <span className="text-[11px] font-medium text-slate-400 italic">{row.telefono || 'Sin tel'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="premium-td">
                        <p className="text-[13px] font-medium text-on-surface leading-relaxed line-clamp-3">
                          {row.descripcion}
                        </p>
                      </td>
                      <td className="premium-td text-center">
                        {row.foto ? (
                          <a href={row.foto.url} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center gap-1 group/thumb">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border hairline-border border-slate-200 group-hover/thumb:border-primary-container transition-all shadow-sm">
                              <img src={row.foto.url} alt="Evidencia" className="w-full h-full object-cover" />
                            </div>
                          </a>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mx-auto">
                            <span className="material-symbols-outlined text-slate-300 text-[18px]">image_not_supported</span>
                          </div>
                        )}
                      </td>
                      <td className="premium-td">
                        {getStatusBadge(row.displayStatus ? row.estado : row.estado)}
                        {row.displayStatus ? (
                          <p className="text-[10px] font-semibold text-slate-500 mt-1">{row.displayStatus}</p>
                        ) : null}
                      </td>
                      <td className="premium-td align-middle">
                        <div className="flex flex-col items-center gap-1">
                          {row.workflowVersion === 2 ? (
                            <>
                              {row.capabilities?.canStart ? (
                                <>
                                  <button type="button" className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-primary-container text-white text-[10px] font-bold uppercase" onClick={() => runStart(row._id)}>
                                    Iniciar
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
                              {row.capabilities?.canUpdate ? (
                                <button type="button" className="text-[10px] font-bold uppercase text-slate-600" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('update') }}>Actualizar</button>
                              ) : null}
                              {row.capabilities?.canRequestInfo ? (
                                <button type="button" className="text-[10px] font-bold uppercase text-slate-600" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('info') }}>Pedir info</button>
                              ) : null}
                              {row.capabilities?.canPartialSolution ? (
                                <button type="button" className="text-[10px] font-bold uppercase text-slate-600" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('partial') }}>Parcial</button>
                              ) : null}
                              {row.capabilities?.canResolve ? (
                                <button type="button" className="text-[10px] font-bold uppercase text-emerald-700" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('total') }}>Solución total</button>
                              ) : null}
                            </>
                          ) : (
                            <button 
                              onClick={() => openModal(row)}
                              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-primary-container text-white text-xs font-bold uppercase tracking-[0.12em] leading-none hover:bg-primary transition-all shadow-sm active:scale-95"
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
                    <td colSpan={8} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <span className="material-symbols-outlined !text-[64px]">rule_folder</span>
                        <p className="text-sm font-black uppercase tracking-[0.2em]">Todo despejado por aquí</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="pagination-footer">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Página {currentPage} de {totalPages || 1}</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{totalItems} casos asignados</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="pagination-btn">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="pagination-btn">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
        </main>

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
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[120] p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
              <h2 className="text-lg font-bold mb-4">
                {workflowKind === 'update' && 'Agregar actualización'}
                {workflowKind === 'info' && 'Solicitar información'}
                {workflowKind === 'partial' && 'Solución parcial'}
                {workflowKind === 'total' && 'Solución total'}
              </h2>
              {workflowKind === 'update' || workflowKind === 'info' ? (
                <textarea className="w-full min-h-24 rounded-xl border p-3" placeholder="Mensaje" value={workflowText.mensaje} onChange={(event) => setWorkflowText((prev) => ({ ...prev, mensaje: event.target.value }))} />
              ) : (
                <div className="flex flex-col gap-2">
                  <textarea className="w-full min-h-20 rounded-xl border p-3" placeholder="Qué se hizo" value={workflowText.queSeHizo} onChange={(event) => setWorkflowText((prev) => ({ ...prev, queSeHizo: event.target.value }))} />
                  {workflowKind === 'partial' ? (
                    <>
                      <textarea className="w-full min-h-16 rounded-xl border p-3" placeholder="Qué falta" value={workflowText.queFalta} onChange={(event) => setWorkflowText((prev) => ({ ...prev, queFalta: event.target.value }))} />
                      <textarea className="w-full min-h-16 rounded-xl border p-3" placeholder="Siguiente acción" value={workflowText.siguienteAccion} onChange={(event) => setWorkflowText((prev) => ({ ...prev, siguienteAccion: event.target.value }))} />
                    </>
                  ) : null}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={closeWorkflowModal}>Cerrar</button>
                <button type="button" className="px-4 py-2 rounded-xl bg-primary-container text-white font-bold" onClick={() => void submitWorkflow()}>Guardar</button>
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
      </TecnicoLayout>
    </AppLayout>
  )
}

