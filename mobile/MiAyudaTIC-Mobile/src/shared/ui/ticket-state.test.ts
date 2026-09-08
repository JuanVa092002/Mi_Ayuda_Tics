import { describe, expect, it } from 'vitest';
import {
  EVENT_TYPE_TO_STATE,
  TICKET_STATES,
  getTicketStateConfig,
  getTicketStatePaint,
  resolveTicketStateKey,
  type TicketStateKey,
  type TicketStatePaint,
} from './ticket-state';

function channel(hex: string, offset: number): number {
  return parseInt(hex.slice(offset, offset + 2), 16) / 255;
}

function linearize(channelValue: number): number {
  return channelValue <= 0.04045 ? channelValue / 12.92 : ((channelValue + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = linearize(channel(value, 0));
  const g = linearize(channel(value, 2));
  const b = linearize(channel(value, 4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function opaqueBackground(paint: TicketStatePaint): string {
  return paint.background === 'transparent' ? '#FFFFFF' : paint.background;
}

describe('ticket-state keys', () => {
  it('mapea v1 al equivalente visual de v2 sin mezclar asignado v1 y v2', () => {
    expect(resolveTicketStateKey('solicitado', 1)).toBe('nuevo');
    expect(resolveTicketStateKey('asignado', 1)).toBe('en_progreso');
    expect(resolveTicketStateKey('asignado', 2)).toBe('asignado');
    expect(resolveTicketStateKey('pendiente', 1)).toBe('pendiente');
    expect(resolveTicketStateKey('finalizado', 1)).toBe('cerrado');
  });

  it('no reutiliza el mismo hex entre estados v2 distintos salvo pendiente/asignado (misma familia azul claro, distinta variante)', () => {
    const v2: TicketStateKey[] = [
      'nuevo',
      'asignado',
      'en_progreso',
      'esperando_usuario',
      'resuelto',
      'cerrado',
      'cancelado',
    ];
    const hexes = v2.map((key) => TICKET_STATES[key].colorHex);
    expect(new Set(hexes).size).toBe(v2.length);
  });

  it('marca acción de usuario solo en espera y confirmación', () => {
    expect(getTicketStateConfig('esperando_usuario').requiresUserAction).toBe(true);
    expect(getTicketStateConfig('resuelto').requiresUserAction).toBe(true);
    expect(getTicketStateConfig('nuevo').requiresUserAction).toBe(false);
    expect(getTicketStateConfig('cerrado').requiresUserAction).toBe(false);
  });

  it('usa sólido en urgentes, outline en activos y tint en terminales', () => {
    expect(TICKET_STATES.esperando_usuario.variant).toBe('solid');
    expect(TICKET_STATES.resuelto.variant).toBe('solid');
    expect(TICKET_STATES.en_progreso.variant).toBe('outline');
    expect(TICKET_STATES.nuevo.variant).toBe('outline');
    expect(TICKET_STATES.cerrado.variant).toBe('tint');
    expect(TICKET_STATES.cancelado.variant).toBe('tint');
  });
});

describe('ticket-state accessibility', () => {
  it('mantiene contraste de texto ≥ 4.5:1 en light para cada estado y variante', () => {
    const keys = Object.keys(TICKET_STATES) as TicketStateKey[];
    for (const key of keys) {
      for (const variant of ['solid', 'outline', 'tint'] as const) {
        const paint = getTicketStatePaint(key, { variant, scheme: 'light' });
        const ratio = contrastRatio(paint.text, opaqueBackground(paint));
        expect(ratio, `${key} ${variant} ${paint.text} on ${opaqueBackground(paint)}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('mantiene contraste de texto ≥ 4.5:1 en dark para cada estado y variante', () => {
    const keys = Object.keys(TICKET_STATES) as TicketStateKey[];
    for (const key of keys) {
      for (const variant of ['solid', 'outline', 'tint'] as const) {
        const paint = getTicketStatePaint(key, { variant, scheme: 'dark' });
        const background = paint.background === 'transparent' ? '#000000' : paint.background;
        const ratio = contrastRatio(paint.text, background);
        expect(ratio, `${key} ${variant} dark`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('ticket-state event mapping', () => {
  it('alinea el timeline con el color del estado del ticket', () => {
    expect(EVENT_TYPE_TO_STATE.waiting_for_requester).toBe('esperando_usuario');
    expect(getTicketStatePaint('esperando_usuario').accent).toBe('#FF9500');
    expect(getTicketStatePaint('cerrado').accent).toBe('#8E8E93');
    expect(getTicketStatePaint('cancelado').accent).toBe('#FF3B30');
    expect(getTicketStatePaint('resuelto').accent).toBe('#34C759');
    expect(getTicketStatePaint('nuevo').accent).toBe('#04324D');
  });
});
