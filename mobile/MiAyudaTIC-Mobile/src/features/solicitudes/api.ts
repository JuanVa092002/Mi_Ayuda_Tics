import { apiFetch } from '@/shared/api/client';
import { mapUnknownFetchError } from '@/shared/api/fetch-error';
import { appendImageToFormData } from '@/shared/api/multipart-image';
import {
  mapAmbiente,
  mapTipoCaso,
  type Ambiente,
  type AmbienteDto,
  type CatalogListResponseDto,
  type TipoCaso,
  type TipoCasoDto,
} from '@/shared/contracts/catalogo';
import {
  mapHistorialResponse,
  mapSolicitudDetail,
  mapSolicitudSummary,
  type CreateSolicitudResponseDto,
  type HistorialResponseDto,
  type SolicitudDetail,
  type SolicitudDetailResponseDto,
  type SolicitudSummary,
} from '@/shared/contracts/solicitud';

export type CreateSolicitudPayload = {
  userId: string;
  environmentId: string;
  caseTypeId: string;
  description: string;
  phone: string;
  photo?: {
    uri: string;
    mimeType?: string;
    fileName?: string;
    fileSize?: number;
    origin?: 'camera' | 'gallery';
  };
};

async function buildSolicitudFormData(payload: CreateSolicitudPayload): Promise<FormData> {
  const formData = new FormData();
  formData.append('usuario', payload.userId);
  formData.append('ambiente', payload.environmentId);
  formData.append('tipoCaso', payload.caseTypeId);
  formData.append('descripcion', payload.description);
  formData.append('telefono', payload.phone);

  if (payload.photo) {
    await appendImageToFormData(formData, 'foto', payload.photo);
  }

  return formData;
}

export async function fetchHistorial(token: string): Promise<SolicitudSummary[]> {
  const dto = await apiFetch<HistorialResponseDto>('/solicitud/historial', { token });
  return mapHistorialResponse(dto);
}

export async function fetchSolicitudDetalle(token: string, id: string): Promise<SolicitudDetail> {
  const dto = await apiFetch<SolicitudDetailResponseDto>(`/solicitud/${id}`, { token });
  return mapSolicitudDetail(dto.data, id);
}

export async function createSolicitud(
  token: string,
  payload: CreateSolicitudPayload,
): Promise<SolicitudSummary> {
  try {
    const formData = await buildSolicitudFormData(payload);
    const dto = await apiFetch<CreateSolicitudResponseDto>('/solicitud', {
      method: 'POST',
      token,
      formData,
    });
    return mapSolicitudSummary(dto.solicitud);
  } catch (error) {
    throw mapUnknownFetchError(error);
  }
}

export async function fetchAmbientes(token: string): Promise<Ambiente[]> {
  const dto = await apiFetch<CatalogListResponseDto<AmbienteDto>>('/ambienteFormacion', {
    token,
  });
  return (dto.data ?? []).map(mapAmbiente).filter((item) => item.isActive);
}

export async function fetchTiposCaso(token: string): Promise<TipoCaso[]> {
  const dto = await apiFetch<CatalogListResponseDto<TipoCasoDto>>('/tipoCaso', { token });
  return (dto.data ?? []).map(mapTipoCaso);
}
