import apiClient from '@/shared/api/axios'
import type { Solicitud } from '@/shared/types'
import { runWithWorkflowAttempt } from './workflow-idempotency'

type WorkflowResponse = {
  message: string
  solicitud: Solicitud
}

function withKey(idempotencyKey: string) {
  return { headers: { 'Idempotency-Key': idempotencyKey } }
}

export const reasignarTecnico = async (
  solicitudId: string,
  payload: { tecnico: string; motivo: string }
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('reassign', solicitudId, async (key) => {
    const response = await apiClient.put<WorkflowResponse>(
      `/solicitud/${solicitudId}/reasignarTecnico`,
      payload,
      withKey(key)
    )
    return response.data
  }, payload)
}

export const cancelarSolicitud = async (
  solicitudId: string,
  motivo: string
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('cancel', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/cancelar`,
      { motivo },
      withKey(key)
    )
    return response.data
  }, { motivo })
}

export const iniciarAtencion = async (solicitudId: string): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('start', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/iniciarAtencion`,
      undefined,
      withKey(key)
    )
    return response.data
  })
}

export const agregarActualizacion = async (
  solicitudId: string,
  mensaje: string
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('update', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/actualizacion`,
      { mensaje },
      withKey(key)
    )
    return response.data
  }, { mensaje })
}

export const solicitarInformacion = async (
  solicitudId: string,
  mensaje: string
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('wait_for_requester', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/solicitarInformacion`,
      { mensaje },
      withKey(key)
    )
    return response.data
  }, { mensaje })
}

export const registrarSolucionParcial = async (
  solicitudId: string,
  payload: { queSeHizo: string; queFalta: string; siguienteAccion: string; fechaEsperada?: string }
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('partial_solution', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/solucionParcial`,
      payload,
      withKey(key)
    )
    return response.data
  }, payload)
}

export const registrarSolucionTotal = async (
  solicitudId: string,
  payload: { queSeHizo: string; causaIdentificada?: string }
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('resolve', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/solucionTotal`,
      payload,
      withKey(key)
    )
    return response.data
  }, payload)
}

export const responderSolicitud = async (
  solicitudId: string,
  mensaje: string
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('requester_reply', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/responder`,
      { mensaje },
      withKey(key)
    )
    return response.data
  }, { mensaje })
}

export const confirmarSolucion = async (solicitudId: string): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('confirm', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/confirmarSolucion`,
      undefined,
      withKey(key)
    )
    return response.data
  })
}

export const reabrirSolicitud = async (
  solicitudId: string,
  motivo: string
): Promise<WorkflowResponse> => {
  return runWithWorkflowAttempt('reopen', solicitudId, async (key) => {
    const response = await apiClient.post<WorkflowResponse>(
      `/solicitud/${solicitudId}/reabrir`,
      { motivo },
      withKey(key)
    )
    return response.data
  }, { motivo })
}

export const getSolicitudDetalle = async (solicitudId: string): Promise<Solicitud> => {
  const response = await apiClient.get<{ data: Solicitud }>(`/solicitud/${solicitudId}`)
  return response.data.data
}
