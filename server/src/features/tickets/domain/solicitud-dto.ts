import { extractEntityId } from '../../../shared/utils/entity-id'
import {
  getTechnicianQueue,
  type SolicitudActor,
} from './solicitud-lifecycle'
import { attachLifecycleFields } from './solicitud-workflow'

const LIST_STRIP_KEYS = [
  'historial',
  'historyNote',
  'event',
  'events',
  'historialNextCursor',
] as const

function stripHistorialFields(plain: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...plain }
  for (const key of LIST_STRIP_KEYS) {
    delete copy[key]
  }
  return copy
}

function summarizedTecnico(value: unknown): { _id?: string; nombre?: string } | string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const record = value as { _id?: unknown; nombre?: unknown }
    const id = extractEntityId(record._id ?? record)
    const nombre = typeof record.nombre === 'string' ? record.nombre : undefined
    if (!id && !nombre) return undefined
    return { ...(id ? { _id: id } : {}), ...(nombre ? { nombre } : {}) }
  }
  return undefined
}

/**
 * List/card projection. Additive lifecycle fields stay; event history never serializes.
 * Existing list keys (descripcion, fecha, foto, usuario, ambiente, telefono, solucion)
 * remain so current web/mobile list contracts keep working.
 */
export function toSolicitudListItem(
  plain: Record<string, unknown>,
  actor?: SolicitudActor,
): Record<string, unknown> {
  const attached = attachLifecycleFields(plain, actor)
  const stripped = stripHistorialFields(attached as Record<string, unknown>)
  const estado = String(stripped.estado ?? '')
  const workflowVersion = stripped.workflowVersion as number | undefined
  return {
    ...stripped,
    tecnico: summarizedTecnico(stripped.tecnico) ?? stripped.tecnico,
    queue: getTechnicianQueue({ estado, workflowVersion }),
  }
}

export function listItemHasHistorial(item: Record<string, unknown>): boolean {
  return (
    Object.prototype.hasOwnProperty.call(item, 'historial') ||
    Object.prototype.hasOwnProperty.call(item, 'events') ||
    Object.prototype.hasOwnProperty.call(item, 'event')
  )
}

export function toSolicitudDetail(
  plain: Record<string, unknown>,
  actor?: SolicitudActor,
  extras?: { historial?: unknown[]; historyNote?: string; historialNextCursor?: string },
): Record<string, unknown> {
  const attached = attachLifecycleFields(plain, actor, {
    historial: extras?.historial,
    historyNote: extras?.historyNote,
  }) as Record<string, unknown>
  if (extras?.historialNextCursor) {
    attached.historialNextCursor = extras.historialNextCursor
  }
  const estado = String(attached.estado ?? '')
  const workflowVersion = attached.workflowVersion as number | undefined
  attached.queue = getTechnicianQueue({ estado, workflowVersion })
  return attached
}
