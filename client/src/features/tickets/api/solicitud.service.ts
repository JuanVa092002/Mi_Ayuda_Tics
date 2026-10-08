import apiClient from '@/shared/api/axios'
import type {
  AmbienteFormacion,
  ApiListResponse,
  AssignTecnicoPayload,
  Solicitud,
  TipoCaso,
} from '@/shared/types'
import { sortSolicitudesNewest, unwrapWorkflowSolicitud } from '../leader-inbox'
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

// Cache en memoria para catálogos institucionales casi inmutables durante la sesión
const CATALOG_TTL_MS = 10 * 60 * 1000 // 10 minutos
let ambientesCache: { data: ApiListResponse<AmbienteFormacion[]>; ts: number } | null = null
let tiposCasoCache: { data: ApiListResponse<TipoCaso[]>; ts: number } | null = null

export const invalidateCatalogCache = (): void => {
  ambientesCache = null
  tiposCasoCache = null
}

export const obtenerAmbientes = async (forceRefresh = false): Promise<ApiListResponse<AmbienteFormacion[]>> => {
  const now = Date.now()
  if (!forceRefresh && ambientesCache && now - ambientesCache.ts < CATALOG_TTL_MS) {
    return ambientesCache.data
  }
  const response = await apiClient.get<ApiListResponse<AmbienteFormacion[]>>('/ambienteFormacion')
  ambientesCache = { data: response.data, ts: now }
  return response.data
}

export const asignarSolicitudTecnico = async (
  solicitudId: string,
  payload: AssignTecnicoPayload
): Promise<Solicitud> => {
  return runWithWorkflowAttempt('assign', solicitudId, async (key) => {
    const response = await apiClient.put<{ message?: string; solicitud?: Solicitud } | Solicitud>(
      `/solicitud/${solicitudId}/asignarTecnico`,
      payload,
      { headers: { 'Idempotency-Key': key } }
    )
    return unwrapWorkflowSolicitud(response.data)
  }, payload)
}

export const historialSolicitudesFuncionario = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<SolicitudesFinalizadasResponse>('/solicitud/historial')
  return response.data.solicitudesFinalizadas
}

export const historialSolicitudesLider = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get<HistorialLiderResponse>('/solicitud/historialSolicitudes')
  return sortSolicitudesNewest(response.data.data ?? [])
}

export const obtenerTiposCaso = async (forceRefresh = false): Promise<ApiListResponse<TipoCaso[]>> => {
  const now = Date.now()
  if (!forceRefresh && tiposCasoCache && now - tiposCasoCache.ts < CATALOG_TTL_MS) {
    return tiposCasoCache.data
  }
  const response = await apiClient.get<ApiListResponse<TipoCaso[]>>('/tipoCaso')
  tiposCasoCache = { data: response.data, ts: now }
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

export interface HistorialCasoResponse {
  message: string
  data: import('@/shared/types').SolicitudHistorialEvent[]
  nextCursor?: string
}

export const obtenerHistorialCaso = async (
  solicitudId: string,
  limit = 50
): Promise<import('@/shared/types').SolicitudHistorialEvent[]> => {
  const response = await apiClient.get<HistorialCasoResponse>(
    `/solicitud/${solicitudId}/historial?historialLimit=${limit}`
  )
  return response.data.data ?? []
}
