import type { CasoDetail } from '@/shared/contracts/caso';
import type { SolicitudCapabilitiesDto } from '@/shared/contracts/solicitud';

export type TechnicianActionId = 'start' | 'update' | 'request_info' | 'partial' | 'resolve';

export const MIN_WORKFLOW_TEXT = 3;

export type TechnicianAttentionBanner = {
  tone: 'warning' | 'info' | 'success';
  title: string;
  detail?: string;
};

export function visibleTechnicianActions(
  capabilities?: SolicitudCapabilitiesDto,
): TechnicianActionId[] {
  const actions: TechnicianActionId[] = [];
  if (capabilities?.canStart) actions.push('start');
  if (capabilities?.canUpdate) actions.push('update');
  if (capabilities?.canRequestInfo) actions.push('request_info');
  if (capabilities?.canPartialSolution) actions.push('partial');
  if (capabilities?.canResolve) actions.push('resolve');
  return actions;
}

export function canSolve(capabilities?: SolicitudCapabilitiesDto): boolean {
  return Boolean(capabilities?.canPartialSolution || capabilities?.canResolve);
}

export function attentionBannerForCaso(
  caso: Pick<CasoDetail, 'status' | 'headline' | 'proximaAccion' | 'displayStatus'>,
): TechnicianAttentionBanner | undefined {
  if (caso.status === 'asignado') {
    return {
      tone: 'warning',
      title: 'Requiere tu atención',
      detail: caso.proximaAccion ?? 'Inicia la atención para tomar el caso.',
    };
  }
  if (caso.status === 'esperando_usuario') {
    return {
      tone: 'info',
      title: 'Esperando al funcionario',
      detail: caso.proximaAccion ?? 'Revisa el historial cuando responda.',
    };
  }
  if (caso.status === 'resuelto') {
    return {
      tone: 'success',
      title: 'Pendiente de confirmación',
      detail: caso.proximaAccion ?? 'El funcionario debe confirmar que la solución funciona.',
    };
  }
  if (caso.headline || caso.proximaAccion) {
    return {
      tone: 'info',
      title: caso.headline ?? caso.displayStatus,
      detail: caso.proximaAccion,
    };
  }
  return undefined;
}

export function isWorkflowTextValid(value: string): boolean {
  return value.trim().length >= MIN_WORKFLOW_TEXT;
}
