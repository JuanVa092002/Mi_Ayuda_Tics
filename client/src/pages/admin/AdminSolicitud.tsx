import { useState, useEffect, type ReactNode } from 'react'
import {
  asignarSolicitudTecnico,
  cancelarSolicitud,
  getSolicitudesPendientes,
  WorkflowManualRetryNotice,
} from '@/features/tickets'
import { formatSolicitudFecha } from '@/features/tickets/leader-inbox'
import { getTecnicosAprobados } from '@/features/users'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { AppShell, SearchField, PaginationFooter, StatusBadge, Button, WorkCanvas, Metric, CommandBar, SplitWorkspace, Pane, SlideOverDrawer, AdaptiveSkeletonList } from '@/shared/ui'
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
      <WorkCanvas>
        <CommandBar
          metrics={
            <>
              <Metric label="Por despachar" value={solicitudes.length} />
              <Metric label="Técnicos disponibles" value={tecnicos.length} tone="ok" />
            </>
          }
        >
          <div className="w-full sm:w-80">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar ticket, ambiente o funcionario"
              label="Buscar en incidencias nuevas"
            />
          </div>
        </CommandBar>

        <SplitWorkspace
          queue={
          <Pane
            title="Cola de despacho"
            meta={`Página ${currentPage} de ${Math.max(1, totalPages)}`}
            footer={
              <PaginationFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="requerimientos"
              />
            }
          >

            {loading ? (
              <AdaptiveSkeletonList count={4} />
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
              <div className="divide-y" style={{ borderColor: 'var(--border-c)' }} role="list">
                {currentItems.map((item) => {
                  const isSelected = selectedSolicitud?._id === item._id
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setSelectedCaseId(item._id)}
                      className={`queue-item ${isSelected ? 'is-selected' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <p className="font-mono text-[11px] font-bold" style={{ color: 'var(--brand)' }}>
                          #{item.codigoCaso || item._id.slice(-6)}
                        </p>
                        <StatusBadge status={item.estado} label={item.displayStatus || item.estado} />
                      </div>
                      <h3 className="text-[13px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--ink-1)' }}>
                        {item.descripcion}
                      </h3>
                      <p className="mt-1.5 text-[11px]" style={{ color: 'var(--ink-3)' }}>
                        {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Sin solicitante'}
                        {' · '}
                        {item.ambiente?.nombre || 'Sin ambiente'}
                      </p>
                      <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ink-4)' }}>{formatSolicitudFecha(item.fecha)}</p>
                    </button>
                  )
                })}
              </div>
            )}

          </Pane>
          }
          detail={
          <div>
            {selectedSolicitud ? (
              <div
                className="rounded-xl border overflow-hidden sticky top-[72px] space-y-5 p-5"
                style={{ borderColor: 'var(--border-c)', boxShadow: 'var(--sh-sm)', background: 'var(--surface-0)' }}
              >
                {/* Header */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b"
                  style={{ borderColor: 'var(--border-c)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[12px] font-bold px-2.5 py-1 rounded-md"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--border-c)', color: 'var(--brand)' }}
                    >
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
                  <p className="text-overline mb-2">Qué reportó</p>
                  <p
                    className="text-[13px] font-medium leading-relaxed rounded-lg p-3.5"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--border-c)', color: 'var(--ink-1)' }}
                  >
                    {selectedSolicitud.descripcion}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="meta-row">
                    <span className="meta-label">Solicitante</span>
                    <span className="meta-value">
                      {typeof selectedSolicitud.usuario === 'object' ? selectedSolicitud.usuario?.nombre : 'Desconocido'}
                    </span>
                    {selectedSolicitud.telefono ? (
                      <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>Tel: {selectedSolicitud.telefono}</span>
                    ) : null}
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Ambiente</span>
                    <span className="meta-value">{selectedSolicitud.ambiente?.nombre || 'General'}</span>
                    <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>CTPI</span>
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
                    <p className="text-[15px] font-semibold text-ink">
                      Asignar técnico
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
                    <div
                      className="divide-y overflow-hidden rounded-lg max-h-60 overflow-y-auto"
                      style={{ border: '1px solid var(--border-c)', borderColor: 'var(--border-c)' }}
                    >
                      {tecnicos.map((tecnico) => (
                        <div
                          key={tecnico._id}
                          className="p-3 flex items-center justify-between transition-colors"
                          style={{ borderColor: 'var(--border-c)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink-1)' }}>{tecnico.nombre}</p>
                            <p className="text-[11px] truncate" style={{ color: 'var(--ink-3)' }}>{tecnico.correo} {tecnico.telefono ? `· ${tecnico.telefono}` : ''}</p>
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
              <div className="rounded-xl border border-dashed border-border-strong bg-surface p-12 text-center">
                <p className="text-base font-semibold text-ink">Selecciona un requerimiento para despachar</p>
                <p className="mt-1 text-sm text-ink-muted">La asignación queda en este panel, junto al caso.</p>
              </div>
            )}
          </div>
          }
        />
      </WorkCanvas>

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

      {/* Cancel Justification Slide-over Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(cancelTarget)}
        onClose={() => {
          if (cancelTarget) clearWorkflowAttemptKey('cancel', cancelTarget._id)
          setCancelTarget(null)
          setCancelError(null)
          setCancelLastPayload(undefined)
        }}
        title="Cancelar Solicitud de Incidencia"
        subtitle={cancelTarget ? `Caso #${cancelTarget.codigoCaso}. El ticket se preservará en el histórico con trazabilidad del motivo.` : undefined}
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                if (cancelTarget) clearWorkflowAttemptKey('cancel', cancelTarget._id)
                setCancelTarget(null)
                setCancelError(null)
                setCancelLastPayload(undefined)
              }}
            >
              Cerrar
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={cancelling}
              onClick={() => void handleCancelSubmit()}
              icon="cancel"
            >
              {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold" style={{ color: 'var(--ink-1)' }}>
            Motivo justificado de la cancelación
          </label>
          <textarea
            className="w-full min-h-32 rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
            style={{ borderColor: 'var(--border-c)', background: 'var(--surface-0)', color: 'var(--ink-1)' }}
            placeholder="Indica con detalle el motivo administrativo o técnico por el cual se cancela el requerimiento..."
            value={cancelMotivo}
            onChange={(event) => setCancelMotivo(event.target.value)}
          />
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
      </SlideOverDrawer>
    </AppShell>
  )
}
