import { describe, expect, it } from 'vitest';
import { getTicketStatePaint } from '@/shared/ui/ticket-state';
import {
  TICKET_HISTORY_INITIAL_VISIBLE,
  attachContextualEvidence,
  buildEventCopy,
  formatDayLabel,
  getEventVisual,
  groupEventsByDate,
  inferEventRole,
  initialsFromName,
  isImageAttachment,
  visibleEventsWindow,
  type TicketHistoryEventData,
} from './ticket-history-model';

const now = new Date(2026, 8, 7, 15, 0, 0);

function event(partial: Partial<TicketHistoryEventData> & Pick<TicketHistoryEventData, 'type'>): TicketHistoryEventData {
  return {
    id: partial.id ?? partial.type,
    message: partial.message ?? '',
    createdAt: partial.createdAt,
    authorName: partial.authorName,
    attachment: partial.attachment,
    nextAction: partial.nextAction,
    type: partial.type,
  };
}

describe('ticket-history visual language', () => {
  it('marca creación, solución y cierre como prominentes', () => {
    expect(getEventVisual('created').prominence).toBe('prominent');
    expect(getEventVisual('resolved').prominence).toBe('prominent');
    expect(getEventVisual('closed').prominence).toBe('prominent');
    expect(getEventVisual('cancelled').prominence).toBe('prominent');
    expect(getEventVisual('updated').prominence).toBe('compact');
    expect(getEventVisual('started').prominence).toBe('compact');
  });

  it('usa la paleta de estados del ticket, no un verde genérico', () => {
    expect(getEventVisual('created').color).toBe(getTicketStatePaint('nuevo').accent);
    expect(getEventVisual('assigned').color).toBe(getTicketStatePaint('asignado').accent);
    expect(getEventVisual('resolved').color).toBe(getTicketStatePaint('resuelto').accent);
    expect(getEventVisual('waiting_for_requester').color).toBe(getTicketStatePaint('esperando_usuario').accent);
    expect(getEventVisual('cancelled').color).toBe(getTicketStatePaint('cancelado').accent);
    expect(getEventVisual('closed').color).toBe(getTicketStatePaint('cerrado').accent);
    expect(getEventVisual('started').color).toBe(getTicketStatePaint('en_progreso').accent);
  });

  it('asigna un icono distinto a cada tipo de evento', () => {
    const types = [
      'created',
      'assigned',
      'reassigned',
      'started',
      'updated',
      'waiting_for_requester',
      'partial_solution',
      'resolved',
      'reopened',
      'closed',
      'cancelled',
    ];
    const icons = types.map((type) => getEventVisual(type).icon);
    expect(new Set(icons).size).toBe(types.length);
  });
});

describe('ticket-history copy', () => {
  it('arma el headline como autor + acción y oculta el mensaje genérico', () => {
    const copy = buildEventCopy(
      event({
        type: 'created',
        message: 'Solicitud registrada.',
        authorName: 'Ana Pérez',
      }),
    );
    expect(copy.headline).toBe('Ana Pérez registró la solicitud');
    expect(copy.detail).toBeUndefined();
    expect(copy.roleLabel).toBe('Funcionario');
    expect(copy.initials).toBe('AP');
  });

  it('muestra el mensaje personalizado como detalle', () => {
    const copy = buildEventCopy(
      event({
        type: 'updated',
        message: 'Reinicié el switch del laboratorio.',
        authorName: 'Carlos Técnico',
      }),
    );
    expect(copy.headline).toBe('Carlos Técnico agregó una actualización');
    expect(copy.detail).toBe('Reinicié el switch del laboratorio.');
    expect(copy.roleLabel).toBe('Técnico');
  });

  it('deja solo el motivo cuando el API concatena el mensaje genérico', () => {
    const copy = buildEventCopy(
      event({
        type: 'cancelled',
        message: 'La solicitud fue cancelada. Motivo: Cierre E2E mobile rebuild.',
        authorName: 'Administrador Lider TIC',
      }),
    );
    expect(copy.headline).toBe('Administrador Lider TIC canceló la solicitud');
    expect(copy.detail).toBe('Motivo: Cierre E2E mobile rebuild.');
  });

  it('infiere el rol por tipo cuando no hay autor', () => {
    expect(inferEventRole('assigned', 'Líder QA')).toBe('lider');
    expect(inferEventRole('assigned')).toBe('sistema');
    expect(initialsFromName('Sistema')).toBe('SI');
  });
});

describe('ticket-history grouping', () => {
  it('agrupa en Hoy, Ayer y fecha específica con el día reciente primero', () => {
    const groups = groupEventsByDate(
      [
        event({
          id: 'old',
          type: 'created',
          createdAt: new Date(2026, 8, 1, 9).toISOString(),
        }),
        event({
          id: 'yesterday',
          type: 'assigned',
          createdAt: new Date(2026, 8, 6, 18).toISOString(),
        }),
        event({
          id: 'today-late',
          type: 'resolved',
          createdAt: new Date(2026, 8, 7, 14).toISOString(),
        }),
        event({
          id: 'today-early',
          type: 'started',
          createdAt: new Date(2026, 8, 7, 8).toISOString(),
        }),
      ],
      now,
    );

    expect(groups.map((group) => group.label)).toEqual([
      'Hoy',
      'Ayer',
      formatDayLabel(new Date(2026, 8, 1, 9), now),
    ]);
    expect(groups[0]?.events.map((item) => item.id)).toEqual(['today-early', 'today-late']);
  });

  it('limita los eventos visibles a los más recientes', () => {
    const events = Array.from({ length: TICKET_HISTORY_INITIAL_VISIBLE + 5 }, (_, index) =>
      event({
        id: `e${index}`,
        type: 'updated',
        createdAt: new Date(2026, 8, 7, 8, index).toISOString(),
      }),
    );
    const collapsed = visibleEventsWindow(events, false);
    expect(collapsed.hiddenCount).toBe(5);
    expect(collapsed.visible).toHaveLength(TICKET_HISTORY_INITIAL_VISIBLE);
    expect(collapsed.visible[0]?.id).toBe('e5');
    expect(visibleEventsWindow(events, true).hiddenCount).toBe(0);
  });
});

describe('ticket-history evidence', () => {
  it('engancha la foto del incidente al evento created si no hay adjunto', () => {
    const [created] = attachContextualEvidence(
      [event({ type: 'created', message: 'Solicitud registrada.' })],
      { incidentPhotoUrl: 'https://cdn.example/incidente.jpg' },
    );
    expect(created?.attachment?.url).toBe('https://cdn.example/incidente.jpg');
  });

  it('no pisa un adjunto que ya vino en el evento', () => {
    const [created] = attachContextualEvidence(
      [
        event({
          type: 'created',
          attachment: { url: 'https://cdn.example/propia.jpg', filename: 'propia.jpg' },
        }),
      ],
      { incidentPhotoUrl: 'https://cdn.example/incidente.jpg' },
    );
    expect(created?.attachment?.url).toBe('https://cdn.example/propia.jpg');
  });

  it('detecta imágenes vs archivos', () => {
    expect(isImageAttachment({ url: 'https://x/a.png', filename: 'a.png' })).toBe(true);
    expect(isImageAttachment({ url: 'https://x/informe.pdf', filename: 'informe.pdf' })).toBe(false);
  });
});
