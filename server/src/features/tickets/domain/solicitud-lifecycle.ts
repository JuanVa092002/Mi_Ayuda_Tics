export const WORKFLOW_V2 = 2 as const

export type WorkflowVersion = 1 | 2

export type PersistedSolicitudEstado =
  | 'solicitado'
  | 'asignado'
  | 'pendiente'
  | 'finalizado'
  | 'nuevo'
  | 'en_progreso'
  | 'esperando_usuario'
  | 'resuelto'
  | 'cerrado'
  | 'cancelado'

export type LifecycleState =
  | 'nuevo'
  | 'asignado'
  | 'en_progreso'
  | 'en_progreso_legacy'
  | 'esperando_usuario'
  | 'resuelto'
  | 'cerrado'
  | 'cerrado_legacy'
  | 'cancelado'

export type SolicitudWorkflowAction =
  | 'assign'
  | 'reassign'
  | 'start'
  | 'update'
  | 'wait_for_requester'
  | 'requester_reply'
  | 'partial_solution'
  | 'resolve'
  | 'confirm'
  | 'reopen'
  | 'cancel'

export type TicketEventType =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'started'
  | 'updated'
  | 'waiting_for_requester'
  | 'partial_solution'
  | 'resolved'
  | 'reopened'
  | 'closed'
  | 'cancelled'

export type ActorRole = 'funcionario' | 'lider' | 'tecnico'

export type SolicitudLifecycleInput = {
  estado: string
  workflowVersion?: number | null
  usuario?: unknown
  tecnico?: unknown
}

export type SolicitudActor = {
  id: string
  rol: ActorRole
}

export type DisplayStatus = {
  lifecycleState: LifecycleState
  label: string
  headline: string
}

const V2_STATES = new Set<string>([
  'nuevo',
  'asignado',
  'en_progreso',
  'esperando_usuario',
  'resuelto',
  'cerrado',
  'cancelado',
])

const ACTION_EVENT: Record<SolicitudWorkflowAction, TicketEventType> = {
  assign: 'assigned',
  reassign: 'reassigned',
  start: 'started',
  update: 'updated',
  wait_for_requester: 'waiting_for_requester',
  requester_reply: 'updated',
  partial_solution: 'partial_solution',
  resolve: 'resolved',
  confirm: 'closed',
  reopen: 'reopened',
  cancel: 'cancelled',
}

export function getWorkflowVersion(solicitud: Pick<SolicitudLifecycleInput, 'workflowVersion'>): WorkflowVersion {
  return solicitud.workflowVersion === WORKFLOW_V2 ? 2 : 1
}

export function isLegacyWorkflow(solicitud: Pick<SolicitudLifecycleInput, 'workflowVersion'>): boolean {
  return getWorkflowVersion(solicitud) === 1
}

export function getSolicitudLifecycleState(solicitud: SolicitudLifecycleInput): LifecycleState {
  const version = getWorkflowVersion(solicitud)
  const estado = solicitud.estado

  if (version === 2) {
    if (V2_STATES.has(estado) && estado !== 'pendiente' && estado !== 'solicitado' && estado !== 'finalizado') {
      return estado as LifecycleState
    }
    return 'nuevo'
  }

  switch (estado) {
    case 'solicitado':
      return 'nuevo'
    case 'asignado':
    case 'pendiente':
      return 'en_progreso_legacy'
    case 'finalizado':
      return 'cerrado_legacy'
    default:
      return 'nuevo'
  }
}

export function getSolicitudDisplayStatus(solicitud: SolicitudLifecycleInput): DisplayStatus {
  const lifecycleState = getSolicitudLifecycleState(solicitud)
  const version = getWorkflowVersion(solicitud)

  if (version === 1) {
    switch (solicitud.estado) {
      case 'solicitado':
        return {
          lifecycleState,
          label: 'Enviada',
          headline: 'Tu solicitud fue enviada.',
        }
      case 'asignado':
        return {
          lifecycleState,
          label: 'En atención',
          headline: 'El equipo TIC está atendiendo tu solicitud.',
        }
      case 'pendiente':
        return {
          lifecycleState,
          label: 'Seguimiento pendiente del equipo TIC',
          headline: 'El equipo TIC continúa el seguimiento de tu solicitud.',
        }
      case 'finalizado':
        return {
          lifecycleState,
          label: 'Cerrada',
          headline: 'Esta solicitud quedó cerrada.',
        }
      default:
        return {
          lifecycleState,
          label: 'Enviada',
          headline: 'Tu solicitud fue enviada.',
        }
    }
  }

  switch (lifecycleState) {
    case 'nuevo':
      return {
        lifecycleState,
        label: 'Enviada',
        headline: 'Tu solicitud fue enviada.',
      }
    case 'asignado':
      return {
        lifecycleState,
        label: 'Técnico asignado',
        headline: 'Un técnico ya es responsable de tu solicitud.',
      }
    case 'en_progreso':
      return {
        lifecycleState,
        label: 'En atención',
        headline: 'El técnico está atendiendo tu solicitud.',
      }
    case 'esperando_usuario':
      return {
        lifecycleState,
        label: 'Requiere tu información',
        headline: 'Necesitamos información adicional para continuar.',
      }
    case 'resuelto':
      return {
        lifecycleState,
        label: 'Solución aplicada',
        headline: 'Aplicamos una solución y esperamos tu confirmación.',
      }
    case 'cerrado':
      return {
        lifecycleState,
        label: 'Cerrada',
        headline: 'Esta solicitud quedó cerrada.',
      }
    case 'cancelado':
      return {
        lifecycleState,
        label: 'Cancelada',
        headline: 'Esta solicitud fue cancelada.',
      }
    default:
      return {
        lifecycleState,
        label: 'Enviada',
        headline: 'Tu solicitud fue enviada.',
      }
  }
}

export function eventTypeForAction(action: SolicitudWorkflowAction): TicketEventType {
  return ACTION_EVENT[action]
}

export function nextPersistedEstado(
  action: SolicitudWorkflowAction,
  current: PersistedSolicitudEstado,
): PersistedSolicitudEstado | null {
  switch (action) {
    case 'assign':
      return current === 'nuevo' ? 'asignado' : null
    case 'reassign':
      if (current === 'asignado') return 'asignado'
      if (current === 'en_progreso') return 'asignado'
      if (current === 'esperando_usuario') return 'esperando_usuario'
      return null
    case 'start':
      return current === 'asignado' ? 'en_progreso' : null
    case 'update':
      return current === 'en_progreso' ? 'en_progreso' : null
    case 'wait_for_requester':
      return current === 'en_progreso' ? 'esperando_usuario' : null
    case 'requester_reply':
      return current === 'esperando_usuario' ? 'en_progreso' : null
    case 'partial_solution':
      return current === 'en_progreso' ? 'en_progreso' : null
    case 'resolve':
      return current === 'en_progreso' ? 'resuelto' : null
    case 'confirm':
      return current === 'resuelto' ? 'cerrado' : null
    case 'reopen':
      return current === 'resuelto' ? 'en_progreso' : null
    case 'cancel':
      return current === 'nuevo' || current === 'asignado' ? 'cancelado' : null
    default:
      return null
  }
}

export function isTerminalLifecycle(state: LifecycleState): boolean {
  return state === 'cerrado' || state === 'cerrado_legacy' || state === 'cancelado'
}

export function canTransitionSolicitud(
  solicitud: SolicitudLifecycleInput,
  action: SolicitudWorkflowAction,
  actor: SolicitudActor,
): { ok: true } | { ok: false; status: number; message: string } {
  if (isLegacyWorkflow(solicitud)) {
    return {
      ok: false,
      status: 409,
      message: 'Esta solicitud usa el flujo anterior y no admite esta acción.',
    }
  }

  const estado = solicitud.estado as PersistedSolicitudEstado
  if (!V2_STATES.has(estado)) {
    return { ok: false, status: 409, message: 'Estado inválido para el flujo actual.' }
  }

  const next = nextPersistedEstado(action, estado)
  if (!next) {
    return { ok: false, status: 409, message: 'Transición de estado no permitida.' }
  }

  switch (action) {
    case 'assign':
    case 'reassign':
    case 'cancel':
      if (actor.rol !== 'lider') {
        return { ok: false, status: 403, message: 'Solo el Líder TIC puede realizar esta acción.' }
      }
      return { ok: true }
    case 'start':
    case 'update':
    case 'wait_for_requester':
    case 'partial_solution':
    case 'resolve':
      if (actor.rol !== 'tecnico') {
        return { ok: false, status: 403, message: 'Solo el técnico asignado puede realizar esta acción.' }
      }
      return { ok: true }
    case 'requester_reply':
    case 'confirm':
    case 'reopen':
      if (actor.rol !== 'funcionario') {
        return { ok: false, status: 403, message: 'Solo el funcionario titular puede realizar esta acción.' }
      }
      return { ok: true }
    default:
      return { ok: false, status: 409, message: 'Acción no reconocida.' }
  }
}

export function funcionarioCapabilities(solicitud: SolicitudLifecycleInput): {
  canReply: boolean
  canConfirm: boolean
  canReopen: boolean
} {
  if (isLegacyWorkflow(solicitud)) {
    return { canReply: false, canConfirm: false, canReopen: false }
  }
  const state = getSolicitudLifecycleState(solicitud)
  return {
    canReply: state === 'esperando_usuario',
    canConfirm: state === 'resuelto',
    canReopen: state === 'resuelto',
  }
}

export function leaderInboxMongoFilter(): Record<string, unknown> {
  return { estado: { $in: ['solicitado', 'nuevo'] } }
}

export function technicianActiveMongoFilter(tecnicoId: unknown): Record<string, unknown> {
  return {
    tecnico: tecnicoId,
    estado: { $in: ['asignado', 'pendiente', 'en_progreso', 'esperando_usuario', 'resuelto'] },
  }
}

export function technicianClosedMongoFilter(tecnicoId: unknown): Record<string, unknown> {
  return {
    tecnico: tecnicoId,
    estado: { $in: ['finalizado', 'cerrado', 'cancelado'] },
  }
}

export function leaderHistoryMongoFilter(): Record<string, unknown> {
  return { estado: { $nin: ['solicitado', 'nuevo'] } }
}

export function isClosedListStatus(estado: string): boolean {
  return estado === 'finalizado' || estado === 'cerrado' || estado === 'cancelado'
}

export function isAssignmentPendingStatus(estado: string, workflowVersion?: number | null): boolean {
  const lifecycle = getSolicitudLifecycleState({ estado, workflowVersion })
  return lifecycle === 'nuevo'
}

export type TechnicianQueue =
  | 'inbox'
  | 'por_iniciar'
  | 'en_atencion'
  | 'esperando_funcionario'
  | 'esperando_confirmacion'
  | 'terminados'

export function getTechnicianQueue(solicitud: SolicitudLifecycleInput): TechnicianQueue {
  const lifecycle = getSolicitudLifecycleState(solicitud)
  switch (lifecycle) {
    case 'asignado':
      return 'por_iniciar'
    case 'en_progreso':
    case 'en_progreso_legacy':
      return 'en_atencion'
    case 'esperando_usuario':
      return 'esperando_funcionario'
    case 'resuelto':
      return 'esperando_confirmacion'
    case 'cerrado':
    case 'cerrado_legacy':
    case 'cancelado':
      return 'terminados'
    default:
      return 'inbox'
  }
}

export function isInProgressListStatus(estado: string, workflowVersion?: number | null): boolean {
  return getTechnicianQueue({ estado, workflowVersion }) === 'en_atencion'
}

export function sanitizePublicMotivo(raw: string): string {
  return raw
    .replace(/\S+@\S+/g, '[correo]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240)
}

export type SolicitudCapabilities = {
  canAssign: boolean
  canReassign: boolean
  canCancel: boolean
  canStart: boolean
  canUpdate: boolean
  canRequestInfo: boolean
  canPartialSolution: boolean
  canResolve: boolean
  canReply: boolean
  canConfirm: boolean
  canReopen: boolean
}

const EMPTY_CAPABILITIES: SolicitudCapabilities = {
  canAssign: false,
  canReassign: false,
  canCancel: false,
  canStart: false,
  canUpdate: false,
  canRequestInfo: false,
  canPartialSolution: false,
  canResolve: false,
  canReply: false,
  canConfirm: false,
  canReopen: false,
}

export function getSolicitudCapabilities(
  solicitud: SolicitudLifecycleInput,
  actor: SolicitudActor,
): SolicitudCapabilities {
  const caps = { ...EMPTY_CAPABILITIES }
  const version = getWorkflowVersion(solicitud)
  const state = getSolicitudLifecycleState(solicitud)
  const ownsTicket = idsEqual(solicitud.usuario, actor.id)
  const isAssignedTechnician = idsEqual(solicitud.tecnico, actor.id)

  if (actor.rol === 'lider') {
    caps.canAssign = version === 2 ? state === 'nuevo' : solicitud.estado === 'solicitado'
    caps.canReassign =
      version === 2 && (state === 'asignado' || state === 'en_progreso' || state === 'esperando_usuario')
    caps.canCancel = version === 2 && (state === 'nuevo' || state === 'asignado')
    return caps
  }

  if (actor.rol === 'tecnico' && version === 2 && isAssignedTechnician) {
    caps.canStart = state === 'asignado'
    caps.canUpdate = state === 'en_progreso'
    caps.canRequestInfo = state === 'en_progreso'
    caps.canPartialSolution = state === 'en_progreso'
    caps.canResolve = state === 'en_progreso'
    return caps
  }

  if (actor.rol === 'funcionario' && ownsTicket) {
    const funcionario = funcionarioCapabilities(solicitud)
    caps.canReply = funcionario.canReply
    caps.canConfirm = funcionario.canConfirm
    caps.canReopen = funcionario.canReopen
  }

  return caps
}

function idsEqual(left: unknown, right: unknown): boolean {
  if (left == null || right == null) return false
  return String(left) === String(right)
}

export const LEGACY_HISTORY_NOTE =
  'El historial detallado está disponible para solicitudes creadas desde esta actualización.'

export const EVENT_MESSAGES: Record<TicketEventType, string> = {
  created: 'Solicitud registrada.',
  assigned: 'Se asignó un técnico.',
  reassigned: 'Se reasignó el técnico.',
  started: 'El técnico inició la atención.',
  updated: 'Se registró una actualización.',
  waiting_for_requester: 'El técnico solicitó información adicional.',
  partial_solution: 'El técnico registró una solución parcial.',
  resolved: 'El técnico registró una solución.',
  reopened: 'El funcionario indicó que el problema continúa.',
  closed: 'El funcionario confirmó que la solución funciona.',
  cancelled: 'La solicitud fue cancelada.',
}

const IDEMPOTENT_TARGET: Partial<Record<SolicitudWorkflowAction, PersistedSolicitudEstado>> = {
  start: 'en_progreso',
  wait_for_requester: 'esperando_usuario',
  resolve: 'resuelto',
  confirm: 'cerrado',
  cancel: 'cancelado',
}

export function isIdempotentAlreadyApplied(
  action: SolicitudWorkflowAction,
  estado: string,
): boolean {
  return IDEMPOTENT_TARGET[action] === estado
}
