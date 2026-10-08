import { useMemo, useState, type ReactNode } from 'react'
import type { Solicitud, SolicitudHistorialEvent } from '@/shared/types'
import { useAuth } from '@/features/auth'
import { resolveTimelineActor } from '@/features/tickets/utils/timeline-identity'

export interface TechnicianDialogueFeedProps {
  solicitud: Solicitud
  onSendFieldNote?: (message: string) => Promise<void>
  onRequestInfo?: (message: string) => Promise<void>
  onOpenPreview?: (url: string) => void
}

export function TechnicianDialogueFeed({
  solicitud,
  onSendFieldNote,
  onRequestInfo,
  onOpenPreview,
}: TechnicianDialogueFeedProps): ReactNode {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dialogue' | 'all'>('dialogue')
  const [quickMessage, setQuickMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendMode, setSendMode] = useState<'note' | 'info'>('note')

  const [optimisticEvents, setOptimisticEvents] = useState<SolicitudHistorialEvent[]>([])

  const events = useMemo(() => {
    const list = Array.isArray(solicitud.historial) ? [...solicitud.historial] : []
    // Si no hay historial pero hay descripción original, creamos el evento inicial
    if (list.length === 0 && solicitud.descripcion) {
      list.push({
        type: 'created',
        message: solicitud.descripcion,
        createdAt: solicitud.fecha,
        author: {
          nombre: typeof solicitud.usuario === 'object' ? solicitud.usuario?.nombre : 'Funcionario',
          rol: 'funcionario',
        },
      })
    }
    // Añadir eventos optimistas pendientes que aún no están en el historial del servidor
    if (optimisticEvents.length > 0) {
      const existingIds = new Set(list.map((e) => e._id || e.id))
      const pending = optimisticEvents.filter((oe) => !existingIds.has(oe._id || oe.id))
      list.push(...pending)
    }
    return list
  }, [solicitud.historial, solicitud.descripcion, solicitud.fecha, solicitud.usuario, optimisticEvents])

  const filteredEvents = useMemo(() => {
    if (activeTab === 'all') return events
    // En modo diálogo, destacamos la interacción entre personas (notas de campo, respuestas, preguntas, solución)
    return events.filter((ev) =>
      [
        'created',
        'update',
        'waiting_for_requester',
        'requester_reply',
        'partial_solution',
        'resolved',
        'closed',
        'reopened',
      ].includes(ev.type) || !['assigned', 'reassigned'].includes(ev.type)
    )
  }, [events, activeTab])

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = quickMessage.trim()
    if (!msg || isSubmitting) return
    setIsSubmitting(true)
    const tempId = `optimistic-${Date.now()}`
    const optEvent: SolicitudHistorialEvent = {
      _id: tempId,
      id: tempId,
      type: sendMode === 'note' ? 'note_added' : 'waiting_for_requester',
      message: msg,
      createdAt: new Date().toISOString(),
      author: {
        _id: user?._id,
        id: user?._id,
        nombre: user?.nombre || 'Técnico Especialista',
        rol: (user?.rol as any) || 'tecnico',
      },
      caseRole: 'TECNICO_ASIGNADO',
    }
    setOptimisticEvents((prev) => [...prev, optEvent])
    setQuickMessage('')

    try {
      if (sendMode === 'note' && onSendFieldNote) {
        await onSendFieldNote(msg)
      } else if (sendMode === 'info' && onRequestInfo) {
        await onRequestInfo(msg)
      }
    } catch {
      // Revertir evento optimista si falló la llamada
      setOptimisticEvents((prev) => prev.filter((ev) => ev._id !== tempId))
      setQuickMessage(msg)
    } finally {
      setIsSubmitting(false)
      // Limpiar optimista tras confirmación
      setTimeout(() => {
        setOptimisticEvents((prev) => prev.filter((ev) => ev._id !== tempId))
      }, 1500)
    }
  }

  const isEnAtencion =
    solicitud.estado === 'en_progreso' ||
    solicitud.estado === 'en_atencion' ||
    solicitud.estado === 'esperando_usuario'

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
      {/* Header del Feed */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-azul-sena text-white flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined !text-[18px]">forum</span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              Diálogo de Intervención & Bitácora de Campo
            </h3>
            <p className="text-[11px] text-slate-500">
              Comunicación directa entre el especialista técnico y el funcionario
            </p>
          </div>
        </div>

        {/* Toggle de vista */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('dialogue')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dialogue'
                ? 'bg-white text-azul-sena shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Diálogo y Avances
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-azul-sena shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos los Eventos ({events.length})
          </button>
        </div>
      </div>

      {/* Lista de mensajes / entradas de bitácora */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[480px] overflow-y-auto divide-y divide-slate-100/80">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <span className="material-symbols-outlined !text-[36px] text-slate-300 mx-auto mb-2 block">
              chat_bubble_outline
            </span>
            <p className="text-xs font-bold text-slate-600">Aún no hay mensajes o notas registradas</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Utiliza el cuadro inferior para registrar notas técnicas o consultar al funcionario.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const actorMeta = resolveTimelineActor({
              event: ev,
              solicitud,
              currentUser: user || null,
            })

            const isWaitingUser = ev.type === 'waiting_for_requester'
            const isRequesterReply = ev.type === 'requester_reply'
            const isSolution = ev.type === 'resolved' || ev.type === 'partial_solution'

            return (
              <div
                key={ev._id || idx}
                className="pt-3.5 first:pt-0 flex gap-3 transition-all justify-start"
              >
                {/* Avatar / Icono */}
                <div
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-black ${
                    isWaitingUser
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : isRequesterReply
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : isSolution
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      : actorMeta.isTechnicianParty
                      ? 'bg-azul-sena text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined !text-[17px]">
                    {isWaitingUser
                      ? 'contact_support'
                      : isRequesterReply
                      ? 'send'
                      : isSolution
                      ? 'task_alt'
                      : actorMeta.isTechnicianParty
                      ? 'handyman'
                      : 'person'}
                  </span>
                </div>

                {/* Contenido del Globo / Evento */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {actorMeta.isCurrentUser ? `${actorMeta.authorDisplayName} (Tú)` : actorMeta.authorDisplayName}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                          isWaitingUser
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isRequesterReply
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : actorMeta.isTechnicianParty
                            ? 'bg-blue-50 text-azul-sena border border-blue-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isWaitingUser
                          ? 'Consulta al Funcionario'
                          : isRequesterReply
                          ? 'Respuesta del Funcionario'
                          : actorMeta.isTechnicianParty
                          ? 'Técnico en Sitio'
                          : actorMeta.partyLabel}
                      </span>
                    </div>

                    {ev.createdAt && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Cuerpo del mensaje */}
                  <div
                    className={`rounded-2xl p-3 text-xs sm:text-sm leading-relaxed border ${
                      isWaitingUser
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : isRequesterReply
                        ? 'bg-indigo-50/50 border-indigo-200 text-slate-900 font-medium'
                        : isSolution
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : actorMeta.isTechnicianParty
                        ? 'bg-blue-50/40 border-blue-100 text-slate-800'
                        : 'bg-slate-50 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{ev.message}</p>

                    {/* Metadatos adicionales de solución */}
                    {ev.metadata?.whatWasDone && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                        <strong>Procedimiento:</strong> {ev.metadata.whatWasDone}
                      </div>
                    )}
                    {ev.metadata?.pendingWork && (
                      <div className="mt-1 text-[11px] text-amber-900 font-medium">
                        <strong>Pendiente:</strong> {ev.metadata.pendingWork}
                      </div>
                    )}

                    {/* Adjuntos del evento si existen */}
                    {ev.attachment?.url && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => onOpenPreview?.(ev.attachment!.url!)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-azul-sena hover:underline cursor-pointer"
                        >
                          <span className="material-symbols-outlined !text-[15px]">attachment</span>
                          <span>Ver archivo / foto adjunta</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Barra de Entrada Rápida de Campo (Sólo disponible si está en atención) */}
      {isEnAtencion && (onSendFieldNote || onRequestInfo) && (
        <form
          onSubmit={handleQuickSend}
          className="p-3 sm:p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setSendMode('note')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sendMode === 'note'
                    ? 'bg-azul-sena text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined !text-[14px]">edit_note</span>
                <span>Bitácora Técnica</span>
              </button>
              <button
                type="button"
                onClick={() => setSendMode('info')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sendMode === 'info'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined !text-[14px]">help_outline</span>
                <span>Consultar al Funcionario</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              {sendMode === 'note'
                ? 'Visible en la bitácora del ticket'
                : 'Pone el caso en espera de respuesta'}
            </span>
          </div>

          {/* OPP-5 / P4: Notificación de Próxima Acción & ETA en Vivo / Consultas de Desbloqueo */}
          {sendMode === 'note' ? (
            <div className="space-y-1.5 py-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black text-azul-sena uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[13px]">near_me</span>
                  <span>ETA:</span>
                </span>
                {[
                  '🏃 En camino al ambiente con herramientas (ETA ~5 min)',
                  '🔍 Diagnosticando falla físicamente en el puesto',
                  '📶 En pruebas de conectividad y velocidad de red',
                  '🛠️ Procediendo con reinstalación de software',
                  '🏢 Trasladado a Taller TIC para revisión mayor',
                ].map((eta) => (
                  <button
                    key={eta}
                    type="button"
                    onClick={() => setQuickMessage(eta)}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-azul-sena hover:bg-blue-100 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    {eta.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* P4: Píldoras de Desbloqueo Técnico 1-Tap para consultar al funcionario */
            <div className="space-y-1.5 py-0.5 animate-fade-in">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[13px]">help</span>
                  <span>Pregunta Rápida:</span>
                </span>
                {[
                  '🔑 ¿El equipo tiene clave de usuario o contraseña de red?',
                  '🚪 ¿En qué horario se encuentra abierto el ambiente para acceder?',
                  '📍 ¿En qué fila o sector específico del aula está el computador?',
                  '🔌 ¿El equipo enciende alguna luz o pita al presionar el botón?',
                  '🔄 ¿El problema comenzó tras alguna actualización o corte de energía?',
                ].map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setQuickMessage(question)}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-[11px] font-medium shadow-2xs transition-all cursor-pointer"
                  >
                    {question.length > 38 ? `${question.slice(0, 38)}...` : question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              rows={2}
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              placeholder={
                sendMode === 'note'
                  ? 'Escribe un avance técnico rápido (ej: "Reemplazado cable VGA, en pruebas de pantalla")...'
                  : 'Escribe tu solicitud al funcionario (ej: "¿Te encuentras en la oficina para acceder al equipo?")...'
              }
              className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 outline-none resize-none bg-white"
            />
            <button
              type="submit"
              disabled={!quickMessage.trim() || isSubmitting}
              className={`px-4 rounded-xl text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shrink-0 ${
                sendMode === 'note'
                  ? 'bg-azul-sena hover:bg-blue-800'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <span className="material-symbols-outlined !text-[18px]">send</span>
              <span className="text-[10px]">{isSubmitting ? '...' : 'Enviar'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
