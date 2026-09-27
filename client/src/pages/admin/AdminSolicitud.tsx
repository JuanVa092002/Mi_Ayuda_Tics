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
import {
  AppShell,
  SearchField,
  PaginationFooter,
  StatusBadge,
  Button,
  WorkCanvas,
  SplitWorkspace,
  Pane,
  SlideOverDrawer,
  AdaptiveSkeletonList,
} from '@/shared/ui'
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
        setSelectedCaseId((prev) => prev ?? data[0]._id)
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
      setSolicitudes((prev) => prev.filter((item) => item._id !== cancelTarget._id))
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

  const handleAssignClick = async (
    tecnico: User,
    targetSolicitudId?: string,
    payloadOverride?: { tecnico: string }
  ) => {
    const solicitudId = targetSolicitudId || selectedCaseId
    if (!solicitudId || assigning) return
    const tecnicoIdStr = payloadOverride?.tecnico ?? tecnico._id
    setAssigning(true)
    try {
      await asignarSolicitudTecnico(solicitudId, { tecnico: tecnicoIdStr })
      toast.success(`Solicitud asignada a ${tecnico.nombre} exitosamente`)
      setSolicitudes((prev) => prev.filter((solicitud) => solicitud._id !== solicitudId))
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

  const filteredData = solicitudes.filter(
    (row) =>
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

  const selectedSolicitud = solicitudes.find((s) => s._id === selectedCaseId) || currentItems[0] || null

  // Urgent cases without assignment for prioritized decision
  const urgentQueue = solicitudes.slice(0, 3)

  return (
    <AppShell subtitleContext="Centro de Decisión y Despacho Operativo TIC">
      <WorkCanvas>
        {/* Executive Decision Header & Team Capacity Grid */}
        <section
          className="rounded-2xl border p-5 lg:p-6 relative overflow-hidden"
          style={{
            borderColor: 'var(--border-c)',
            background: 'linear-gradient(135deg, var(--surface-0) 0%, var(--surface-1) 100%)',
            boxShadow: 'var(--sh-xs)',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-subtle">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-[20px] text-azul-sena">hub</span>
                <span className="text-xs font-bold uppercase tracking-wider text-azul-sena">
                  Mando Operativo CTPI
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-azul-sena tracking-tight">
                Centro de Decisión y Despacho
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Monitorea cuellos de botella, la capacidad del equipo técnico y asigna prioridades en tiempo real.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-subtle">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Sin Asignar</p>
                  <p className="text-lg font-black text-amber-700">{solicitudes.length}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Técnicos Activos</p>
                  <p className="text-lg font-black text-verde-sena">{tecnicos.length}</p>
                </div>
              </div>

              <div className="w-full sm:w-72">
                <SearchField
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar ticket, solicitante o ambiente..."
                  label="Buscar en despacho"
                />
              </div>
            </div>
          </div>

          {/* Real-time Team Capacity & Workload Strip */}
          <div className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined !text-[16px] text-azul-sena">engineering</span>
                Disponibilidad y Capacidad de Técnicos
              </p>
              <span className="text-[11px] font-medium text-slate-500">
                Haz clic en cualquier técnico para asignarle el caso seleccionado
              </span>
            </div>

            {loadingTecnicos ? (
              <div className="py-4 text-xs text-slate-400 font-medium">Cargando disponibilidad técnica...</div>
            ) : tecnicos.length === 0 ? (
              <div className="p-3 text-xs text-amber-800 bg-amber-50 rounded-xl font-medium">
                No hay técnicos activos actualmente para despacho.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {tecnicos.map((tecnico) => (
                  <button
                    key={tecnico._id}
                    type="button"
                    onClick={() => {
                      if (selectedSolicitud) void handleAssignClick(tecnico, selectedSolicitud._id)
                    }}
                    disabled={!selectedSolicitud || assigning}
                    className="p-3 rounded-xl border border-border-subtle bg-surface hover:border-verde-sena hover:bg-surface-selected transition-all text-left group cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-azul-sena/10 text-azul-sena group-hover:bg-verde-sena group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0">
                        {tecnico.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-azul-sena truncate group-hover:text-verde-sena">
                          {tecnico.nombre}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {tecnico.telefono || 'Especialista en sitio'}
                        </p>
                      </div>
                      <span className="material-symbols-outlined !text-[18px] text-slate-300 group-hover:text-verde-sena transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Dispatch Workspace: Queue on Left, Contextual Decision Inspector on Right */}
        <SplitWorkspace
          queue={
            <Pane
              title="Cola de Despacho Priorizada"
              meta={`Página ${currentPage} de ${Math.max(1, totalPages)} · ${totalItems} pendientes`}
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
                        className={`w-full text-left p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-selected border-l-4 border-l-azul-sena'
                            : 'hover:bg-surface-subtle'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <p className="font-mono text-xs font-bold text-azul-sena">
                            #{item.codigoCaso || item._id.slice(-6)}
                          </p>
                          <StatusBadge status={item.estado} label={item.displayStatus || item.estado} />
                        </div>
                        <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 mb-1.5">
                          {item.descripcion}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {typeof item.usuario === 'object' ? item.usuario?.nombre : 'Sin solicitante'}
                          {' · '}
                          <span className="font-bold text-slate-700">{item.ambiente?.nombre || 'Sin ambiente'}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">{formatSolicitudFecha(item.fecha)}</p>
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
                  className="rounded-2xl border overflow-hidden sticky top-[72px] space-y-5 p-5"
                  style={{
                    borderColor: 'var(--border-c)',
                    boxShadow: 'var(--sh-sm)',
                    background: 'var(--surface-0)',
                  }}
                >
                  {/* Header of Inspector */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b"
                    style={{ borderColor: 'var(--border-c)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-azul-sena">
                        #{selectedSolicitud.codigoCaso || selectedSolicitud._id.slice(-6)}
                      </span>
                      <StatusBadge
                        status={selectedSolicitud.estado}
                        label={selectedSolicitud.displayStatus || selectedSolicitud.estado}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">
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
                        Cancelar caso
                      </button>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Detalle de la Incidencia Reportada
                    </p>
                    <p className="text-sm font-medium leading-relaxed rounded-xl p-3.5 bg-surface-subtle border border-border-subtle text-ink">
                      {selectedSolicitud.descripcion}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle">
                      <span className="text-[10px] font-black uppercase text-slate-400">Solicitante</span>
                      <p className="text-xs font-bold text-azul-sena mt-0.5 truncate">
                        {typeof selectedSolicitud.usuario === 'object'
                          ? selectedSolicitud.usuario?.nombre
                          : 'Desconocido'}
                      </p>
                      {selectedSolicitud.telefono ? (
                        <p className="text-[11px] text-slate-500 mt-0.5">Tel: {selectedSolicitud.telefono}</p>
                      ) : null}
                    </div>
                    <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle">
                      <span className="text-[10px] font-black uppercase text-slate-400">Ambiente Afectado</span>
                      <p className="text-xs font-bold text-azul-sena mt-0.5 truncate">
                        {selectedSolicitud.ambiente?.nombre || 'General'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Sede CTPI</p>
                    </div>
                  </div>

                  {/* Evidence Viewer if present */}
                  {selectedSolicitud.foto ? (
                    <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle">
                      <p className="text-xs font-bold text-azul-sena mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[18px]">image</span>
                        Evidencia Fotográfica Adjunta
                      </p>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(selectedSolicitud.foto?.url || null)}
                        className="h-24 w-32 rounded-xl overflow-hidden border border-border-subtle group relative cursor-pointer"
                      >
                        <img
                          src={selectedSolicitud.foto.url}
                          alt="Evidencia adjunta"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <span className="material-symbols-outlined !text-[18px]">zoom_in</span>
                        </div>
                      </button>
                    </div>
                  ) : null}

                  {/* Instant Dispatch Action Box */}
                  <div className="pt-2 border-t border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Despachar a Especialista en 1 Toque
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {tecnicos.length} disponibles
                      </span>
                    </div>

                    {loadingTecnicos ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        Cargando personal técnico...
                      </div>
                    ) : tecnicos.length === 0 ? (
                      <div className="p-3 text-xs text-amber-800 bg-amber-50 rounded-xl font-medium">
                        No hay técnicos disponibles en este momento.
                      </div>
                    ) : (
                      <div className="divide-y rounded-xl border border-border-subtle max-h-56 overflow-y-auto">
                        {tecnicos.map((tecnico) => (
                          <div
                            key={tecnico._id}
                            className="p-3 flex items-center justify-between hover:bg-surface-subtle transition-colors"
                          >
                            <div className="min-w-0 pr-3">
                              <p className="text-xs font-bold text-azul-sena truncate">{tecnico.nombre}</p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {tecnico.correo} {tecnico.telefono ? `· ${tecnico.telefono}` : ''}
                              </p>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={assigning}
                              onClick={() => void handleAssignClick(tecnico, selectedSolicitud._id)}
                              icon="person_add"
                            >
                              {assigning ? 'Asignando...' : 'Asignar'}
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
                <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
                  <p className="text-base font-bold text-azul-sena">Selecciona un requerimiento para despachar</p>
                  <p className="mt-1 text-xs text-slate-500">
                    La asignación se realiza con un solo clic sobre la cuadrícula superior o en este panel.
                  </p>
                </div>
              )}
            </div>
          }
        />
      </WorkCanvas>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Evidencia ampliada"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
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
        subtitle={
          cancelTarget
            ? `Caso #${cancelTarget.codigoCaso}. El ticket se preservará en el histórico con trazabilidad del motivo.`
            : undefined
        }
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
              variant="destructive"
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
          <label className="text-xs font-semibold text-slate-700">
            Motivo justificado de la cancelación
          </label>
          <textarea
            className="w-full min-h-32 rounded-xl border border-border-subtle p-3.5 text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
            placeholder="Especifica claramente por qué no procede la atención de este ticket..."
            value={cancelMotivo}
            onChange={(e) => setCancelMotivo(e.target.value)}
          />
        </div>
      </SlideOverDrawer>
    </AppShell>
  )
}
