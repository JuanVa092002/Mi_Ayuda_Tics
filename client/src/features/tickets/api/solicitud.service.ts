import apiClient from '@/shared/api/axios'
import type {
  AmbienteFormacion,
  ApiListResponse,
  AssignTecnicoPayload,
  Solicitud,
  TipoCaso,
} from '@/shared/types'
import { runWithWorkflowAttempt } from './workflow-idempotency'

interface SolicitudesAsignadasResponse {
  solicitudesAsignadas: Solicitud[]
}

interface SolicitudesFinalizadasResponse {
  solicitudesFinalizadas: Solicitud[]
}

interface HistorialLiderResponse {
  data: Solicitud[]
}

export const crearSolicitud = async (formData: FormData): Promise<Solicitud> => {
  const response = await apiClient.post<Solicitud>('/solicitud', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const obtenerAmbientes = async (): Promise<ApiListResponse<AmbienteFormacion[]>> => {
  const response = await apiClient.get<ApiListResponse<AmbienteFormacion[]>>('/ambienteFormacion')
  return response.data
}

export const asignarSolicitudTecnico = async (
  solicitudId: string,
  payload: AssignTecnicoPayload
): Promise<Solicitud> => {
  return runWithWorkflowAttempt('assign', solicitudId, async (key) => {
    const response = await apiClient.put<Solicitud>(
      `/solicitud/${solicitudId}/asignarTecnico`,
      payload,
      { headers: { 'Idempotency-Key': key } }
    )
    return response.data
  }, payload)
}

export const historialSolicitudesFuncionario = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<SolicitudesFinalizadasResponse>('/solicitud/historial')
  return response.data.solicitudesFinalizadas
}

export const historialSolicitudesLider = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<HistorialLiderResponse>('/solicitud/historialSolicitudes')
  return response.data.data
}

export const obtenerTiposCaso = async (): Promise<ApiListResponse<TipoCaso[]>> => {
  const response = await apiClient.get<ApiListResponse<TipoCaso[]>>('/tipoCaso')
  return response.data
}

export const getSolicitudesPendientes = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<ApiListResponse<Solicitud[]>>('/solicitud/pendientes')
  return response.data.data ?? []
}

export const getCasosAsignados = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<SolicitudesAsignadasResponse>('/solicitud/asignadas')
  return response.data.solicitudesAsignadas ?? []
}

export const getCasosFinalizados = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<SolicitudesFinalizadasResponse>('/solicitud/finalizadas')
  return response.data.solicitudesFinalizadas ?? []
}

export const getCasos = async (): Promise<ApiListResponse<TipoCaso[]>> => {
  const response = await apiClient.get<ApiListResponse<TipoCaso[]>>('/tipoCaso')
  return response.data
}

export const createCaso = async (caso: Pick<TipoCaso, 'nombre' | 'descripcion'>): Promise<TipoCaso> => {
  const response = await apiClient.post<TipoCaso>('/tipoCaso', caso)
  return response.data
}

export const updateCaso = async (
  id: string,
  caso: Pick<TipoCaso, 'nombre' | 'descripcion'>
): Promise<TipoCaso> => {
  const response = await apiClient.put<TipoCaso>(`/tipoCaso/${id}`, caso)
  return response.data
}
