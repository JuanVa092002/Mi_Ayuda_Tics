import { useState, useEffect, type ReactNode } from 'react'
import {
  asignarSolicitudTecnico,
  cancelarSolicitud,
  getSolicitudesPendientes,
  WorkflowManualRetryNotice,
} from '@/features/tickets'
import { formatSolicitudFecha, workflowLabel } from '@/features/tickets/leader-inbox'
import { getTecnicosAprobados } from '@/features/users'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { AppShell, SearchField, PaginationFooter, StatusBadge, Button } from '@/shared/ui'
import { classifyWorkflowMutationFailure } from '@/features/tickets/api/workflow-retry-policy'
import { clearWorkflowAttemptKey } from '@/features/tickets/api/workflow-idempotency'
import type { Solicitud, User } from '@/shared/types'


export default function AdminSolicitud(): ReactNode {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [tecnicos, setTecnicos] = useState<User[]>([])
  const [loadingTecnicos, setLoadingTecnicos] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<unknown>(null)
  const [assignLastPayload, setAssignLastPayload] = useState<{ tecnico: string } | undefined>(undefined)

  const [cancelTarget, setCancelTarget] = useState<Solicitud | null>(null)
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<unknown>(null)
  const [cancelLastPayload, setCancelLastPayload] = useState<{ motivo: string } | undefined>(undefined)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    void fetchSolicitudes()
    void fetchTecnicos()
  }, [])

  const fetchSolicitudes = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data: Solicitud[] = await getSolicitudesPendientes()
      setSolicitudes(data)
      if (data.length > 0) {
        setSelectedCaseId(prev => prev ?? data[0]._id)
      }
    } catch (error) {
      setFetchError(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const fetchTecnicos = async () => {
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
    const validationError =
      motivoValue.length < 5
        ? 'El motivo debe tener al menos 5 caracteres.'
        : motivoValue.length > 500
          ? 'El motivo no puede exceder los 500 caracteres.'
          : null

    if (validationError) {
      toast.error(validationError)
      return
    }
    setCancelling(true)
    try {
      await cancelarSolicitud(cancelTarget._id, motivoValue)
      toast.success('Solicitud cancelada correctamente')
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

  const handleAssignClick = async (tecnico: User, targetSolicitudId?: string, payloadOverride?: { tecnico: string }) => {
    const solicitudId = targetSolicitudId || selectedCaseId
    if (!solicitudId || assigning) return
    const tecnicoIdStr = payloadOverride?.tecnico ?? tecnico._id
    setAssigning(true)
    try {
      await asignarSolicitudTecnico(solicitudId, { tecnico: tecnicoIdStr })
      toast.success(`Solicitud asignada a ${tecnico.nombre} exitosamente`)
      setSolicitudes(prev => prev.filter(solicitud => solicitud._id !== solicitudId))
      setAssignError(null)
      setAssignLastPayload(undefined)
    } catch (error) {
      setAssignError(error)
      setAssignLastPayload({ tecnico: tecnicoIdStr })
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
  
  const selectedSolicitud = solicitudes.find(s => s._id === selectedCaseId) || currentItems[0] || null

  return (
    <AppShell subtitleContext="Centro de Mando TIC">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Executive Command Header */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span>Centro de Mando TIC · Despacho y Asignación</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Mesa de Control de Nuevas Incidencias
            </h1>
            <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
              Evalúa requerimientos recién radicados, analiza evidencia técnica y asigna especialistas con un solo clic.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-surface-subtle border border-border-subtle px-4 py-2.5 rounded-xl text-center min-w-[110px]">
              <p className="text-xs font-medium text-ink-muted">Por despachar</p>
              <p className="text-2xl font-extrabold text-brand-deep mt-0.5">{solicitudes.length}</p>
            </div>
            <div className="bg-surface-subtle border border-border-subtle px-4 py-2.5 rounded-xl text-center min-w-[110px]">
              <p className="text-xs font-medium text-ink-muted">Técnicos activos</p>
              <p className="text-2xl font-extrabold text-brand-green mt-0.5">{tecnicos.length}</p>
            </div>
          </div>
        </section>

        {/* Search & Actions Toolbar */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#dbe4e8] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-azul-sena">
              Cola de Triaje y Despacho
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-azul-sena text-[11px] font-bold">
              {totalItems} pendientes
            </span>
          </div>

          <div className="w-full sm:w-80 shrink-0">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ticket, ambiente o funcionario..."
              label="Buscar en incidencias nuevas"
            />
          </div>
        </section>

        {/* Master-Detail Split Workspace (Zero horizontal scroll) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Incoming Ticket Queue (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#dbe4e8] shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#dbe4e8] bg-[#f5f8f9] flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-azul-sena">
                Requerimientos Entrantes ({totalItems})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Página {currentPage} de {Math.max(1, totalPages)}
              </span>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-3 border-slate-200 border-t-azul-sena" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Cargando cola de despacho...</p>
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center text-red-600 font-bold text-sm">
                {fetchError}
              </div>
            ) : currentItems.length === 0 ? (
              <div className="py-20 text-center px-4">
                <span className="material-symbols-outlined !text-[44px] text-slate-300">task_alt</span>
                <p className="mt-2 text-sm font-bold text-slate-700">Mesa de despacho al día</p>
                <p className="text-xs text-slate-400 mt-0.5">No hay requerimientos pendientes de asignación.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#dbe4e8]/70" role="list">
                {currentItems.map((item) => {
                  const isSelected = selectedSolicitud?._id === item._id
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setSelectedCaseId(item._id)}
                      className={`w-full text-left p-4.5 transition-all cursor-pointer flex flex-col gap-2 relative ${
                        isSelected
                          ? 'bg-blue-50/50 ring-2 ring-inset ring-azul-sena/20 border-l-4 border-l-azul-sena'
                          : 'hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-azul-sena">
                            #{item.codigoCaso || item._id.slice(-6)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {workflowLabel(item.workflowVersion)}
                          </span>
                        </div>
                        <StatusBadge status={item.estado} label={item.displayStatus || item.estado} />
                      </div>

                      <h3 className="text-sm font-bold text-on-surface line-clamp-2">
                        {item.descripcion}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                          {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Desconocido'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.ambiente?.nombre || 'General'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatSolicitudFecha(item.fecha)}
                        </span>
                        <span className="text-[11px] font-bold text-azul-sena flex items-center gap-0.5">
                          Despachar <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
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
                itemLabel="requerimientos"
              />
            </div>
          </div>

          {/* Right Panel: Dispatch Inspector & Specialist Assignment (7 cols) */}
          <div className="lg:col-span-7">
            {selectedSolicitud ? (
              <div className="bg-white rounded-3xl border border-[#dbe4e8] shadow-sm overflow-hidden sticky top-24 space-y-6 p-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#dbe4e8]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-[#f5f8f9] border border-[#dbe4e8] text-azul-sena">
                      #{selectedSolicitud.codigoCaso || selectedSolicitud._id.slice(-6)}
                    </span>
                    <StatusBadge status={selectedSolicitud.estado} label={selectedSolicitud.displayStatus || selectedSolicitud.estado} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">
                      {formatSolicitudFecha(selectedSolicitud.fecha)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCancelTarget(selectedSolicitud)
                        setCancelMotivo('')
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Cancelar solicitud con justificación"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detalle de la Incidencia</p>
                  <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed bg-[#f5f8f9] p-4 rounded-2xl border border-[#dbe4e8]">
                    {selectedSolicitud.descripcion}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#f5f8f9] border border-[#dbe4e8]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Funcionario Solicitante</p>
                    <p className="text-sm font-bold text-azul-sena mt-1">
                      {typeof selectedSolicitud.usuario === 'object' ? selectedSolicitud.usuario?.nombre : 'Desconocido'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedSolicitud.telefono ? `Tel: ${selectedSolicitud.telefono}` : 'Sin teléfono'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f5f8f9] border border-[#dbe4e8]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ambiente Afectado</p>
                    <p className="text-sm font-bold text-azul-sena mt-1">
                      {selectedSolicitud.ambiente?.nombre || 'General'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Sede Central CTPI</p>
                  </div>
                </div>

                {/* Evidence Viewer if present */}
                {selectedSolicitud.foto ? (
                  <div className="p-4 rounded-2xl border border-[#dbe4e8] bg-white">
                    <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[18px] text-azul-sena">image</span>
                      Evidencia Adjunta
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(selectedSolicitud.foto?.url || null)}
                      className="h-24 w-32 rounded-xl overflow-hidden border border-[#dbe4e8] group relative cursor-pointer"
                    >
                      <img
                        src={selectedSolicitud.foto.url}
                        alt="Evidencia adjunta"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  </div>
                ) : null}

                {/* Specialist Assignment Section */}
                <div className="pt-2 border-t border-[#dbe4e8] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-azul-sena">
                      Asignar Especialista Técnico
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {tecnicos.length} disponibles
                    </span>
                  </div>

                  {loadingTecnicos ? (
                    <div className="p-6 text-center text-xs text-slate-400">Cargando personal técnico...</div>
                  ) : tecnicos.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 text-xs font-semibold">
                      No hay técnicos aprobados disponibles actualmente.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#dbe4e8] border border-[#dbe4e8] rounded-2xl overflow-hidden max-h-60 overflow-y-auto hairline-scrollbar">
                      {tecnicos.map((tecnico) => (
                        <div key={tecnico._id} className="p-3.5 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                          <div className="min-w-0 pr-3">
                            <p className="text-sm font-bold text-ink truncate">{tecnico.nombre}</p>
                            <p className="text-xs text-ink-muted truncate">{tecnico.correo} {tecnico.telefono ? `· ${tecnico.telefono}` : ''}</p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={assigning}
                            onClick={() => void handleAssignClick(tecnico, selectedSolicitud._id)}
                            icon="person_add"
                          >
                            {assigning ? 'Asignando...' : 'Asignar técnico'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <WorkflowManualRetryNotice
                    error={assignError}
                    lastPayload={assignLastPayload}
                    currentPayload={assignLastPayload}
                    onRetry={() => {
                      if (!assignLastPayload || !selectedSolicitud) return
                      const tecnico = tecnicos.find((item) => item._id === assignLastPayload.tecnico)
                      if (tecnico) void handleAssignClick(tecnico, selectedSolicitud._id, assignLastPayload)
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#dbe4e8] p-12 text-center text-slate-400">
                <span className="material-symbols-outlined !text-[48px] text-slate-300">dashboard_customize</span>
                <p className="mt-2 text-sm font-bold text-slate-700">Selecciona un requerimiento para despachar</p>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* Cancel Justification Modal */}
      {cancelTarget ? (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[#dbe4e8]" role="dialog" aria-modal="true">
            <h2 className="text-xl font-bold text-on-surface mb-1.5">Cancelar Solicitud de Incidencia</h2>
            <p className="text-xs text-slate-500 mb-4">Caso #{cancelTarget.codigoCaso}. El ticket se preservará en el histórico con trazabilidad del motivo.</p>
            <textarea
              className="w-full min-h-28 rounded-2xl border border-[#dbe4e8] p-4 text-sm focus:border-azul-sena focus:outline-none"
              placeholder="Indica el motivo justificado de la cancelación..."
              value={cancelMotivo}
              onChange={(event) => setCancelMotivo(event.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3 border-t border-[#dbe4e8] pt-4">
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
