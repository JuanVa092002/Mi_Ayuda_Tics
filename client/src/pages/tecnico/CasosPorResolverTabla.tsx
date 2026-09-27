import { useState, useEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { AppShell, PageHeader, SearchField, PaginationFooter, StatusBadge } from '@/shared/ui'
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
    <AppShell subtitleContext="Atención Técnica">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <PageHeader
          category="Atención Técnica"
          title="Casos por Resolver"
          description="Gestión operativa y resolución técnica de incidencias asignadas a tu cargo."
        />

        {/* Filter pills & Search toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border hairline-border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  queueFilter === id
                    ? 'bg-primary-container text-white shadow-xs'
                    : 'bg-slate-100 text-on-surface-variant hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ticket, solicitante o detalle..."
            />
          </div>
        </div>

        {/* Table Container with natural flow */}
        <div className="bg-white rounded-2xl border hairline-border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="premium-table-container">
            <table className="premium-table">
              <thead className="premium-thead">
                <tr>
                  <th className="premium-th min-w-[120px]">Ticket</th>
                  <th className="premium-th min-w-[120px]">Fecha</th>
                  <th className="premium-th min-w-[140px]">Ubicación</th>
                  <th className="premium-th min-w-[180px]">Usuario / Contacto</th>
                  <th className="premium-th min-w-[280px]">Detalle del Problema</th>
                  <th className="premium-th text-center w-[80px]">Evidencia</th>
                  <th className="premium-th min-w-[130px]">Estado</th>
                  <th className="premium-th text-center w-[120px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-60" role="status" aria-live="polite">
                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-slate-200 border-t-[#04324d]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cargando incidencias asignadas...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((row) => (
                    <tr key={row._id} className="premium-tr group">
                      <td className="premium-td">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[16px] text-primary-container font-variation-['wght'_300]">confirmation_number</span>
                            <span className="text-xs font-bold text-primary-container">#{row.codigoCaso || row._id?.slice(-6) || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface">
                          <span className="material-symbols-outlined !text-[15px] text-slate-400">calendar_today</span>
                          <span>{row.fecha}</span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface">
                          <span className="material-symbols-outlined !text-[16px] text-emerald-600 font-variation-['FILL'_1]">location_on</span>
                          <span>{row.ambiente?.nombre || 'General'}</span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex flex-col gap-1">
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
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 group-hover/thumb:border-primary-container transition-all">
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
                                  <button type="button" className="px-3 py-1.5 rounded-lg bg-primary-container text-white text-[11px] font-bold uppercase hover:opacity-90 transition-all" onClick={() => runStart(row._id)}>
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
                                <button type="button" className="text-[11px] font-bold text-slate-700 hover:text-primary-container underline" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('update') }}>Actualizar</button>
                              ) : null}
                              {row.capabilities?.canRequestInfo ? (
                                <button type="button" className="text-[11px] font-bold text-slate-700 hover:text-primary-container underline" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('info') }}>Pedir info</button>
                              ) : null}
                              {row.capabilities?.canPartialSolution ? (
                                <button type="button" className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('partial') }}>Parcial</button>
                              ) : null}
                              {row.capabilities?.canResolve ? (
                                <button type="button" className="text-[11px] font-bold text-verde-sena hover:text-emerald-800 underline" onClick={() => { setWorkflowError(null); setWorkflowLastPayload(undefined); setWorkflowTarget(row); setWorkflowKind('total') }}>Solución total</button>
                              ) : null}
                            </>
                          ) : (
                            <button 
                              onClick={() => openModal(row)}
                              className="px-3 py-1.5 rounded-lg bg-primary-container text-white text-[11px] font-bold uppercase hover:opacity-90 transition-all"
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
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <span className="material-symbols-outlined !text-[48px] text-slate-400">task_alt</span>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No hay incidencias en esta bandeja</p>
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
    </AppShell>
  )
}

