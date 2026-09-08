import { getSolicitudDetalle } from '@/features/tickets/api/workflow.service'
import { getApiErrorMessage } from '@/shared/api/apiError'
import type { Solicitud, SolicitudHistorialEvent } from '@/shared/types'
import { useEffect, useState } from 'react'
import { workflowLabel } from '../leader-inbox'

type LeaderTicketDrawerProps = {
  solicitudId: string
  onClose: () => void
}

export default function LeaderTicketDrawer({ solicitudId, onClose }: LeaderTicketDrawerProps) {
  const [detalle, setDetalle] = useState<Solicitud | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void getSolicitudDetalle(solicitudId)
      .then((data) => {
        if (!cancelled) setDetalle(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [solicitudId])

  const events: SolicitudHistorialEvent[] = detalle?.historial ?? []

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[120] flex justify-end" role="presentation" onClick={onClose}>
      <aside
        className="bg-white w-full max-w-lg h-full overflow-auto p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leader-ticket-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Historial del caso</p>
            <h2 id="leader-ticket-title" className="text-xl font-bold text-on-surface">
              {detalle?.codigoCaso || 'Caso'}
            </h2>
          </div>
          <button type="button" aria-label="Cerrar historial" className="w-10 h-10 rounded-full hover:bg-slate-100" onClick={onClose}>
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {loading ? (
          <p className="text-sm font-semibold text-slate-400">Cargando historial…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-red-600">{error}</p>
        ) : detalle ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100">
                {workflowLabel(detalle.workflowVersion)}
              </span>
              <span className="text-sm font-semibold">{detalle.displayStatus || detalle.estado}</span>
            </div>
            <p className="text-sm text-slate-600">{detalle.descripcion}</p>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Eventos</h3>
              {events.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {detalle.historyNote || 'Este caso no tiene línea de tiempo v2. Los tickets del flujo anterior no registran eventos.'}
                </p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {events.map((event, index) => (
                    <li key={event._id || `${event.type}-${index}`} className="border-l-2 border-slate-200 pl-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{event.type}</p>
                      <p className="text-sm font-medium text-on-surface">{event.message}</p>
                      <p className="text-[11px] text-slate-400">
                        {event.author?.nombre ? `${event.author.nombre} · ` : ''}
                        {event.createdAt ? new Date(event.createdAt).toLocaleString('es-CO') : ''}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}
