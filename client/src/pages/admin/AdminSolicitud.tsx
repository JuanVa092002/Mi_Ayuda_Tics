import { useEffect, useState } from 'react'
import { asignarSolicitudTecnico, cancelarSolicitud, getSolicitudesPendientes, LeaderMediaThumb, WorkflowManualRetryNotice } from '@/features/tickets'
import { getTecnicosAprobados } from '@/features/users'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import {
  canLeaderAssign,
  canLeaderCancel,
  formatSolicitudFecha,
  sortSolicitudesNewest,
  validateRequiredMotivo,
  workflowLabel,
} from '@/features/tickets/leader-inbox'
import { AppShell, SearchField, PaginationFooter, StatusBadge } from '@/shared/ui'
import type { Solicitud, User } from '@/shared/types'

export default function AdminSolicitud() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [showModal, setShowModal] = useState(false)
  const [tecnicos, setTecnicos] = useState<User[]>([])
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [cancelTarget, setCancelTarget] = useState<Solicitud | null>(null)
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [cancelError, setCancelError] = useState<unknown>(null)
  const [cancelLastPayload, setCancelLastPayload] = useState<{ motivo: string } | undefined>(undefined)
  const [assignError, setAssignError] = useState<unknown>(null)
  const [assignLastPayload, setAssignLastPayload] = useState<{ tecnico: string } | undefined>(undefined)
  const [assigning, setAssigning] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [loadingTecnicos, setLoadingTecnicos] = useState(false)
  const itemsPerPage = 8

  useEffect(() => {
    async function fetchSolicitudes() {
      setLoading(true)
      setFetchError(null)
      try {
        const data = await getSolicitudesPendientes()
        setSolicitudes(sortSolicitudesNewest(data))
      } catch (error) {
        setFetchError(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    void fetchSolicitudes()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleShareClick = async (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud)
    setAssignError(null)
    setAssignLastPayload(undefined)
    setShowModal(true)
    setLoadingTecnicos(true)
    try {
      const data = await getTecnicosAprobados()
      setTecnicos(data.tecnicos ?? [])
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoadingTecnicos(false)
    }
  }

  const handleCancelSubmit = async (payloadOverride?: { motivo: string }) => {
    if (!cancelTarget || cancelling) return
    const motivoValue = (payloadOverride?.motivo ?? cancelMotivo).trim()
    const validationError = validateRequiredMotivo(motivoValue)
    if (validationError) {
      toast.error(validationError)
      return
    }
    setCancelling(true)
    try {
      await cancelarSolicitud(cancelTarget._id, motivoValue)
      toast.success('Solicitud cancelada')
      setSolicitudes(prev => prev.filter(item => item._id !== cancelTarget._id))
      setCancelTarget(null)
      setCancelMotivo('')
      setCancelError(null)
      setCancelLastPayload(undefined)
    } catch (error) {
      setCancelError(error)
      setCancelLastPayload({ motivo: motivoValue })
      const failure = classifyWorkflowMutationFailure(error)
      if (!failure.offersManualRetry) {
        toast.error(getApiErrorMessage(error))
      }
    } finally {
      setCancelling(false)
    }
  }

  const handleAssignClick = async (tecnicoId: User, payloadOverride?: { tecnico: string }) => {
    if (!selectedSolicitud || assigning) return
    const tecnico = payloadOverride?.tecnico ?? tecnicoId._id
    setAssigning(true)
    try {
      await asignarSolicitudTecnico(selectedSolicitud._id, { tecnico })
      toast.success('Solicitud asignada al especialista exitosamente')
      setSolicitudes(prevSolicitudes =>
        prevSolicitudes.filter(solicitud => solicitud._id !== selectedSolicitud._id)
      )
      setShowModal(false)
      setAssignError(null)
      setAssignLastPayload(undefined)
    } catch (error) {
      setAssignError(error)
      setAssignLastPayload({ tecnico })
      const failure = classifyWorkflowMutationFailure(error)
      if (!failure.offersManualRetry) {
        toast.error(getApiErrorMessage(error))
      }
    } finally {
      setAssigning(false)
    }
  }

  const filteredData = solicitudes.filter(row =>
    (row.codigoCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (row.ambiente?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const nuevosV2 = solicitudes.filter((row) => row.estado === 'nuevo').length
  const solicitadosV1 = solicitudes.filter((row) => row.estado === 'solicitado').length

  return (
    <AppShell subtitleContext="Centro de Mando TIC">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Command Header */}
        <section className="rounded-3xl bg-linear-to-br from-[#04324d] via-[#032539] to-[#021824] text-white p-6 sm:p-8 shadow-[0_12px_36px_rgba(4,50,77,0.15)] border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-[#39a900] animate-pulse" />
                Despacho y Asignación de Solicitudes
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Mesa de Control de Nuevas Incidencias
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Evalúa requerimientos recién radicados, previene cuellos de botella y asigna personal técnico especializado.
              </p>
            </div>

            {/* Live Operational Metrics */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
              <div className="text-center px-3 border-r border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Por Despachar</p>
                <p className="text-2xl font-black text-white mt-0.5">{solicitudes.length}</p>
              </div>
              <div className="text-center px-3 border-r border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Nuevos v2</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{nuevosV2}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Cola legacy</p>
                <p className="text-2xl font-black text-slate-200 mt-0.5">{solicitadosV1}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border hairline-border border-slate-200/80 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {totalItems} tickets pendientes de asignación en tiempo real
            </p>
            <div className="w-full sm:w-80">
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Filtrar por ticket, ambiente o funcionario..."
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border hairline-border border-slate-200/80 shadow-[0_8px_30px_rgba(4,50,77,0.03)] overflow-hidden">
            <div className="premium-table-container">
              <table className="premium-table">
                <thead className="premium-thead">
                  <tr>
                    <th className="premium-th min-w-[120px]">Registro</th>
                    <th className="premium-th min-w-[150px]">Ambiente / Ubicación</th>
                    <th className="premium-th min-w-[180px]">Funcionario Solicitante</th>
                    <th className="premium-th min-w-[320px]">Detalle de Incidencia</th>
                    <th className="premium-th text-center w-[90px]">Evidencia</th>
                    <th className="premium-th text-center min-w-[140px]">Despacho</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-60" role="status" aria-live="polite">
                          <div className="h-9 w-9 animate-spin rounded-full border-3 border-slate-200 border-t-azul-sena" />
                          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cargando cola de despacho...</p>
                        </div>
                      </td>
                    </tr>
                  ) : fetchError ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-red-600 font-semibold">{fetchError}</td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((row) => (
                      <tr key={row._id} className="premium-tr">
                        <td className="premium-td">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined !text-[16px] text-azul-sena font-variation-['wght'_300]">confirmation_number</span>
                              <span className="font-mono text-xs font-bold text-azul-sena">#{row.codigoCaso || row._id.slice(-6)}</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">
                              {formatSolicitudFecha(row.fecha)}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StatusBadge status={row.estado} label={row.displayStatus || row.estado} />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                {workflowLabel(row.workflowVersion)}
                              </span>
                            </div>
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
                              {(typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : undefined) || 'Desconocido'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal">{row.telefono || 'Sin teléfono'}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <p className="text-xs font-normal text-on-surface leading-relaxed line-clamp-3 italic text-slate-700 max-w-md">
                            "{row.descripcion}"
                          </p>
                        </td>
                        <td className="premium-td text-center">
                          <LeaderMediaThumb foto={row.foto} alt={`Evidencia de ${row.codigoCaso || 'solicitud'}`} />
                        </td>
                        <td className="premium-td text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canLeaderAssign(row) ? (
                              <button
                                type="button"
                                disabled={loadingTecnicos}
                                onClick={() => void handleShareClick(row)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-azul-sena hover:bg-[#032539] active:scale-98 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                              >
                                <span>Asignar</span>
                                <span className="material-symbols-outlined !text-[15px]">person_add</span>
                              </button>
                            ) : null}
                            {canLeaderCancel(row) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(row)
                                  setCancelMotivo('')
                                }}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-60">
                          <span className="material-symbols-outlined !text-[48px] text-emerald-600">verified</span>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Mesa de control al día · No hay incidencias por asignar</p>
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
              itemLabel="solicitudes por despachar"
            />
          </div>
        </section>
      </div>

      {/* Modern Technical Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] animate-in fade-in duration-200 p-4" role="presentation">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200" role="dialog" aria-modal="true" aria-labelledby="assign-tech-title">
            <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 id="assign-tech-title" className="text-lg sm:text-xl font-bold text-azul-sena">Despachar Caso a Especialista Técnico</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Ticket #{selectedSolicitud?.codigoCaso || selectedSolicitud?._id.slice(-6)} · Asignación en un clic
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { if (selectedSolicitud) clearWorkflowAttemptKey('assign', selectedSolicitud._id); setShowModal(false); setAssignError(null) }} 
                aria-label="Cerrar modal" 
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="max-h-[380px] overflow-auto hairline-scrollbar p-2">
              {tecnicos.length === 0 ? (
                <p className="p-8 text-sm font-semibold text-slate-500 text-center">
                  No hay técnicos habilitados en la base de datos.
                </p>
              ) : (
                <div className="grid grid-cols-1 divide-y divide-slate-100">
                  {tecnicos.map((tecnico) => (
                    <div key={tecnico._id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-azul-sena/10 flex items-center justify-center text-azul-sena shrink-0">
                          <span className="material-symbols-outlined !text-[20px]">engineering</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{tecnico.nombre}</p>
                          <p className="text-xs text-slate-400 truncate">{tecnico.correo} {tecnico.telefono ? `· ${tecnico.telefono}` : ''}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={assigning}
                        onClick={() => void handleAssignClick(tecnico)}
                        className="px-4 py-2 rounded-xl bg-azul-sena hover:bg-[#03283e] text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
                      >
                        {assigning ? 'Asignando…' : 'Asignar Caso'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t hairline-border border-slate-100 text-center">
              <WorkflowManualRetryNotice
                error={assignError}
                lastPayload={assignLastPayload}
                currentPayload={assignLastPayload}
                onRetry={() => {
                  if (!assignLastPayload || !selectedSolicitud) return
                  const tecnico = tecnicos.find((item) => item._id === assignLastPayload.tecnico)
                  if (tecnico) void handleAssignClick(tecnico, assignLastPayload)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelTarget ? (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200" role="dialog" aria-modal="true">
            <h2 className="text-xl font-bold text-on-surface mb-2">Cancelar Solicitud de Incidencia</h2>
            <p className="text-xs text-slate-500 mb-4">Caso #{cancelTarget.codigoCaso}. El ticket se preservará en el histórico con trazabilidad del motivo.</p>
            <textarea
              className="w-full min-h-28 rounded-2xl border hairline-border border-slate-200 p-4 text-sm focus:border-azul-sena focus:outline-none"
              placeholder="Indica el motivo justificado de la cancelación..."
              value={cancelMotivo}
              onChange={(event) => setCancelMotivo(event.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3 border-t hairline-border border-slate-100 pt-4">
              <button 
                type="button" 
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl"
                onClick={() => {
                  if (cancelTarget) clearWorkflowAttemptKey('cancel', cancelTarget._id)
                  setCancelTarget(null)
                  setCancelError(null)
                  setCancelLastPayload(undefined)
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={cancelling}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-98 disabled:opacity-50"
                onClick={() => void handleCancelSubmit()}
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
            <WorkflowManualRetryNotice
              error={cancelError}
              lastPayload={cancelLastPayload}
              currentPayload={cancelLastPayload}
              onRetry={() => {
                if (!cancelLastPayload) return
                void handleCancelSubmit(cancelLastPayload)
              }}
            />
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
