import { createHash } from 'node:crypto'
import { entityIdsEqual } from '../../../shared/utils/entity-id'
import type { SolicitudActor, SolicitudWorkflowAction } from './solicitud-lifecycle'

export type IdempotentPayload = {
  tecnicoId?: string
  motivo?: string
  mensaje?: string
  queSeHizo?: string
  queFalta?: string
  siguienteAccion?: string
  fechaEsperada?: string
  causaIdentificada?: string
  attachmentId?: unknown
}

export type StoredIdempotencyRecord = {
  author?: unknown
  actionType?: string
  payloadHash?: string
}

export const IDEMPOTENCY_KEY_REQUIRED = 'IDEMPOTENCY_KEY_REQUIRED' as const

const IDEMPOTENCY_CONFLICT = {
  status: 409,
  message: 'La clave de idempotencia no puede reutilizarse.',
} as const

/** Primary convention: HTTP header Idempotency-Key. Body operationId is the same value if the header is absent. */
export function isValidClientOperationId(value: string | undefined): value is string {
  const trimmed = value?.trim() ?? ''
  return trimmed.length >= 8 && trimmed.length <= 80
}

export function requireClientOperationId(value: string | undefined): string {
  if (!isValidClientOperationId(value)) {
    throw {
      status: 400,
      code: IDEMPOTENCY_KEY_REQUIRED,
      message: 'La acción requiere Idempotency-Key.',
    }
  }
  return value.trim().slice(0, 80)
}

/**
 * Unique index `{ solicitud, operationId }` (sparse) is created only by
 * `migrate:historial-operation-id`, never by schema autoIndex.
 * Actor, actionType and payloadHash are compared in application code so a reused
 * key cannot leak another actor's result or replay a different action/payload.
 */
export function workflowPayloadHash(
  action: SolicitudWorkflowAction,
  payload: IdempotentPayload,
): string {
  const body = {
    action,
    tecnicoId: payload.tecnicoId?.trim() || '',
    motivo: payload.motivo?.trim() || '',
    mensaje: payload.mensaje?.trim() || '',
    queSeHizo: payload.queSeHizo?.trim() || '',
    queFalta: payload.queFalta?.trim() || '',
    siguienteAccion: payload.siguienteAccion?.trim() || '',
    fechaEsperada: payload.fechaEsperada?.trim() || '',
    causaIdentificada: payload.causaIdentificada?.trim() || '',
    attachmentId: payload.attachmentId ? String(payload.attachmentId) : '',
  }
  return createHash('sha256').update(JSON.stringify(body)).digest('hex')
}

export function assertIdempotentReplayAllowed(params: {
  stored: StoredIdempotencyRecord
  actor: SolicitudActor
  action: SolicitudWorkflowAction
  payloadHash: string
}): typeof IDEMPOTENCY_CONFLICT | null {
  const sameActor = entityIdsEqual(params.stored.author, params.actor.id)
  const sameAction = params.stored.actionType === params.action
  const samePayload = params.stored.payloadHash === params.payloadHash
  if (sameActor && sameAction && samePayload) return null
  return IDEMPOTENCY_CONFLICT
}
