import {
  mapSolicitudDetail,
  mapSolicitudSummary,
  type SolicitudDetail,
  type SolicitudDetailDto,
  type SolicitudListItemDto,
  type SolicitudStatus,
  type SolicitudSummary,
} from './solicitud';
import { isClosedListStatus, getTechnicianQueue } from './solicitud-lifecycle';

export type CasosAsignadosResponseDto = {
  solicitudesAsignadas: SolicitudListItemDto[];
};

export type CasosFinalizadosResponseDto = {
  solicitudesFinalizadas: SolicitudListItemDto[];
};

export type CasoSummary = {
  id: string;
  caseCode: string;
  description: string;
  status: SolicitudStatus;
  createdAtRaw: string;
  phone?: string;
  requesterName?: string;
  environmentName?: string;
  caseTypeId?: string;
  caseTypeName?: string;
  photoUrl?: string;
  solutionDescription?: string;
  solutionEvidenceUrl?: string;
  workflowVersion?: number;
  displayStatus: string;
  queue?: string;
};

export type CasoDetail = {
  id: string;
  caseCode: string;
  description: string;
  status: SolicitudStatus;
  createdAtRaw: string;
  phone?: string;
  requesterName?: string;
  environmentName?: string;
  environmentIsActive?: boolean;
  caseTypeId?: string;
  caseTypeName?: string;
  photoUrl?: string;
  solutionDescription?: string;
  solutionEvidenceUrl?: string;
  workflowVersion?: number;
  displayStatus: string;
  headline?: string;
  proximaAccion?: string;
  historial?: SolicitudDetail['historial'];
  historyNote?: string;
  capabilities?: SolicitudDetail['capabilities'];
};

export function mapCasoSummary(dto: SolicitudListItemDto): CasoSummary {
  const summary: SolicitudSummary = mapSolicitudSummary(dto);
  return {
    id: summary.id,
    caseCode: summary.caseCode,
    description: summary.description,
    status: summary.status,
    createdAtRaw: summary.createdAtRaw,
    phone: summary.phone,
    requesterName: summary.requesterName,
    environmentName: summary.environmentName,
    caseTypeId: summary.caseTypeId,
    caseTypeName: summary.caseTypeName,
    photoUrl: summary.photo?.optimizedUrl ?? summary.photo?.url,
    solutionDescription: summary.solution?.description,
    solutionEvidenceUrl: summary.solution?.evidenceUrl,
    workflowVersion: summary.workflowVersion,
    displayStatus: summary.displayStatus,
    queue: getTechnicianQueue({
      estado: summary.status,
      workflowVersion: summary.workflowVersion,
    }),
  };
}

export function mapCasoDetail(dto: SolicitudDetailDto, id: string): CasoDetail {
  const detail: SolicitudDetail = mapSolicitudDetail(dto, id);
  return {
    id: detail.id,
    caseCode: detail.caseCode,
    description: detail.description,
    status: detail.status,
    createdAtRaw: detail.createdAtRaw,
    phone: detail.phone,
    requesterName: detail.requesterName,
    environmentName: detail.environmentName,
    environmentIsActive: detail.environmentIsActive,
    caseTypeId: detail.caseTypeId,
    caseTypeName: detail.caseTypeName,
    photoUrl: detail.photo?.optimizedUrl ?? detail.photo?.url,
    solutionDescription: detail.solution?.description,
    solutionEvidenceUrl: detail.solution?.evidenceUrl,
    workflowVersion: detail.workflowVersion,
    displayStatus: detail.displayStatus,
    headline: detail.headline,
    proximaAccion: detail.proximaAccion,
    historial: detail.historial,
    historyNote: detail.historyNote,
    capabilities: detail.capabilities,
  };
}

export function mapCasosAsignadosResponse(dto: CasosAsignadosResponseDto): CasoSummary[] {
  return (dto.solicitudesAsignadas ?? []).map(mapCasoSummary);
}

export function mapCasosFinalizadosResponse(dto: CasosFinalizadosResponseDto): CasoSummary[] {
  return (dto.solicitudesFinalizadas ?? []).map(mapCasoSummary);
}

export function filterCasosPorResolver(casos: CasoSummary[]): CasoSummary[] {
  return casos.filter((caso) => getTechnicianQueue({ estado: caso.status, workflowVersion: caso.workflowVersion }) === 'por_iniciar');
}

export function filterCasosEnProgreso(casos: CasoSummary[]): CasoSummary[] {
  return casos.filter((caso) => getTechnicianQueue({ estado: caso.status, workflowVersion: caso.workflowVersion }) === 'en_atencion');
}

export function filterCasosEsperandoFuncionario(casos: CasoSummary[]): CasoSummary[] {
  return casos.filter(
    (caso) => getTechnicianQueue({ estado: caso.status, workflowVersion: caso.workflowVersion }) === 'esperando_funcionario',
  );
}

export function filterCasosEsperandoConfirmacion(casos: CasoSummary[]): CasoSummary[] {
  return casos.filter(
    (caso) => getTechnicianQueue({ estado: caso.status, workflowVersion: caso.workflowVersion }) === 'esperando_confirmacion',
  );
}

export function filterCasosTerminados(casos: CasoSummary[]): CasoSummary[] {
  return casos.filter((caso) => {
    const queue = getTechnicianQueue({ estado: caso.status, workflowVersion: caso.workflowVersion });
    return queue === 'terminados' || isClosedListStatus(caso.status);
  });
}

export function filterCasosByQuery(casos: CasoSummary[], query: string): CasoSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return casos;

  return casos.filter((caso) => {
    const haystack = [
      caso.caseCode,
      caso.description,
      caso.requesterName,
      caso.environmentName,
      caso.caseTypeName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function sortCasosByMostRecent(casos: CasoSummary[]): CasoSummary[] {
  return [...casos].reverse();
}

export function canResolveCaso(caso: Pick<CasoDetail, 'status' | 'workflowVersion'>): boolean {
  if (caso.workflowVersion === 2) return false;
  return caso.status === 'asignado' || caso.status === 'pendiente';
}
