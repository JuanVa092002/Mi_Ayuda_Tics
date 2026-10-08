export type WorkflowVersion = 1 | 2

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

export type SolicitudLifecycleInput = {
  estado: string
  workflowVersion?: number | null
}

export function getWorkflowVersion(solicitud: Pick<SolicitudLifecycleInput, 'workflowVersion'>): WorkflowVersion {
  return solicitud.workflowVersion === 2 ? 2 : 1
}

export function getSolicitudLifecycleState(solicitud: SolicitudLifecycleInput): LifecycleState {
  const version = getWorkflowVersion(solicitud)
  const estado = solicitud.estado

  if (version === 2) {
    if (
      estado === 'nuevo' ||
      estado === 'asignado' ||
      estado === 'en_progreso' ||
      estado === 'esperando_usuario' ||
      estado === 'resuelto' ||
      estado === 'cerrado' ||
      estado === 'cancelado'
    ) {
      return estado
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

export function getSolicitudDisplayStatus(solicitud: SolicitudLifecycleInput): {
  lifecycleState: LifecycleState
  label: string
  headline: string
} {
  const lifecycleState = getSolicitudLifecycleState(solicitud)
  const version = getWorkflowVersion(solicitud)

  if (version === 1) {
    switch (solicitud.estado) {
      case 'solicitado':
        return { lifecycleState, label: 'Enviada', headline: 'Tu solicitud fue enviada.' }
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
        return { lifecycleState, label: 'Cerrada', headline: 'Esta solicitud quedó cerrada.' }
      default:
        return { lifecycleState, label: 'Enviada', headline: 'Tu solicitud fue enviada.' }
    }
  }

  switch (lifecycleState) {
    case 'nuevo':
      return { lifecycleState, label: 'Enviada', headline: 'Tu solicitud fue enviada.' }
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
      return { lifecycleState, label: 'Cerrada', headline: 'Esta solicitud quedó cerrada.' }
    case 'cancelado':
      return { lifecycleState, label: 'Cancelada', headline: 'Esta solicitud fue cancelada.' }
    default:
      return { lifecycleState, label: 'Enviada', headline: 'Tu solicitud fue enviada.' }
  }
}

export function isAssignmentPendingStatus(estado: string, workflowVersion?: number | null): boolean {
  return getSolicitudLifecycleState({ estado, workflowVersion }) === 'nuevo'
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

export function isClosedListStatus(estado: string): boolean {
  return estado === 'finalizado' || estado === 'cerrado' || estado === 'cancelado'
}

export function isInProgressListStatus(estado: string, workflowVersion?: number | null): boolean {
  return getTechnicianQueue({ estado, workflowVersion }) === 'en_atencion'
}

export function isOpenWorkListStatus(estado: string, workflowVersion?: number | null): boolean {
  const queue = getTechnicianQueue({ estado, workflowVersion })
  return (
    queue === 'por_iniciar' ||
    queue === 'en_atencion' ||
    queue === 'esperando_funcionario' ||
    queue === 'esperando_confirmacion'
  )
}
