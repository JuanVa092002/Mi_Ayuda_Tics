import { useEffect, useState } from 'react'
import { asignarSolicitudTecnico, cancelarSolicitud, getSolicitudesPendientes, LeaderMediaThumb, WorkflowManualRetryNotice } from '@/features/tickets'
import { getTecnicosAprobados } from '@/features/users'
import LeaderLayout from '@/app/layouts/LeaderLayout'
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
import { LeaderKpiCard, LeaderStatusPill } from '@/shared/ui'
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
  const itemsPerPage = 10

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
    setLoadingTecnicos(true)
    try {
      const response = await getTecnicosAprobados()
      setTecnicos(response.tecnicos ?? [])
      setAssignError(null)
      setAssignLastPayload(undefined)
      setShowModal(true)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoadingTecnicos(false)
    }
  }

  const handleCancelClick = async (payloadOverride?: { motivo: string }): Promise<void> => {
    if (!cancelTarget || cancelling) return
    const motivo = (payloadOverride?.motivo ?? cancelMotivo).trim()
    const motivoError = validateRequiredMotivo(motivo)
    if (motivoError) {
      toast.error(motivoError)
      return
    }
    setCancelling(true)
    try {
      await cancelarSolicitud(cancelTarget._id, motivo)
      toast.success('Solicitud cancelada')
      setSolicitudes(prev => prev.filter(solicitud => solicitud._id !== cancelTarget._id))
      clearWorkflowAttemptKey('cancel', cancelTarget._id)
      setCancelTarget(null)
      setCancelMotivo('')
      setCancelError(null)
      setCancelLastPayload(undefined)
    } catch (error) {
      setCancelError(error)
      setCancelLastPayload({ motivo })
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
      toast.success('Solicitud asignada con éxito')
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
      .includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const nuevosV2 = solicitudes.filter((row) => row.estado === 'nuevo').length
  const solicitadosV1 = solicitudes.filter((row) => row.estado === 'solicitado').length

  return (
    <LeaderLayout>
          <main className="p-4 sm:p-8">
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <LeaderKpiCard label="Pendientes" value={solicitudes.length} hint="Listos para asignar" icon="inbox" tone="navy" />
              <LeaderKpiCard label="Nuevos v2" value={nuevosV2} hint="Workflow actual" icon="bolt" tone="green" />
              <LeaderKpiCard label="Solicitados v1" value={solicitadosV1} hint="Cola legacy" icon="history" tone="muted" />
            </div>
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(4,50,77,0.04)]">
              <div className="flex flex-col gap-6 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-azul-sena">Cola de nuevos</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Tickets v1 en solicitado y v2 en nuevo, listos para asignar.
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                  <input
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-xs font-semibold text-on-surface focus:border-verde-sena focus:bg-white focus:outline-none"
                    placeholder="Filtrar por ticket, detalle o funcionario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="premium-table-container max-h-[calc(100vh-320px)]">
                <table className="premium-table">
                  <thead className="premium-thead">
                    <tr>
                      <th className="premium-th min-w-[140px]">Registro</th>
                      <th className="premium-th min-w-[160px]">Ambiente</th>
                      <th className="premium-th min-w-[200px]">Funcionario</th>
                      <th className="premium-th min-w-[350px]">Detalle de Solicitud</th>
                      <th className="premium-th text-center min-w-[120px]">Multimedia</th>
                      <th className="premium-th text-center min-w-[140px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {loading ? (
                      <tr><td colSpan={6} className="py-20 text-center"><span className="animate-pulse font-bold text-slate-300 uppercase tracking-widest">Cargando datos...</span></td></tr>
                    ) : fetchError ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-red-600 font-semibold">{fetchError}</td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((row) => (
                        <tr key={row._id} className="premium-tr group">
                          <td className="premium-td">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-[13px] font-bold text-primary-container">
                                <span className="material-symbols-outlined !text-[16px] opacity-40">event</span>
                                {formatSolicitudFecha(row.fecha)}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">
                                ID: {row.codigoCaso || row._id.slice(-6)}
                              </span>
                              <span className="pl-6">
                                <LeaderStatusPill estado={row.estado} label={row.displayStatus || row.estado} />
                                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                  {workflowLabel(row.workflowVersion)}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="premium-td">
                             <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-[13px] font-semibold text-on-surface">
                                  <span className="material-symbols-outlined !text-[18px] text-emerald-500 font-variation-['FILL'_1]">map</span>
                                  {row.ambiente?.nombre || 'General'}
                                </div>
                             </div>
                          </td>
                          <td className="premium-td">
                            <div className="flex flex-col gap-1">
                               <span className="text-[13px] font-bold text-on-surface">{(typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : undefined) || 'Desconocido'}</span>
                               <span className="text-[11px] font-medium text-slate-400 italic">Reportado por funcionario</span>
                            </div>
                          </td>
                          <td className="premium-td">
                            <p className="text-[13px] font-medium text-on-surface leading-relaxed line-clamp-3 italic text-slate-600">
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
                              className="inline-flex items-center gap-2 rounded-full bg-azul-sena px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary disabled:opacity-50"
                            >
                              <span className="text-[11px] font-black uppercase tracking-widest">Asignar</span>
                              <span className="material-symbols-outlined !text-[16px] group-hover:rotate-12 transition-transform">person_add</span>
                            </button>
                            ) : null}
                            {canLeaderCancel(row) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(row)
                                  setCancelMotivo('')
                                }}
                                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-red-700"
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
                        <td colSpan={6} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                            <span className="material-symbols-outlined !text-[64px]">verified</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Todas las solicitudes asignadas</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-5">
                <span className="text-sm font-medium text-slate-500">
                  Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} tickets
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="pagination-btn">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-azul-sena text-sm font-bold text-white">
                    {currentPage}
                  </span>
                  <button type="button" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="pagination-btn">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </main>

          {showModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] animate-in fade-in duration-300 p-4" role="presentation">
              <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300"
                role="dialog"
                aria-modal="true"
                aria-labelledby="assign-tech-title"
              >
                <div className="p-8 border-b hairline-border border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h2 id="assign-tech-title" className="text-xl font-bold text-on-surface">Seleccionar Técnico</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {selectedSolicitud?.codigoCaso} · un clic para asignar
                    </p>
                  </div>
                  <button type="button" onClick={() => { if (selectedSolicitud) clearWorkflowAttemptKey('assign', selectedSolicitud._id); setShowModal(false); setAssignError(null) }} aria-label="Cerrar modal" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-400">close</span>
                  </button>
                </div>

                <div className="max-h-[400px] overflow-auto hairline-scrollbar">
                  {tecnicos.length === 0 ? (
                    <p className="p-8 text-sm font-semibold text-slate-500">
                      No hay técnicos aprobados. Aprueba un técnico antes de asignar.
                    </p>
                  ) : (
                  <table className="premium-table">
                    <thead className="premium-thead">
                      <tr>
                        <th className="premium-th">Técnico / Especialista</th>
                        <th className="premium-th">Contacto</th>
                        <th className="premium-th text-right">Asignación</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {tecnicos.map((tecnico) => (
                        <tr key={tecnico._id} className="premium-tr">
                          <td className="premium-td">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center">
                                 <span className="material-symbols-outlined text-primary-container !text-[18px]">engineering</span>
                               </div>
                               <span className="text-[13px] font-bold text-on-surface">{tecnico.nombre}</span>
                             </div>
                          </td>
                          <td className="premium-td">
                             <div className="flex flex-col gap-0.5">
                               <span className="text-[12px] font-medium text-on-surface-variant truncate max-w-[180px]">{tecnico.correo}</span>
                               <span className="text-[10px] font-bold text-slate-300 italic">{tecnico.telefono}</span>
                             </div>
                          </td>
                          <td className="premium-td text-right">
                             <button
                               type="button"
                               disabled={assigning}
                               onClick={() => void handleAssignClick(tecnico)}
                               className="px-3 py-1.5 rounded-lg bg-primary-container text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-sm active:scale-95 disabled:opacity-50"
                             >
                               {assigning ? 'Asignando…' : 'Elegir'}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>

                <div className="p-4 bg-slate-50/50 border-t hairline-border border-slate-100 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocolo de asignación AyudaTIC 2026</p>
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
          {cancelTarget ? (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl" role="dialog" aria-modal="true">
                <h2 className="text-xl font-bold mb-2">Cancelar solicitud</h2>
                <p className="text-sm text-slate-500 mb-4">#{cancelTarget.codigoCaso}. El ticket se conserva en el historial.</p>
                <textarea
                  className="w-full min-h-28 rounded-2xl border border-slate-200 p-3 text-sm"
                  placeholder="Motivo obligatorio"
                  value={cancelMotivo}
                  onChange={(event) => setCancelMotivo(event.target.value)}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 text-sm font-bold" onClick={() => {
                    if (cancelTarget) clearWorkflowAttemptKey('cancel', cancelTarget._id)
                    setCancelTarget(null)
                    setCancelError(null)
                    setCancelLastPayload(undefined)
                  }}>
                    Cerrar
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50"
                    onClick={() => void handleCancelClick()}
                  >
                    {cancelling ? 'Cancelando…' : 'Confirmar cancelación'}
                  </button>
                </div>
                <WorkflowManualRetryNotice
                  error={cancelError}
                  lastPayload={cancelLastPayload}
                  currentPayload={{ motivo: cancelMotivo.trim() }}
                  onRetry={() => void handleCancelClick(cancelLastPayload)}
                />
              </div>
            </div>
          ) : null}
    </LeaderLayout>
  )
}
