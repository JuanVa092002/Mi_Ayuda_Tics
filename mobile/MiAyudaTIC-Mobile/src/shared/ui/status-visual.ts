import { getTicketStateConfig, getTicketStatePaint } from './ticket-state';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export function getStatusTone(status: string, workflowVersion?: number | null): StatusTone {
  const config = getTicketStateConfig(status, workflowVersion);
  if (config.key === 'esperando_usuario' || config.key === 'en_espera_proveedor') return 'warning';
  if (config.key === 'resuelto') return 'success';
  if (config.key === 'cancelado' || config.key === 'bloqueado' || config.key === 'escalado') return 'danger';
  if (config.key === 'cerrado' || config.key === 'legacy') return 'neutral';
  return 'info';
}

export function getStatusToneColors(status: string, workflowVersion?: number | null) {
  const paint = getTicketStatePaint(status, { workflowVersion });
  return { bg: paint.background, text: paint.text, dot: paint.accent };
}

export function getCompactStatusLabel(status: string, fullLabel: string, workflowVersion?: number | null): string {
  const config = getTicketStateConfig(status, workflowVersion);
  if (config.key === 'legacy') return fullLabel;
  return config.compactLabel;
}
