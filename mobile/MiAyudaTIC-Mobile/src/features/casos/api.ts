import { apiFetch } from '@/shared/api/client';
import { mapUnknownFetchError } from '@/shared/api/fetch-error';
import { appendImageToFormData } from '@/shared/api/multipart-image';
import {
  mapCasosAsignadosResponse,
  mapCasosFinalizadosResponse,
  mapCasoDetail,
  type CasoDetail,
  type CasoSummary,
  type CasosAsignadosResponseDto,
  type CasosFinalizadosResponseDto,
} from '@/shared/contracts/caso';
import {
  mapSolucionResponse,
  type ResolveCasoInput,
  type SolucionCasoResponseDto,
  type SolucionResult,
} from '@/shared/contracts/solucion';
import type { SolicitudDetailResponseDto } from '@/shared/contracts/solicitud';

export async function fetchCasosAsignados(token: string): Promise<CasoSummary[]> {
  const dto = await apiFetch<CasosAsignadosResponseDto>('/solicitud/asignadas', { token });
  return mapCasosAsignadosResponse(dto);
}

export async function fetchCasosResueltos(token: string): Promise<CasoSummary[]> {
  const dto = await apiFetch<CasosFinalizadosResponseDto>('/solicitud/finalizadas', { token });
  return mapCasosFinalizadosResponse(dto);
}

export async function fetchCasoDetalle(token: string, id: string): Promise<CasoDetail> {
  const dto = await apiFetch<SolicitudDetailResponseDto>(`/solicitud/${id}`, { token });
  return mapCasoDetail(dto.data, id);
}

async function buildSolucionFormData(input: ResolveCasoInput): Promise<FormData> {
  const formData = new FormData();
  formData.append('descripcionSolucion', input.solutionDescription);
  formData.append('tipoCaso', input.caseTypeId);
  formData.append('tipoSolucion', input.solutionType);

  if (input.evidenceUri) {
    await appendImageToFormData(formData, 'evidencia', {
      uri: input.evidenceUri,
      mimeType: input.evidenceMimeType,
      fileName: input.evidenceFileName,
    });
  }

  return formData;
}

export async function resolverCaso(
  token: string,
  solicitudId: string,
  input: ResolveCasoInput,
): Promise<SolucionResult> {
  try {
    if (input.evidenceUri) {
      const formData = await buildSolucionFormData(input);
      const dto = await apiFetch<SolucionCasoResponseDto>(`/solucionCaso/${solicitudId}`, {
        method: 'POST',
        token,
        formData,
      });
      return mapSolucionResponse(dto);
    }

    const dto = await apiFetch<SolucionCasoResponseDto>(`/solucionCaso/${solicitudId}`, {
      method: 'POST',
      token,
      body: {
        descripcionSolucion: input.solutionDescription,
        tipoCaso: input.caseTypeId,
        tipoSolucion: input.solutionType,
      },
    });
    return mapSolucionResponse(dto);
  } catch (error) {
    throw mapUnknownFetchError(error);
  }
}
