import mongoose, { Types, type ClientSession } from 'mongoose'
import HistorialSolicitud, {
  type HistorialEventType,
  type IHistorialSolicitud,
} from '../models/historialSolicitud'
import Solicitud, { type ISolicitud } from '../models/solicitud'
import { entityIdsEqual, extractEntityId } from '../../../shared/utils/entity-id'
import { logError } from '../../../shared/utils/logger'
import { isDuplicateKeyError } from '../../../shared/utils/mongo-duplicate'
import {
  EVENT_MESSAGES,
  LEGACY_HISTORY_NOTE,
  WORKFLOW_V2,
  canTransitionSolicitud,
  eventTypeForAction,
  getSolicitudCapabilities,
  getSolicitudDisplayStatus,
  getWorkflowVersion,
  isLegacyWorkflow,
  nextPersistedEstado,
  sanitizePublicMotivo,
  type PersistedSolicitudEstado,
  type SolicitudActor,
  type SolicitudWorkflowAction,
} from './solicitud-lifecycle'
import {
  getWorkflowAtomicityStrategy,
  type WorkflowAtomicityStrategy,
} from './workflow-atomicity'
import { assertWorkflowV2RuntimeReady } from './workflow-runtime'
import {
  assertIdempotentReplayAllowed,
  requireClientOperationId,
  workflowPayloadHash,
} from './workflow-idempotency'

export type WorkflowActionPayload = {
  operationId?: string
  tecnicoId?: string
  tecnicoNombre?: string
  motivo?: string
  mensaje?: string
  queSeHizo?: string
  queFalta?: string
  siguienteAccion?: string
  fechaEsperada?: string
  causaIdentificada?: string
  attachmentId?: Types.ObjectId
}

export type WorkflowHttpError = {
  status: number
  message: string
  code?: string
}

export type WorkflowResult = {
  solicitud: ISolicitud & { _id: Types.ObjectId }
  event: IHistorialSolicitud | null
  idempotent: boolean
}

export type PublicHistorialPage = {
  items: Record<string, unknown>[]
  nextCursor?: string
}

function asError(status: number, message: string, code?: string): WorkflowHttpError {
  return code ? { status, message, code } : { status, message }
}

export function isWorkflowHttpError(value: unknown): value is WorkflowHttpError {
  return Boolean(value && typeof value === 'object' && 'status' in value && 'message' in value)
}

function lifecycleInput(solicitud: ISolicitud) {
  return {
    estado: solicitud.estado,
    workflowVersion: solicitud.workflowVersion,
    usuario: extractEntityId(solicitud.usuario),
    tecnico: extractEntityId(solicitud.tecnico),
  }
}

function publicEventMessage(
  type: HistorialEventType,
  payload: WorkflowActionPayload,
): string {
  if (type === 'reassigned') {
    const name = payload.tecnicoNombre?.trim() || 'un técnico'
    const motivo = payload.motivo?.trim() ? sanitizePublicMotivo(payload.motivo) : ''
    return motivo
      ? `La solicitud fue reasignada a ${name}. Motivo: ${motivo}.`
      : `La solicitud fue reasignada a ${name}.`
  }
  if (type === 'updated' && payload.mensaje?.trim()) return payload.mensaje.trim()
  if (type === 'waiting_for_requester' && payload.mensaje?.trim()) return payload.mensaje.trim()
  if (type === 'cancelled' && payload.motivo?.trim()) {
    return `La solicitud fue cancelada. Motivo: ${sanitizePublicMotivo(payload.motivo)}.`
  }
  if (type === 'reopened' && payload.motivo?.trim()) {
    return `El funcionario indicó que el problema continúa. Motivo: ${sanitizePublicMotivo(payload.motivo)}.`
  }
  if (type === 'partial_solution' && payload.queSeHizo?.trim()) {
    return payload.queSeHizo.trim()
  }
  if (type === 'resolved' && payload.queSeHizo?.trim()) {
    return payload.queSeHizo.trim()
  }
  return EVENT_MESSAGES[type]
}

function validatePayload(
  action: SolicitudWorkflowAction,
  payload: WorkflowActionPayload,
): WorkflowHttpError | null {
  switch (action) {
    case 'assign':
    case 'reassign':
      if (!payload.tecnicoId || !Types.ObjectId.isValid(payload.tecnicoId)) {
        return asError(422, 'El técnico es obligatorio.')
      }
      if (action === 'reassign' && !payload.motivo?.trim()) {
        return asError(422, 'El motivo de reasignación es obligatorio.')
      }
      return null
    case 'update':
    case 'wait_for_requester':
    case 'requester_reply':
      if (!payload.mensaje?.trim()) {
        return asError(422, 'El mensaje es obligatorio.')
      }
      return null
    case 'partial_solution':
      if (!payload.queSeHizo?.trim() || !payload.queFalta?.trim() || !payload.siguienteAccion?.trim()) {
        return asError(422, 'La solución parcial requiere qué se hizo, qué falta y la siguiente acción.')
      }
      return null
    case 'resolve':
      if (!payload.queSeHizo?.trim()) {
        return asError(422, 'La solución total requiere describir qué se hizo.')
      }
      return null
    case 'reopen':
    case 'cancel':
      if (!payload.motivo?.trim()) {
        return asError(422, 'El motivo es obligatorio.')
      }
      return null
    default:
      return null
  }
}

function buildUpdates(
  action: SolicitudWorkflowAction,
  current: ISolicitud,
  nextEstado: PersistedSolicitudEstado,
  payload: WorkflowActionPayload,
): { set: Record<string, unknown>; unset: Record<string, 1> } {
  const now = new Date()
  const set: Record<string, unknown> = { estado: nextEstado }
  const unset: Record<string, 1> = {}

  if (action === 'assign' || action === 'reassign') {
    set.tecnico = payload.tecnicoId
  }
  if (action === 'partial_solution' || action === 'update' || action === 'wait_for_requester') {
    set.proximaAccion = payload.siguienteAccion?.trim() || payload.mensaje?.trim()
    if (payload.fechaEsperada) {
      set.proximaAccionAt = new Date(payload.fechaEsperada)
    }
  }
  if (action === 'requester_reply' || action === 'start' || action === 'resolve' || action === 'cancel') {
    unset.proximaAccion = 1
    unset.proximaAccionAt = 1
  }
  if (action === 'resolve') {
    set.resolvedAt = now
  }
  if (action === 'confirm') {
    set.closedAt = now
  }
  if (action === 'reopen') {
    unset.resolvedAt = 1
  }
  if (action === 'cancel') {
    set.cancelledAt = now
    set.cancelReason = payload.motivo?.trim()
  }
  void current
  return { set, unset }
}

function resolveOperationId(payload: WorkflowActionPayload): string {
  return requireClientOperationId(payload.operationId)
}

function buildEventDoc(params: {
  solicitudId: Types.ObjectId
  action: SolicitudWorkflowAction
  actor: SolicitudActor
  currentEstado: PersistedSolicitudEstado
  nextEstado: PersistedSolicitudEstado
  payload: WorkflowActionPayload
  operationId: string
  previousTechnicianId?: string
}) {
  const eventType = eventTypeForAction(params.action)
  return {
    solicitud: params.solicitudId,
    type: eventType,
    author: params.actor.id,
    message: publicEventMessage(eventType, params.payload),
    operationId: params.operationId,
    actionType: params.action,
    payloadHash: workflowPayloadHash(params.action, params.payload),
    metadata: {
      previousStatus: params.currentEstado,
      nextStatus: params.nextEstado,
      assignedTechnicianId:
        params.action === 'assign' || params.action === 'reassign' ? params.payload.tecnicoId : undefined,
      previousTechnicianId: params.previousTechnicianId,
      resolutionType:
        params.action === 'partial_solution'
          ? 'partial'
          : params.action === 'resolve'
            ? 'total'
            : undefined,
      nextAction: params.payload.siguienteAccion?.trim(),
      nextActionAt: params.payload.fechaEsperada ? new Date(params.payload.fechaEsperada) : undefined,
      pendingWork: params.payload.queFalta?.trim(),
      whatWasDone: params.payload.queSeHizo?.trim(),
      reason: params.payload.motivo?.trim()
        ? sanitizePublicMotivo(params.payload.motivo)
        : undefined,
      identifiedCause: params.payload.causaIdentificada?.trim(),
    },
    attachment: params.payload.attachmentId,
  }
}

async function findEventByOperationId(
  solicitudId: Types.ObjectId,
  operationId: string,
  session?: ClientSession | null,
): Promise<IHistorialSolicitud | null> {
  const query = HistorialSolicitud.findOne({ solicitud: solicitudId, operationId })
  if (session) query.session(session)
  return query
}

function currentRevisionOf(solicitud: ISolicitud): number {
  const value = solicitud.workflowRevision
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function revisionFilter(currentRevision: number): Record<string, unknown> {
  if (currentRevision > 0) return { workflowRevision: currentRevision }
  return {
    $or: [{ workflowRevision: { $exists: false } }, { workflowRevision: 0 }, { workflowRevision: null }],
  }
}

async function loadTicket(
  solicitudId: Types.ObjectId,
  session?: ClientSession | null,
): Promise<(ISolicitud & { _id: Types.ObjectId }) | null> {
  const query = Solicitud.findById(solicitudId)
  if (session) query.session(session)
  return query
}

async function applyConditionalUpdate(
  solicitudId: Types.ObjectId,
  currentEstado: PersistedSolicitudEstado,
  currentRevision: number,
  operationId: string,
  set: Record<string, unknown>,
  unset: Record<string, 1>,
  session?: ClientSession | null,
) {
  const update: Record<string, unknown> = {
    $set: { ...set, lastWorkflowOperationId: operationId },
    $inc: { workflowRevision: 1 },
  }
  if (Object.keys(unset).length > 0) update.$unset = unset
  const options: Record<string, unknown> = { new: true, runValidators: true }
  if (session) options.session = session
  return Solicitud.findOneAndUpdate(
    {
      _id: solicitudId,
      estado: currentEstado,
      workflowVersion: WORKFLOW_V2,
      ...revisionFilter(currentRevision),
    },
    update,
    options,
  )
}

async function insertHistorialEvent(
  doc: Record<string, unknown>,
  session?: ClientSession | null,
): Promise<IHistorialSolicitud> {
  if (session) {
    const created = await HistorialSolicitud.create([doc], { session })
    return created[0]
  }
  return HistorialSolicitud.create(doc)
}

async function compensateTicketIfEventMissing(params: {
  solicitudId: Types.ObjectId
  appliedEstado: PersistedSolicitudEstado
  rollbackEstado: PersistedSolicitudEstado
  appliedRevision: number
  rollbackRevision: number
  operationId: string
}): Promise<'rolled_back' | 'skipped_later_mutation' | 'event_exists'> {
  const event = await findEventByOperationId(params.solicitudId, params.operationId)
  if (event) return 'event_exists'

  const rolledBack = await Solicitud.findOneAndUpdate(
    {
      _id: params.solicitudId,
      estado: params.appliedEstado,
      workflowVersion: WORKFLOW_V2,
      workflowRevision: params.appliedRevision,
      lastWorkflowOperationId: params.operationId,
    },
    {
      $set: { estado: params.rollbackEstado, workflowRevision: params.rollbackRevision },
      $unset: { lastWorkflowOperationId: 1 },
    },
    { new: true },
  )

  if (rolledBack) return 'rolled_back'

  logError('workflow_v2_event_insert_inconsistent', undefined, {
    solicitudId: String(params.solicitudId),
    operationId: params.operationId,
    appliedRevision: params.appliedRevision,
  })
  return 'skipped_later_mutation'
}

async function returnExistingOperation(params: {
  solicitudId: Types.ObjectId
  operationId: string
  actor: SolicitudActor
  action: SolicitudWorkflowAction
  payloadHash: string
  session?: ClientSession | null
  fallback?: ISolicitud & { _id: Types.ObjectId }
}): Promise<WorkflowResult | null> {
  const event = await findEventByOperationId(params.solicitudId, params.operationId, params.session)
  if (!event) return null
  const conflict = assertIdempotentReplayAllowed({
    stored: {
      author: event.author,
      actionType: event.actionType,
      payloadHash: event.payloadHash,
    },
    actor: params.actor,
    action: params.action,
    payloadHash: params.payloadHash,
  })
  if (conflict) throw asError(conflict.status, conflict.message)
  const ticket = (await loadTicket(params.solicitudId, params.session)) ?? params.fallback
  if (!ticket) return null
  return { solicitud: ticket, event, idempotent: true }
}

export async function applySolicitudWorkflowAction(params: {
  solicitud: ISolicitud & { _id: Types.ObjectId }
  action: SolicitudWorkflowAction
  actor: SolicitudActor
  payload?: WorkflowActionPayload
  atomicity?: WorkflowAtomicityStrategy
}): Promise<WorkflowResult> {
  const { action, actor } = params
  const payload = { ...(params.payload ?? {}) }
  const solicitud = params.solicitud
  const operationId = resolveOperationId(payload)
  payload.operationId = operationId
  const payloadHash = workflowPayloadHash(action, payload)
  const replayLookup = {
    solicitudId: solicitud._id,
    operationId,
    actor,
    action,
    payloadHash,
    fallback: solicitud,
  }

  if (isLegacyWorkflow(solicitud)) {
    throw asError(409, 'Esta solicitud usa el flujo anterior y no admite esta acción.')
  }

  const payloadError = validatePayload(action, payload)
  if (payloadError) throw payloadError

  const existing = await returnExistingOperation(replayLookup)
  if (existing) return existing

  const allowed = canTransitionSolicitud(lifecycleInput(solicitud), action, actor)
  if (!allowed.ok) {
    throw asError(allowed.status, allowed.message)
  }

  if (actor.rol === 'tecnico' && !entityIdsEqual(solicitud.tecnico, actor.id)) {
    throw asError(403, 'Solo el técnico asignado puede realizar esta acción.')
  }
  if (actor.rol === 'funcionario' && !entityIdsEqual(solicitud.usuario, actor.id)) {
    throw asError(403, 'Solo el funcionario titular puede realizar esta acción.')
  }

  const currentEstado = solicitud.estado as PersistedSolicitudEstado
  const nextEstado = nextPersistedEstado(action, currentEstado)
  if (!nextEstado) {
    throw asError(409, 'Transición de estado no permitida.')
  }

  if (action === 'reassign' && entityIdsEqual(solicitud.tecnico, payload.tecnicoId)) {
    throw asError(409, 'Selecciona un técnico distinto para reasignar.')
  }

  const currentRevision = currentRevisionOf(solicitud)
  const appliedRevision = currentRevision + 1
  const { set, unset } = buildUpdates(action, solicitud, nextEstado, payload)
  const eventDoc = buildEventDoc({
    solicitudId: solicitud._id,
    action,
    actor,
    currentEstado,
    nextEstado,
    payload,
    operationId,
    previousTechnicianId: action === 'reassign' ? extractEntityId(solicitud.tecnico) : undefined,
  })

  const strategy = params.atomicity ?? getWorkflowAtomicityStrategy()
  if (strategy === 'transactions' && !params.atomicity) {
    await assertWorkflowV2RuntimeReady()
  }

  const afterFailedUpdate = async (): Promise<WorkflowResult> => {
    const raced = await returnExistingOperation(replayLookup)
    if (raced) return raced
    throw asError(409, 'El estado de la solicitud cambió. Reintenta la acción.')
  }

  const afterFailedInsert = async (
    updated: ISolicitud & { _id: Types.ObjectId },
    error: unknown,
  ): Promise<WorkflowResult> => {
    if (isDuplicateKeyError(error, 'operationId')) {
      const replayDup = await returnExistingOperation({ ...replayLookup, fallback: updated })
      if (replayDup) return replayDup
    }
    const compensation = await compensateTicketIfEventMissing({
      solicitudId: solicitud._id,
      appliedEstado: nextEstado,
      rollbackEstado: currentEstado,
      appliedRevision,
      rollbackRevision: currentRevision,
      operationId,
    })
    if (compensation === 'event_exists') {
      const replayDup = await returnExistingOperation({ ...replayLookup, fallback: updated })
      if (replayDup) return replayDup
    }
    if (compensation === 'skipped_later_mutation') {
      throw asError(409, 'La operación no quedó confirmada porque el ticket cambió después.')
    }
    throw error
  }

  if (strategy === 'transactions') {
    const session = await mongoose.startSession()
    try {
      session.startTransaction()
      const replay = await returnExistingOperation({ ...replayLookup, session })
      if (replay) {
        await session.abortTransaction()
        return replay
      }

      const updated = await applyConditionalUpdate(
        solicitud._id,
        currentEstado,
        currentRevision,
        operationId,
        set,
        unset,
        session,
      )
      if (!updated) {
        await session.abortTransaction()
        return afterFailedUpdate()
      }

      try {
        const event = await insertHistorialEvent(eventDoc, session)
        if (!event) {
          await session.abortTransaction()
          throw asError(500, 'La operación no quedó confirmada.')
        }
        await session.commitTransaction()
        return { solicitud: updated, event, idempotent: false }
      } catch (error) {
        await session.abortTransaction()
        if (isWorkflowHttpError(error)) throw error
        if (isDuplicateKeyError(error, 'operationId')) {
          const replayDup = await returnExistingOperation(replayLookup)
          if (replayDup) return replayDup
        }
        throw error
      }
    } finally {
      await session.endSession()
    }
  }

  const updated = await applyConditionalUpdate(
    solicitud._id,
    currentEstado,
    currentRevision,
    operationId,
    set,
    unset,
  )
  if (!updated) {
    return afterFailedUpdate()
  }

  try {
    const event = await insertHistorialEvent(eventDoc)
    if (!event) {
      await compensateTicketIfEventMissing({
        solicitudId: solicitud._id,
        appliedEstado: nextEstado,
        rollbackEstado: currentEstado,
        appliedRevision,
        rollbackRevision: currentRevision,
        operationId,
      })
      throw asError(500, 'La operación no quedó confirmada.')
    }
    return { solicitud: updated, event, idempotent: false }
  } catch (error) {
    if (isWorkflowHttpError(error)) throw error
    return afterFailedInsert(updated, error)
  }
}

export async function recordCreatedEvent(
  solicitudId: Types.ObjectId,
  actorId: string,
): Promise<void> {
  try {
    await HistorialSolicitud.create({
      solicitud: solicitudId,
      type: 'created',
      author: actorId,
      message: EVENT_MESSAGES.created,
      operationId: `created:${String(solicitudId)}`,
      metadata: {
        previousStatus: undefined,
        nextStatus: 'nuevo',
      },
    })
  } catch (error) {
    if (isDuplicateKeyError(error, 'operationId')) return
    throw error
  }
}

function toPublicHistorialEvent(event: IHistorialSolicitud & { toObject?: () => Record<string, unknown> }) {
  const plain = (event.toObject?.() ?? event) as Record<string, unknown> & {
    metadata?: {
      nextAction?: string
      nextActionAt?: Date
      resolutionType?: string
    }
    author?: { nombre?: string } | Types.ObjectId
    attachment?: { _id?: unknown; url?: string; filename?: string } | Types.ObjectId
  }
  const author =
    plain.author && typeof plain.author === 'object' && 'nombre' in plain.author
      ? { nombre: (plain.author as { nombre?: string }).nombre }
      : undefined
  const attachment =
    plain.attachment && typeof plain.attachment === 'object' && 'url' in plain.attachment
      ? {
          _id: (plain.attachment as { _id?: unknown })._id,
          url: (plain.attachment as { url?: string }).url,
          filename: (plain.attachment as { filename?: string }).filename,
        }
      : undefined

  return {
    _id: plain._id,
    type: plain.type,
    message: plain.message,
    createdAt: plain.createdAt,
    author,
    ...(attachment ? { attachment } : {}),
    metadata: {
      nextAction: plain.metadata?.nextAction,
      nextActionAt: plain.metadata?.nextActionAt,
      resolutionType: plain.metadata?.resolutionType,
    },
  }
}

export async function loadPublicHistorial(
  solicitudId: Types.ObjectId,
  options?: { limit?: number; before?: string },
): Promise<PublicHistorialPage> {
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100)
  const filter: Record<string, unknown> = { solicitud: solicitudId }
  if (options?.before && Types.ObjectId.isValid(options.before)) {
    filter._id = { $gt: new Types.ObjectId(options.before) }
  }

  const events = await HistorialSolicitud.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit + 1)
    .select('type message metadata createdAt author attachment')
    .populate('author', 'nombre')
    .populate('attachment', 'url filename')

  const hasMore = events.length > limit
  const page = hasMore ? events.slice(0, limit) : events
  const last = page[page.length - 1]
  return {
    items: page.map((event) => toPublicHistorialEvent(event)),
    nextCursor: hasMore && last ? String(last._id) : undefined,
  }
}

export function attachLifecycleFields<T extends Record<string, unknown>>(
  plain: T,
  actor?: SolicitudActor,
  extras?: { historial?: unknown[]; historyNote?: string },
): T {
  const estado = String(plain.estado ?? '')
  const workflowVersion = (plain.workflowVersion as number | undefined) ?? undefined
  const display = getSolicitudDisplayStatus({
    estado,
    workflowVersion,
    usuario: extractEntityId(plain.usuario),
    tecnico: extractEntityId(plain.tecnico),
  })
  const capabilities = actor
    ? getSolicitudCapabilities(
        {
          estado,
          workflowVersion,
          usuario: extractEntityId(plain.usuario),
          tecnico: extractEntityId(plain.tecnico),
        },
        actor,
      )
    : undefined

  return {
    ...plain,
    workflowVersion: getWorkflowVersion({ workflowVersion }),
    lifecycleState: display.lifecycleState,
    displayStatus: display.label,
    headline: display.headline,
    ...(capabilities ? { capabilities } : {}),
    ...(extras?.historial ? { historial: extras.historial } : {}),
    ...(extras?.historyNote ? { historyNote: extras.historyNote } : {}),
  }
}

export function historyNoteFor(solicitud: Pick<ISolicitud, 'workflowVersion'>): string | undefined {
  return isLegacyWorkflow(solicitud) ? LEGACY_HISTORY_NOTE : undefined
}
