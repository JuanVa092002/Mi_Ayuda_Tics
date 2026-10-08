import type { Solicitud } from '@/shared/types'
import { parseEnrichedDescription } from '@/shared/utils/ticketContext'

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

/** Oldest dated case first. Undated rows stay after dated ones, in their original order. */
export function sortSolicitudesOldest(items: Solicitud[]): Solicitud[] {
  return [...items].sort((a, b) => {
    const left = parseSolicitudDate(a.fecha)
    const right = parseSolicitudDate(b.fecha)
    if (!left && !right) return 0
    if (!left) return 1
    if (!right) return -1
    return left - right
  })
}

/** Lower rank = dispatch first: clase en vivo, atención al público, then standard queue by oldest fecha. */
export function leaderDispatchRank(descripcion?: string): number {
  const ctx = parseEnrichedDescription(descripcion || '')
  if (ctx.modoExpress) return 0
  if (ctx.impactoServicio === 'atencion_publico') return 1
  return 2
}

export function sortLeaderDispatch(items: Solicitud[]): Solicitud[] {
  return [...items].sort((a, b) => {
    const rankDiff = leaderDispatchRank(a.descripcion) - leaderDispatchRank(b.descripcion)
    if (rankDiff !== 0) return rankDiff

    const left = parseSolicitudDate(a.fecha)
    const right = parseSolicitudDate(b.fecha)
    if (!left && !right) return 0
    if (!left) return 1
    if (!right) return -1
    return left - right
  })
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

export type LeaderOpsSituation =
  | 'por_iniciar'
  | 'en_atencion'
  | 'esperando_funcionario'
  | 'esperando_confirmacion'
  | 'terminados'

export type LeaderOpsFilter = LeaderOpsSituation | 'operacion'

const OPS_QUEUES = new Set<LeaderOpsSituation>([
  'por_iniciar',
  'en_atencion',
  'esperando_funcionario',
  'esperando_confirmacion',
  'terminados',
])

export function leaderOpsSituation(
  solicitud: Pick<Solicitud, 'queue' | 'estado' | 'workflowVersion'>,
): LeaderOpsSituation {
  if (solicitud.queue && OPS_QUEUES.has(solicitud.queue as LeaderOpsSituation)) {
    return solicitud.queue as LeaderOpsSituation
  }
  if (solicitud.estado === 'asignado' && solicitud.workflowVersion === 2) return 'por_iniciar'
  if (solicitud.estado === 'esperando_usuario') return 'esperando_funcionario'
  if (solicitud.estado === 'resuelto') return 'esperando_confirmacion'
  if (
    solicitud.estado === 'asignado' ||
    solicitud.estado === 'en_progreso' ||
    solicitud.estado === 'pendiente'
  ) {
    return 'en_atencion'
  }
  return 'terminados'
}

export function leaderCaseNarrative(descripcion?: string): string {
  const parsed = parseEnrichedDescription(descripcion || '')
  return parsed.rawDescription || descripcion || 'Sin descripción'
}

export function leaderUrgencyMarks(descripcion?: string): Array<'clase_en_vivo' | 'atencion_publico'> {
  const parsed = parseEnrichedDescription(descripcion || '')
  const marks: Array<'clase_en_vivo' | 'atencion_publico'> = []
  if (parsed.modoExpress) marks.push('clase_en_vivo')
  if (parsed.impactoServicio === 'atencion_publico') marks.push('atencion_publico')
  return marks
}

export function leaderFacingStatusLabel(
  solicitud: Pick<Solicitud, 'queue' | 'estado' | 'workflowVersion' | 'displayStatus'>,
): string {
  switch (leaderOpsSituation(solicitud)) {
    case 'por_iniciar':
      return 'Por iniciar'
    case 'en_atencion':
      return 'En atención'
    case 'esperando_funcionario':
      return 'Espera funcionario'
    case 'esperando_confirmacion':
      return 'Espera confirmación'
    case 'terminados':
      return solicitud.estado === 'cancelado' ? 'Cancelada' : 'Cerrado'
  }
}

export function tecnicoDisplayName(solicitud: Pick<Solicitud, 'tecnico'>): string {
  if (typeof solicitud.tecnico === 'object' && solicitud.tecnico?.nombre) return solicitud.tecnico.nombre
  return 'El técnico'
}

export function leaderResponsibilityLine(
  solicitud: Pick<Solicitud, 'queue' | 'estado' | 'workflowVersion' | 'tecnico'>,
): string {
  const name = tecnicoDisplayName(solicitud)
  switch (leaderOpsSituation(solicitud)) {
    case 'por_iniciar':
      return `${name} aún no inicia`
    case 'en_atencion':
      return `En atención con ${name}`
    case 'esperando_funcionario':
      return 'Espera respuesta del funcionario'
    case 'esperando_confirmacion':
      return 'Espera confirmación del funcionario'
    case 'terminados':
      return 'Caso cerrado'
  }
}

export function leaderReassignIsPrimary(
  solicitud: Pick<Solicitud, 'queue' | 'estado' | 'workflowVersion' | 'capabilities'>,
): boolean {
  const situation = leaderOpsSituation(solicitud)
  if (situation !== 'por_iniciar' && situation !== 'en_atencion') return false
  return canLeaderReassign(solicitud)
}

export function reassignConsequence(
  solicitud: Pick<Solicitud, 'queue' | 'estado' | 'workflowVersion'>,
): string {
  const situation = leaderOpsSituation(solicitud)
  if (situation === 'en_atencion' || solicitud.estado === 'en_progreso') {
    return 'El caso volverá a por iniciar. El técnico nuevo debe comenzar la atención.'
  }
  if (situation === 'esperando_funcionario' || solicitud.estado === 'esperando_usuario') {
    return 'El caso sigue esperando al funcionario, ahora con el técnico nuevo.'
  }
  return 'El caso queda por iniciar con el técnico nuevo.'
}

export function filterLeaderOps(items: Solicitud[], filter: LeaderOpsFilter): Solicitud[] {
  if (filter === 'operacion') {
    return items.filter((item) => leaderOpsSituation(item) !== 'terminados')
  }
  return items.filter((item) => leaderOpsSituation(item) === filter)
}

export function countLeaderOps(items: Solicitud[]): Record<LeaderOpsSituation, number> {
  const counts: Record<LeaderOpsSituation, number> = {
    por_iniciar: 0,
    en_atencion: 0,
    esperando_funcionario: 0,
    esperando_confirmacion: 0,
    terminados: 0,
  }
  for (const item of items) counts[leaderOpsSituation(item)] += 1
  return counts
}

export function tecnicoActiveLoad(items: Solicitud[], tecnicoId: string): number {
  return items.filter((item) => {
    if (leaderOpsSituation(item) === 'terminados') return false
    const id = typeof item.tecnico === 'object' ? item.tecnico?._id : item.tecnico
    return id === tecnicoId
  }).length
}
