import { apiFetch } from '@/shared/api/client';
import { runWithWorkflowAttempt } from '@/shared/api/workflow-idempotency';
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

export type CasoEvidenceInput = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};

function evidenceFingerprint(evidence?: CasoEvidenceInput) {
  return evidence?.uri ? { evidenceUri: evidence.uri } : {};
}

async function postWorkflowForm(
  path: string,
  token: string,
  idempotencyKey: string,
  fields: Record<string, string | undefined>,
  evidence?: CasoEvidenceInput,
): Promise<void> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== '') formData.append(key, value);
  }
  if (evidence?.uri) {
    await appendImageToFormData(formData, 'evidencia', evidence);
  }
  await apiFetch(path, { method: 'POST', token, formData, idempotencyKey });
}

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

export async function iniciarAtencion(token: string, id: string): Promise<void> {
  await runWithWorkflowAttempt(
    'start',
    id,
    (idempotencyKey) =>
      apiFetch(`/solicitud/${id}/iniciarAtencion`, { method: 'POST', token, idempotencyKey }),
  );
}

export async function agregarActualizacion(
  token: string,
  id: string,
  mensaje: string,
  evidence?: CasoEvidenceInput,
): Promise<void> {
  await runWithWorkflowAttempt(
    'update',
    id,
    async (idempotencyKey) => {
      if (evidence?.uri) {
        await postWorkflowForm(`/solicitud/${id}/actualizacion`, token, idempotencyKey, { mensaje }, evidence);
        return;
      }
      await apiFetch(`/solicitud/${id}/actualizacion`, {
        method: 'POST',
        token,
        body: { mensaje },
        idempotencyKey,
      });
    },
    { mensaje, ...evidenceFingerprint(evidence) },
  );
}

export async function solicitarInformacion(token: string, id: string, mensaje: string): Promise<void> {
  await runWithWorkflowAttempt(
    'wait_for_requester',
    id,
    (idempotencyKey) =>
      apiFetch(`/solicitud/${id}/solicitarInformacion`, {
        method: 'POST',
        token,
        body: { mensaje },
        idempotencyKey,
      }),
    { mensaje },
  );
}

export async function registrarSolucionParcial(
  token: string,
  id: string,
  payload: {
    queSeHizo: string;
    queFalta: string;
    siguienteAccion: string;
    fechaEsperada?: string;
    evidence?: CasoEvidenceInput;
  },
): Promise<void> {
  const { evidence, ...body } = payload;
  await runWithWorkflowAttempt(
    'partial_solution',
    id,
    async (idempotencyKey) => {
      if (evidence?.uri) {
        await postWorkflowForm(`/solicitud/${id}/solucionParcial`, token, idempotencyKey, body, evidence);
        return;
      }
      await apiFetch(`/solicitud/${id}/solucionParcial`, { method: 'POST', token, body, idempotencyKey });
    },
    { ...body, ...evidenceFingerprint(evidence) },
  );
}

export async function registrarSolucionTotal(
  token: string,
  id: string,
  payload: { queSeHizo: string; causaIdentificada?: string; evidence?: CasoEvidenceInput },
): Promise<void> {
  const { evidence, ...body } = payload;
  await runWithWorkflowAttempt(
    'resolve',
    id,
    async (idempotencyKey) => {
      if (evidence?.uri) {
        await postWorkflowForm(`/solicitud/${id}/solucionTotal`, token, idempotencyKey, body, evidence);
        return;
      }
      await apiFetch(`/solicitud/${id}/solucionTotal`, { method: 'POST', token, body, idempotencyKey });
    },
    { ...body, ...evidenceFingerprint(evidence) },
  );
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
