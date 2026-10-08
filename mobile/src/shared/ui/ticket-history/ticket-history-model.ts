import { getEventStateKey, getTicketStatePaint } from '@/shared/ui/ticket-state';

export const TICKET_HISTORY_INITIAL_VISIBLE = 20;

/** Mensajes genéricos del API; si coinciden, no se repiten como detalle. */
export const GENERIC_EVENT_MESSAGES: Record<string, string> = {
  created: 'Solicitud registrada.',
  assigned: 'Se asignó un técnico.',
  reassigned: 'Se reasignó el técnico.',
  started: 'El técnico inició la atención.',
  updated: 'Se registró una actualización.',
  waiting_for_requester: 'El técnico solicitó información adicional.',
  partial_solution: 'El técnico registró una solución parcial.',
  resolved: 'El técnico registró una solución.',
  reopened: 'El funcionario indicó que el problema continúa.',
  closed: 'El funcionario confirmó que la solución funciona.',
  cancelled: 'La solicitud fue cancelada.',
};

export type TicketHistoryIconName =
  | 'file-text'
  | 'user-plus'
  | 'refresh-cw'
  | 'play-circle'
  | 'message-circle'
  | 'clock'
  | 'tool'
  | 'check-circle'
  | 'rotate-ccw'
  | 'flag'
  | 'x-circle';

export type TicketHistoryRole = 'funcionario' | 'tecnico' | 'lider' | 'sistema';
export type TicketHistoryProminence = 'prominent' | 'compact';

export type TicketHistoryAttachment = {
  url?: string;
  filename?: string;
};

export type TicketHistoryEventData = {
  id?: string;
  type: string;
  message: string;
  createdAt?: string;
  authorName?: string;
  attachment?: TicketHistoryAttachment;
  nextAction?: string;
  resolutionType?: string;
};

export type TicketHistoryVisual = {
  icon: TicketHistoryIconName;
  color: string;
  background: string;
  prominence: TicketHistoryProminence;
  category: 'create' | 'assign' | 'work' | 'wait' | 'solution' | 'close' | 'cancel';
};

export type TicketHistoryCopy = {
  headline: string;
  detail?: string;
  role: TicketHistoryRole;
  roleLabel: string;
  authorName: string;
  initials: string;
};

export type TicketHistoryDayGroup = {
  key: string;
  label: string;
  events: TicketHistoryEventData[];
};

const ROLE_LABEL: Record<TicketHistoryRole, string> = {
  funcionario: 'Funcionario',
  tecnico: 'Técnico',
  lider: 'Líder',
  sistema: 'Sistema',
};

const ACTION_VERB: Record<string, string> = {
  created: 'registró la solicitud',
  assigned: 'asignó un técnico',
  reassigned: 'reasignó el caso',
  started: 'inició la atención',
  updated: 'agregó una actualización',
  waiting_for_requester: 'pidió más información',
  partial_solution: 'registró un avance',
  resolved: 'marcó el caso como resuelto',
  reopened: 'reabrió el caso',
  closed: 'confirmó que quedó resuelto',
  cancelled: 'canceló la solicitud',
  requester_reply: 'respondió con información',
};

const VISUAL_BY_TYPE: Record<string, Omit<TicketHistoryVisual, 'color' | 'background'>> = {
  created: { icon: 'file-text', prominence: 'prominent', category: 'create' },
  assigned: { icon: 'user-plus', prominence: 'compact', category: 'assign' },
  reassigned: { icon: 'refresh-cw', prominence: 'compact', category: 'assign' },
  started: { icon: 'play-circle', prominence: 'compact', category: 'work' },
  updated: { icon: 'message-circle', prominence: 'compact', category: 'work' },
  requester_reply: { icon: 'message-circle', prominence: 'compact', category: 'work' },
  waiting_for_requester: { icon: 'clock', prominence: 'prominent', category: 'wait' },
  partial_solution: { icon: 'tool', prominence: 'compact', category: 'solution' },
  resolved: { icon: 'check-circle', prominence: 'prominent', category: 'solution' },
  reopened: { icon: 'rotate-ccw', prominence: 'prominent', category: 'wait' },
  closed: { icon: 'flag', prominence: 'prominent', category: 'close' },
  cancelled: { icon: 'x-circle', prominence: 'prominent', category: 'cancel' },
};

const FALLBACK_SHAPE: Omit<TicketHistoryVisual, 'color' | 'background'> = {
  icon: 'message-circle',
  prominence: 'compact',
  category: 'work',
};

export function getEventVisual(type: string): TicketHistoryVisual {
  const shape = VISUAL_BY_TYPE[type] ?? FALLBACK_SHAPE;
  const paint = getTicketStatePaint(getEventStateKey(type), { variant: 'tint' });
  return {
    ...shape,
    color: paint.accent,
    background: paint.tintBackground,
  };
}

export function inferEventRole(type: string, authorName?: string): TicketHistoryRole {
  if (!authorName?.trim()) return 'sistema';
  if (type === 'created' || type === 'reopened' || type === 'closed' || type === 'requester_reply') {
    return 'funcionario';
  }
  if (type === 'assigned' || type === 'reassigned' || type === 'cancelled') return 'lider';
  return 'tecnico';
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function normalizeMessage(value: string): string {
  return value.trim().replace(/\.+$/, '').toLowerCase();
}

function remainingMessage(type: string, message: string): string | undefined {
  const trimmed = message.trim();
  if (!trimmed) return undefined;
  const generic = GENERIC_EVENT_MESSAGES[type];
  if (!generic) return trimmed;
  if (normalizeMessage(trimmed) === normalizeMessage(generic)) return undefined;
  const genericCore = generic.trim().replace(/\.+$/, '');
  if (trimmed.toLowerCase().startsWith(genericCore.toLowerCase())) {
    const rest = trimmed.slice(genericCore.length).replace(/^[.\s]+/, '').trim();
    return rest || undefined;
  }
  return trimmed;
}

export function buildEventCopy(event: TicketHistoryEventData): TicketHistoryCopy {
  const authorName = event.authorName?.trim() || 'Sistema';
  const role = inferEventRole(event.type, event.authorName);
  const verb = ACTION_VERB[event.type] ?? 'actualizó el caso';
  const headline = `${authorName} ${verb}`;
  const extras: string[] = [];
  const extraMessage = remainingMessage(event.type, event.message ?? '');
  if (extraMessage) extras.push(extraMessage);
  if (event.nextAction?.trim()) {
    extras.push(`Siguiente paso: ${event.nextAction.trim()}`);
  }
  return {
    headline,
    detail: extras.length > 0 ? extras.join('\n') : undefined,
    role,
    roleLabel: ROLE_LABEL[role],
    authorName,
    initials: initialsFromName(authorName),
  };
}

export function parseEventDate(raw?: string): Date | null {
  if (!raw?.trim()) return null;
  const parsed = Date.parse(raw.trim());
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

export function formatEventTime(raw?: string): string {
  const date = parseEventDate(raw);
  if (!date) return '';
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatDayLabel(date: Date, now: Date): string {
  const day = startOfLocalDay(date);
  const today = startOfLocalDay(now);
  const yesterday = today - 24 * 60 * 60 * 1000;
  if (day === today) return 'Hoy';
  if (day === yesterday) return 'Ayer';
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function sortEventsChronologically(events: TicketHistoryEventData[]): TicketHistoryEventData[] {
  return [...events].sort((left, right) => {
    const leftTime = parseEventDate(left.createdAt)?.getTime() ?? 0;
    const rightTime = parseEventDate(right.createdAt)?.getTime() ?? 0;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return (left.id ?? '').localeCompare(right.id ?? '');
  });
}

/**
 * Agrupa eventos por día local. Los grupos van del más reciente al más antiguo;
 * dentro de cada día el orden es cronológico (de lo primero a lo último).
 */
export function groupEventsByDate(
  events: TicketHistoryEventData[],
  now: Date = new Date(),
): TicketHistoryDayGroup[] {
  const groups = new Map<string, TicketHistoryDayGroup>();
  for (const event of sortEventsChronologically(events)) {
    const date = parseEventDate(event.createdAt);
    const key = date ? dayKey(date) : 'sin-fecha';
    const existing = groups.get(key);
    if (existing) {
      existing.events.push(event);
      continue;
    }
    groups.set(key, {
      key,
      label: date ? formatDayLabel(date, now) : 'Sin fecha',
      events: [event],
    });
  }
  return [...groups.values()].sort((left, right) => {
    if (left.key === 'sin-fecha') return 1;
    if (right.key === 'sin-fecha') return -1;
    return right.key.localeCompare(left.key);
  });
}

export function visibleEventsWindow(
  events: TicketHistoryEventData[],
  expanded: boolean,
  limit = TICKET_HISTORY_INITIAL_VISIBLE,
): { visible: TicketHistoryEventData[]; hiddenCount: number } {
  const chronological = sortEventsChronologically(events);
  if (expanded || chronological.length <= limit) {
    return { visible: chronological, hiddenCount: 0 };
  }
  return {
    visible: chronological.slice(-limit),
    hiddenCount: chronological.length - limit,
  };
}

export function attachContextualEvidence(
  events: TicketHistoryEventData[],
  extras?: { incidentPhotoUrl?: string; solutionEvidenceUrl?: string },
): TicketHistoryEventData[] {
  const cloned = events.map((event) => ({
    ...event,
    attachment: event.attachment ? { ...event.attachment } : undefined,
  }));
  const created = cloned.find((event) => event.type === 'created' && !event.attachment?.url);
  if (created && extras?.incidentPhotoUrl) {
    created.attachment = {
      url: extras.incidentPhotoUrl,
      filename: created.attachment?.filename ?? 'Evidencia del incidente',
    };
  }
  const lastSolution = [...cloned]
    .reverse()
    .find(
      (event) =>
        (event.type === 'resolved' || event.type === 'partial_solution') && !event.attachment?.url,
    );
  if (lastSolution && extras?.solutionEvidenceUrl) {
    lastSolution.attachment = {
      url: extras.solutionEvidenceUrl,
      filename: lastSolution.attachment?.filename ?? 'Evidencia de la solución',
    };
  }
  return cloned;
}

export function isImageAttachment(attachment?: TicketHistoryAttachment): boolean {
  if (!attachment?.url) return false;
  const hint = `${attachment.filename ?? ''} ${attachment.url}`.toLowerCase();
  if (/\.(jpe?g|png|gif|webp|heic|heif|bmp)(\?|$)/.test(hint)) return true;
  if (attachment.filename && /\.(pdf|docx?|xlsx?|zip|txt)(\?|$)/i.test(attachment.filename)) {
    return false;
  }
  return Boolean(attachment.url);
}

export function eventAccessibilityLabel(
  event: TicketHistoryEventData,
  copy: TicketHistoryCopy,
): string {
  const time = formatEventTime(event.createdAt);
  const parts = [copy.headline, copy.roleLabel];
  if (time) parts.push(time);
  if (copy.detail) parts.push(copy.detail);
  if (event.attachment?.url) parts.push('Incluye evidencia');
  return parts.join('. ');
}
