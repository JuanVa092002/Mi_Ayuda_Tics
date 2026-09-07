import { useEffect, useState } from 'react'
import AppLayout from '@/app/layouts/AppLayout'
import AdminLayout from '@/app/layouts/AdminLayout'
import AdminSolicitudLayout from '@/app/layouts/AdminSolicitudLayout'
import { historialSolicitudesLider, reasignarTecnico, cancelarSolicitud, WorkflowManualRetryNotice } from '@/features/tickets'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import { getTecnicosAprobados } from '@/features/users'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { toast } from 'react-toastify'
import type { Solicitud, User } from '@/shared/types'

export default function SeguimientoSolicitud() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [action, setAction] = useState<{ type: 'reassign' | 'cancel'; solicitud: Solicitud } | null>(null)
  const [tecnicos, setTecnicos] = useState<User[]>([])
  const [selectedTecnico, setSelectedTecnico] = useState('')
  const [motivo, setMotivo] = useState('')
  const [actionError, setActionError] = useState<unknown>(null)
  const [actionLastPayload, setActionLastPayload] = useState<unknown>(undefined)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const data = await historialSolicitudesLider()
        setSolicitudes(data)
      } catch (error) {
        setFetchError(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    fetchHistorial()
  }, [])

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredSolicitudes = solicitudes.filter(solicitud =>
    (solicitud.codigoCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (solicitud.descripcion && solicitud.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Pagination Logic
  const totalItems = filteredSolicitudes.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSolicitudes.slice(indexOfFirstItem, indexOfLastItem)

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const getStatusBadge = (solicitud: Solicitud) => {
    const estado = solicitud.estado
    const label = solicitud.displayStatus
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border hairline-border transition-all";
    switch (estado) {
      case 'solicitado':
      case 'nuevo':
        return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>{label || 'Enviada'}
        </span>
      case 'asignado':
        return <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>{label || 'Asignado'}
        </span>
      case 'pendiente':
      case 'en_progreso':
      case 'esperando_usuario':
        return <span className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>{label || 'En Proceso'}
        </span>
      case 'finalizado':
      case 'resuelto':
      case 'cerrado':
      case 'cancelado':
        return <span className={`${baseClasses} bg-green-50 text-green-700 border-green-100`}>
          <span className="material-symbols-outlined !text-[12px] mr-1">verified</span>{label || 'Completado'}
        </span>
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-600 border-slate-200`}>{label || estado}</span>
    }
  }

  const openReassign = async (solicitud: Solicitud): Promise<void> => {
    try {
      const response = await getTecnicosAprobados()
      setTecnicos(response.tecnicos)
      setSelectedTecnico('')
      setMotivo('')
      setActionError(null)
      setActionLastPayload(undefined)
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
    setActionError(null)
    setActionLastPayload(undefined)
  }

  const currentActionPayload = (): unknown => {
    if (!action) return undefined
    if (action.type === 'cancel') return { motivo: motivo.trim() }
    return { tecnico: selectedTecnico, motivo: motivo.trim() }
  }

  const submitAction = async (payloadOverride?: unknown): Promise<void> => {
    if (!action) return
    const payload = (payloadOverride ?? currentActionPayload()) as { motivo?: string; tecnico?: string }
    if ((payload.motivo ?? '').length < 3) {
      toast.error('El motivo es obligatorio.')
      return
    }
    try {
      if (action.type === 'cancel') {
        await cancelarSolicitud(action.solicitud._id, payload.motivo ?? '')
        toast.success('Solicitud cancelada')
      } else {
        if (!payload.tecnico) {
          toast.error('Selecciona un técnico.')
          return
        }
        await reasignarTecnico(action.solicitud._id, { tecnico: payload.tecnico, motivo: payload.motivo ?? '' })
        toast.success('Técnico reasignado')
      }
      const data = await historialSolicitudesLider()
      setSolicitudes(data)
      closeAction()
    } catch (error) {
      setActionError(error)
      setActionLastPayload(payload)
      const failure = classifyWorkflowMutationFailure(error)
      if (!failure.offersManualRetry) {
        toast.error(getApiErrorMessage(error))
      }
    }
  }

  return (
    <AppLayout>
      <AdminLayout>
        <AdminSolicitudLayout>
          <main className="p-4 sm:p-8">
            <section className="solid-card rounded-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              {/* Header of Table */}
              <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Seguimiento de Solicitudes</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Supervisión global de tickets y asignaciones.</p>
                </div>
                <div className="relative w-full sm:w-72 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px] group-focus-within:text-primary-container transition-colors">search</span>
                  <input 
                    className="w-full pl-11 pr-4 py-2.5 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all placeholder:text-slate-400" 
                    placeholder="Buscar por código de caso..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table Body */}
              <div className="w-full overflow-auto max-h-[calc(100vh-350px)] hairline-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-0">
                  <thead className="sticky-header">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[100px]">Ticket</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[130px]">Fecha</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[200px]">Descripción</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[140px]">Usuario</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[140px]">Ambiente</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 text-center w-[80px]">Evidencia</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[140px]">Técnico</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[180px]">Solución</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[140px]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30 animate-pulse">
                            <span className="material-symbols-outlined !text-[48px] animate-spin">progress_activity</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Cargando solicitudes...</p>
                          </div>
                        </td>
                      </tr>
                    ) : fetchError ? (
                      <tr>
                        <td colSpan={9} className="py-24 text-center text-red-600 font-semibold">{fetchError}</td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((row) => (
                        <tr key={row._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-6 px-6 align-top">
                            <span className="text-[13px] font-bold text-primary-container leading-none">#{row.codigoCaso}</span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className="text-[13px] font-semibold text-on-surface whitespace-nowrap leading-none">{row.fecha}</span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <p className="text-[13px] font-medium text-on-surface leading-relaxed line-clamp-2">{row.descripcion}</p>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined !text-[16px] text-slate-300">person</span>
                              <span className="text-[13px] font-medium text-on-surface leading-none">{(typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : undefined) || 'Sin usuario'}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined !text-[16px] text-emerald-500 font-variation-['FILL'_1]">location_on</span>
                              <span className="text-[13px] font-medium text-on-surface leading-none">{row.ambiente?.nombre || 'Sin ambiente'}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top text-center">
                            {row.foto ? (
                              <a href={row.foto.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-primary-container hover:text-white transition-all shadow-sm">
                                <span className="material-symbols-outlined !text-[18px]">image</span>
                              </a>
                            ) : (
                              <span className="material-symbols-outlined text-slate-200 !text-[18px]">hide_image</span>
                            )}
                          </td>
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined !text-[14px] text-on-surface-variant">support_agent</span>
                              </div>
                              <span className="text-[13px] font-bold text-on-surface">{(typeof row.tecnico === 'object' && row.tecnico ? row.tecnico.nombre : undefined) || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <p className="text-[12px] font-medium text-on-surface-variant leading-relaxed line-clamp-2 italic">
                              {(typeof row.solucion === 'object' && row.solucion ? row.solucion.descripcionSolucion : undefined) || 'Pendiente de cierre'}
                            </p>
                          </td>
                          <td className="py-6 px-6 align-top">
                            {getStatusBadge(row)}
                            <div className="mt-2 flex flex-col gap-1">
                              {row.capabilities?.canReassign ? (
                                <button type="button" className="text-[10px] font-bold uppercase text-amber-700" onClick={() => void openReassign(row)}>
                                  Reasignar
                                </button>
                              ) : null}
                              {row.capabilities?.canCancel ? (
                                <button type="button" className="text-[10px] font-bold uppercase text-red-700" onClick={() => { setMotivo(''); setActionError(null); setActionLastPayload(undefined); setAction({ type: 'cancel', solicitud: row }) }}>
                                  Cancelar
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                            <span className="material-symbols-outlined !text-[64px]">layers_clear</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">No hay solicitudes disponibles</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-6 border-t hairline-border border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Página {currentPage} de {totalPages || 1}</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{totalItems} registros totales</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevPage} disabled={currentPage === 1} className="w-9 h-9 rounded-xl flex items-center justify-center border hairline-border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm group">
                    <span className="material-symbols-outlined !text-[20px] group-active:scale-90 transition-transform">chevron_left</span>
                  </button>
                  <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="w-9 h-9 rounded-xl flex items-center justify-center border hairline-border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm group">
                    <span className="material-symbols-outlined !text-[20px] group-active:scale-90 transition-transform">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </main>
          {action ? (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-4">{action.type === 'cancel' ? 'Cancelar solicitud' : 'Reasignar técnico'}</h2>
                {action.type === 'reassign' ? (
                  <select className="w-full mb-3 rounded-xl border p-2" value={selectedTecnico} onChange={(event) => setSelectedTecnico(event.target.value)}>
                    <option value="">Selecciona técnico</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico._id} value={tecnico._id}>{tecnico.nombre}</option>
                    ))}
                  </select>
                ) : null}
                <textarea className="w-full min-h-24 rounded-xl border p-3" placeholder="Motivo obligatorio" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={closeAction}>Cerrar</button>
                  <button type="button" className="px-4 py-2 rounded-xl bg-primary-container text-white font-bold" onClick={() => void submitAction()}>
                    Confirmar
                  </button>
                </div>
                <WorkflowManualRetryNotice
                  error={actionError}
                  lastPayload={actionLastPayload}
                  currentPayload={currentActionPayload()}
                  onRetry={() => void submitAction(actionLastPayload)}
                />
              </div>
            </div>
          ) : null}
        </AdminSolicitudLayout>
      </AdminLayout>
    </AppLayout>
  )
}
