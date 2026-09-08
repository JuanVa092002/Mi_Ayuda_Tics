import type { Solicitud } from '@/shared/types'

export type LeaderHistoryFilter = 'all' | 'activos' | 'cerrados'

const ACTIVE_STATES = new Set([
  'asignado',
  'pendiente',
  'en_progreso',
  'esperando_usuario',
  'resuelto',
])

const CLOSED_STATES = new Set(['cerrado', 'finalizado', 'cancelado'])

export function parseSolicitudDate(raw?: string): number {
  if (!raw) return 0
  const iso = Date.parse(raw)
  if (!Number.isNaN(iso)) return iso
  const match = raw.trim().match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (!match) return 0
  return new Date(
    Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1]),
    Number(match[4] ?? '0'),
    Number(match[5] ?? '0'),
    Number(match[6] ?? '0'),
  ).getTime()
}

export function sortSolicitudesNewest(items: Solicitud[]): Solicitud[] {
  return [...items].sort((a, b) => parseSolicitudDate(b.fecha) - parseSolicitudDate(a.fecha))
}

export function canLeaderAssign(solicitud: Pick<Solicitud, 'estado' | 'capabilities'>): boolean {
  if (solicitud.capabilities?.canAssign === true) return true
  if (solicitud.capabilities?.canAssign === false) return false
  return solicitud.estado === 'nuevo' || solicitud.estado === 'solicitado'
}

export function canLeaderReassign(
  solicitud: Pick<Solicitud, 'estado' | 'capabilities'>,
): boolean {
  if (solicitud.capabilities?.canReassign === true) return true
  if (solicitud.capabilities?.canReassign === false) return false
  return ['asignado', 'en_progreso', 'esperando_usuario'].includes(solicitud.estado)
}

export function canLeaderCancel(
  solicitud: Pick<Solicitud, 'estado' | 'capabilities' | 'workflowVersion'>,
): boolean {
  if (solicitud.capabilities?.canCancel === true) return true
  if (solicitud.capabilities?.canCancel === false) return false
  if (solicitud.workflowVersion !== 2) return false
  return solicitud.estado === 'nuevo' || solicitud.estado === 'asignado'
}

export function solutionPreview(solicitud: Solicitud): string {
  if (typeof solicitud.solucion === 'object' && solicitud.solucion?.descripcionSolucion) {
    return solicitud.solucion.descripcionSolucion
  }
  if (solicitud.headline) return solicitud.headline
  if (solicitud.displayStatus) return solicitud.displayStatus
  return 'Sin solución registrada'
}

export function filterLeaderHistory(items: Solicitud[], filter: LeaderHistoryFilter): Solicitud[] {
  if (filter === 'activos') return items.filter((item) => ACTIVE_STATES.has(item.estado))
  if (filter === 'cerrados') return items.filter((item) => CLOSED_STATES.has(item.estado))
  return items
}

export function unwrapWorkflowSolicitud(data: unknown): Solicitud {
  if (data && typeof data === 'object' && 'solicitud' in data) {
    const wrapped = (data as { solicitud?: Solicitud }).solicitud
    if (wrapped && typeof wrapped === 'object' && '_id' in wrapped) return wrapped
  }
  return data as Solicitud
}

export function workflowLabel(version?: number): string {
  return version === 2 ? 'v2' : 'v1'
}

export type LeaderStatusTone = 'inbox' | 'assigned' | 'progress' | 'done' | 'cancelled' | 'other'

export function leaderStatusTone(estado: string): LeaderStatusTone {
  if (estado === 'nuevo' || estado === 'solicitado') return 'inbox'
  if (estado === 'asignado') return 'assigned'
  if (estado === 'pendiente' || estado === 'en_progreso' || estado === 'esperando_usuario') return 'progress'
  if (estado === 'cancelado') return 'cancelled'
  if (estado === 'finalizado' || estado === 'resuelto' || estado === 'cerrado') return 'done'
  return 'other'
}

export function formatSolicitudFecha(raw?: string): string {
  const ms = parseSolicitudDate(raw)
  if (!ms) return raw || '—'
  return new Date(ms).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

export function validateRequiredMotivo(motivo: string): string | null {
  if (motivo.trim().length < 3) return 'El motivo es obligatorio (mínimo 3 caracteres).'
  return null
}
