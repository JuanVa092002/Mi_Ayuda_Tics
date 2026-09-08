import { filterSolicitudesByHistorialChip, type HistorialChip, type SolicitudSummary } from '@/shared/contracts/solicitud';

export type HomeAttentionKind = 'reply' | 'confirm';

export type HomeAttention = {
  kind: HomeAttentionKind;
  itemId: string;
  caseCode: string;
  title: string;
  detail: string;
  cta: string;
};

export type HomeMetricKey = 'unassigned' | 'inProgress' | 'closed';

export type HomeInsight = {
  unassigned: number;
  inProgress: number;
  yourTurn: number;
  closed: number;
  total: number;
  progress: number;
  scanLine: string;
};

export function getTimeBasedGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function firstNameFrom(fullName: string): string {
  return fullName.trim().split(/\s+/).filter(Boolean)[0] || 'Funcionario';
}

export function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function isYourTurnStatus(status: string): boolean {
  return status === 'esperando_usuario' || status === 'resuelto';
}

export function pickHomeAttention(items: SolicitudSummary[]): HomeAttention | undefined {
  const waiting = items.find((item) => item.status === 'esperando_usuario');
  if (waiting) {
    return {
      kind: 'reply',
      itemId: waiting.id,
      caseCode: waiting.caseCode,
      title: 'Te piden información',
      detail: waiting.caseCode || waiting.description,
      cta: 'Responder',
    };
  }
  const confirm = items.find((item) => item.status === 'resuelto');
  if (confirm) {
    return {
      kind: 'confirm',
      itemId: confirm.id,
      caseCode: confirm.caseCode,
      title: 'Confirma la solución',
      detail: confirm.caseCode || confirm.description,
      cta: 'Revisar',
    };
  }
  return undefined;
}

export function buildHomeInsight(items: SolicitudSummary[]): HomeInsight {
  const total = items.length;
  const unassigned = filterSolicitudesByHistorialChip(items, 'Pendientes de asignación').length;
  const inProgress = filterSolicitudesByHistorialChip(items, 'En proceso').length;
  const closed = filterSolicitudesByHistorialChip(items, 'Resueltas').length;
  const yourTurn = items.filter((item) => isYourTurnStatus(item.status)).length;
  const progress = total === 0 ? 0 : closed / total;

  let scanLine = 'Cuando reportes un incidente, el seguimiento aparece aquí.';
  if (yourTurn === 1) scanLine = '1 caso espera tu acción.';
  else if (yourTurn > 1) scanLine = `${yourTurn} casos esperan tu acción.`;
  else if (unassigned === 1) scanLine = '1 solicitud espera asignación.';
  else if (unassigned > 1) scanLine = `${unassigned} solicitudes esperan asignación.`;
  else if (inProgress === 1) scanLine = 'El equipo TIC atiende 1 caso.';
  else if (inProgress > 1) scanLine = `El equipo TIC atiende ${inProgress} casos.`;
  else if (total > 0) scanLine = 'Todo al día. No hay casos abiertos.';

  return { unassigned, inProgress, yourTurn, closed, total, progress, scanLine };
}

export function historialChipForMetric(key: HomeMetricKey): HistorialChip {
  if (key === 'unassigned') return 'Pendientes de asignación';
  if (key === 'closed') return 'Resueltas';
  return 'En proceso';
}
