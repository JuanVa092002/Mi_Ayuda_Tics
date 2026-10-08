import type { IconName } from '@/shared/ui/Icon';

export type TicketStateVariant = 'solid' | 'outline' | 'tint';
export type TicketStatePriority = 'high' | 'medium' | 'low';
export type TicketStateSize = 'small' | 'medium' | 'large';
export type ColorSchemeName = 'light' | 'dark';

export type TicketStateKey =
  | 'nuevo'
  | 'asignado'
  | 'en_progreso'
  | 'pendiente'
  | 'esperando_usuario'
  | 'resuelto'
  | 'cerrado'
  | 'cancelado'
  | 'bloqueado'
  | 'en_espera_proveedor'
  | 'reabierta'
  | 'escalado'
  | 'legacy';

export type TicketStateConfig = {
  key: TicketStateKey;
  label: string;
  compactLabel: string;
  colorHex: string;
  icon: IconName;
  variant: TicketStateVariant;
  priority: TicketStatePriority;
  requiresUserAction: boolean;
};

export type TicketStatePaint = {
  background: string;
  border: string;
  text: string;
  icon: string;
  accent: string;
  tintBackground: string;
};

type Identity = {
  hex: string;
  solidBg: string;
  solidFg: string;
  outlineFg: string;
  tintFg: string;
  tintBg: string;
  darkTintBg: string;
  darkTintFg: string;
};

/**
 * Identity hexes are the semantic brand of each state.
 * solidFg / outlineFg / tintFg are paired for WCAG AA 4.5:1 on their surfaces.
 * Bright fills (#FF9500, #34C759, #0088FF, #FF3B30) use dark text instead of white.
 */
const IDENTITY = {
  navy: {
    hex: '#04324D',
    solidBg: '#04324D',
    solidFg: '#FFFFFF',
    outlineFg: '#04324D',
    tintFg: '#04324D',
    tintBg: '#E0E6E9',
    darkTintBg: '#0D2533',
    darkTintFg: '#D6E4EC',
  },
  blue: {
    hex: '#0066CC',
    solidBg: '#0066CC',
    solidFg: '#FFFFFF',
    outlineFg: '#0066CC',
    tintFg: '#0066CC',
    tintBg: '#E0ECF8',
    darkTintBg: '#0A2A4D',
    darkTintFg: '#B3D4F5',
  },
  sky: {
    hex: '#0088FF',
    solidBg: '#0088FF',
    solidFg: '#1C1C1E',
    outlineFg: '#0055B8',
    tintFg: '#0055B8',
    tintBg: '#E0F0FF',
    darkTintBg: '#0A2A4A',
    darkTintFg: '#9CC9FF',
  },
  orange: {
    hex: '#FF9500',
    solidBg: '#FF9500',
    solidFg: '#1C1C1E',
    outlineFg: '#7A3E00',
    tintFg: '#7A3E00',
    tintBg: '#FFF2E0',
    darkTintBg: '#3D2800',
    darkTintFg: '#FFD79A',
  },
  green: {
    hex: '#34C759',
    solidBg: '#34C759',
    solidFg: '#1C1C1E',
    outlineFg: '#1B7A38',
    tintFg: '#1B7A38',
    tintBg: '#E6F8EB',
    darkTintBg: '#0E2F18',
    darkTintFg: '#8EE0A4',
  },
  grey: {
    hex: '#8E8E93',
    solidBg: '#8E8E93',
    solidFg: '#1C1C1E',
    outlineFg: '#3A3A3C',
    tintFg: '#3A3A3C',
    tintBg: '#F1F1F2',
    darkTintBg: '#2C2C2E',
    darkTintFg: '#C7C7CC',
  },
  red: {
    hex: '#FF3B30',
    solidBg: '#FF3B30',
    solidFg: '#1C1C1E',
    outlineFg: '#C92A2A',
    tintFg: '#C92A2A',
    tintBg: '#FFE7E6',
    darkTintBg: '#3D1210',
    darkTintFg: '#FFB4AE',
  },
  purple: {
    hex: '#AF52DE',
    solidBg: '#7A28B0',
    solidFg: '#FFFFFF',
    outlineFg: '#7A28B0',
    tintFg: '#7A28B0',
    tintBg: '#F5EAFB',
    darkTintBg: '#2C1238',
    darkTintFg: '#E0B8F5',
  },
  crimson: {
    hex: '#C92A2A',
    solidBg: '#C92A2A',
    solidFg: '#FFFFFF',
    outlineFg: '#C92A2A',
    tintFg: '#C92A2A',
    tintBg: '#F8E5E5',
    darkTintBg: '#3A1010',
    darkTintFg: '#F5B0B0',
  },
} as const satisfies Record<string, Identity>;

export const TICKET_STATES: Record<TicketStateKey, TicketStateConfig> = {
  nuevo: {
    key: 'nuevo',
    label: 'Enviada',
    compactLabel: 'Enviada',
    colorHex: IDENTITY.navy.hex,
    icon: 'file-text',
    variant: 'outline',
    priority: 'medium',
    requiresUserAction: false,
  },
  asignado: {
    key: 'asignado',
    label: 'Técnico asignado',
    compactLabel: 'Asignada',
    colorHex: IDENTITY.blue.hex,
    icon: 'user',
    variant: 'outline',
    priority: 'medium',
    requiresUserAction: false,
  },
  en_progreso: {
    key: 'en_progreso',
    label: 'En atención',
    compactLabel: 'En atención',
    colorHex: IDENTITY.sky.hex,
    icon: 'tool',
    variant: 'outline',
    priority: 'medium',
    requiresUserAction: false,
  },
  pendiente: {
    key: 'pendiente',
    label: 'Seguimiento pendiente',
    compactLabel: 'En seguimiento',
    colorHex: IDENTITY.blue.hex,
    icon: 'activity',
    variant: 'tint',
    priority: 'medium',
    requiresUserAction: false,
  },
  esperando_usuario: {
    key: 'esperando_usuario',
    label: 'Requiere tu información',
    compactLabel: 'Falta info',
    colorHex: IDENTITY.orange.hex,
    icon: 'alert-triangle',
    variant: 'solid',
    priority: 'high',
    requiresUserAction: true,
  },
  resuelto: {
    key: 'resuelto',
    label: 'Solución aplicada',
    compactLabel: 'Por confirmar',
    colorHex: IDENTITY.green.hex,
    icon: 'check-circle',
    variant: 'solid',
    priority: 'high',
    requiresUserAction: true,
  },
  cerrado: {
    key: 'cerrado',
    label: 'Cerrada',
    compactLabel: 'Cerrada',
    colorHex: IDENTITY.grey.hex,
    icon: 'flag',
    variant: 'tint',
    priority: 'low',
    requiresUserAction: false,
  },
  cancelado: {
    key: 'cancelado',
    label: 'Cancelada',
    compactLabel: 'Cancelada',
    colorHex: IDENTITY.red.hex,
    icon: 'x-circle',
    variant: 'tint',
    priority: 'low',
    requiresUserAction: false,
  },
  bloqueado: {
    key: 'bloqueado',
    label: 'Bloqueado',
    compactLabel: 'Bloqueado',
    colorHex: IDENTITY.red.hex,
    icon: 'slash',
    variant: 'solid',
    priority: 'high',
    requiresUserAction: true,
  },
  en_espera_proveedor: {
    key: 'en_espera_proveedor',
    label: 'Espera de tercero',
    compactLabel: 'Tercero',
    colorHex: IDENTITY.orange.hex,
    icon: 'clock',
    variant: 'outline',
    priority: 'medium',
    requiresUserAction: false,
  },
  reabierta: {
    key: 'reabierta',
    label: 'Reabierta',
    compactLabel: 'Reabierta',
    colorHex: IDENTITY.purple.hex,
    icon: 'rotate-ccw',
    variant: 'outline',
    priority: 'medium',
    requiresUserAction: false,
  },
  escalado: {
    key: 'escalado',
    label: 'Escalado',
    compactLabel: 'Escalado',
    colorHex: IDENTITY.crimson.hex,
    icon: 'arrow-up',
    variant: 'solid',
    priority: 'high',
    requiresUserAction: true,
  },
  legacy: {
    key: 'legacy',
    label: 'En seguimiento',
    compactLabel: 'En seguimiento',
    colorHex: IDENTITY.grey.hex,
    icon: 'help-circle',
    variant: 'tint',
    priority: 'low',
    requiresUserAction: false,
  },
};

const IDENTITY_BY_KEY: Record<TicketStateKey, Identity> = {
  nuevo: IDENTITY.navy,
  asignado: IDENTITY.blue,
  en_progreso: IDENTITY.sky,
  pendiente: IDENTITY.blue,
  esperando_usuario: IDENTITY.orange,
  resuelto: IDENTITY.green,
  cerrado: IDENTITY.grey,
  cancelado: IDENTITY.red,
  bloqueado: IDENTITY.red,
  en_espera_proveedor: IDENTITY.orange,
  reabierta: IDENTITY.purple,
  escalado: IDENTITY.crimson,
  legacy: IDENTITY.grey,
};

export function resolveTicketStateKey(
  status: string,
  workflowVersion?: number | null,
): TicketStateKey {
  if (status === 'solicitado' || status === 'nuevo') return 'nuevo';
  if (status === 'finalizado' || status === 'cerrado' || status === 'cerrado_legacy') return 'cerrado';
  if (status === 'pendiente') return 'pendiente';
  if (status === 'en_progreso_legacy') return 'en_progreso';
  if (status === 'asignado' && workflowVersion !== 2) return 'en_progreso';
  if (status in TICKET_STATES) return status as TicketStateKey;
  return 'legacy';
}

export function getTicketStateConfig(
  status: string,
  workflowVersion?: number | null,
): TicketStateConfig {
  return TICKET_STATES[resolveTicketStateKey(status, workflowVersion)];
}

function paintFor(
  identity: Identity,
  variant: TicketStateVariant,
  scheme: ColorSchemeName,
): TicketStatePaint {
  const tintBackground = scheme === 'dark' ? identity.darkTintBg : identity.tintBg;
  const tintFg = scheme === 'dark' ? identity.darkTintFg : identity.tintFg;
  const outlineFg = scheme === 'dark' ? identity.darkTintFg : identity.outlineFg;

  if (variant === 'solid') {
    return {
      background: identity.solidBg,
      border: identity.solidBg,
      text: identity.solidFg,
      icon: identity.solidFg,
      accent: identity.hex,
      tintBackground,
    };
  }
  if (variant === 'outline') {
    return {
      background: 'transparent',
      border: identity.hex,
      text: outlineFg,
      icon: outlineFg,
      accent: identity.hex,
      tintBackground,
    };
  }
  return {
    background: tintBackground,
    border: tintBackground,
    text: tintFg,
    icon: tintFg,
    accent: identity.hex,
    tintBackground,
  };
}

export function getTicketStatePaint(
  status: string,
  options?: {
    workflowVersion?: number | null;
    variant?: TicketStateVariant;
    scheme?: ColorSchemeName;
  },
): TicketStatePaint {
  const config = getTicketStateConfig(status, options?.workflowVersion);
  return paintFor(
    IDENTITY_BY_KEY[config.key],
    options?.variant ?? config.variant,
    options?.scheme ?? 'light',
  );
}

export const EVENT_TYPE_TO_STATE: Record<string, TicketStateKey> = {
  created: 'nuevo',
  assigned: 'asignado',
  reassigned: 'asignado',
  started: 'en_progreso',
  updated: 'en_progreso',
  requester_reply: 'nuevo',
  waiting_for_requester: 'esperando_usuario',
  partial_solution: 'en_progreso',
  resolved: 'resuelto',
  reopened: 'reabierta',
  closed: 'cerrado',
  cancelled: 'cancelado',
};

export function getEventStateKey(eventType: string): TicketStateKey {
  return EVENT_TYPE_TO_STATE[eventType] ?? 'legacy';
}
