import { describe, expect, it } from 'vitest';
import {
  buildHomeInsight,
  firstNameFrom,
  getTimeBasedGreeting,
  historialChipForMetric,
  initialsFromName,
  pickHomeAttention,
} from './home-model';
import type { SolicitudSummary } from '@/shared/contracts/solicitud';

function item(partial: Partial<SolicitudSummary> & Pick<SolicitudSummary, 'id' | 'status'>): SolicitudSummary {
  return {
    caseCode: partial.caseCode ?? `CASE-${partial.id}`,
    description: partial.description ?? 'Incidente',
    createdAtRaw: partial.createdAtRaw ?? '07-09-2026 12:00',
    displayStatus: partial.displayStatus ?? partial.status,
    workflowVersion: 2,
    ...partial,
  };
}

describe('home-model greeting', () => {
  it('cambia el saludo por tramo horario', () => {
    expect(getTimeBasedGreeting(new Date(2026, 8, 7, 8))).toBe('Buenos días');
    expect(getTimeBasedGreeting(new Date(2026, 8, 7, 15))).toBe('Buenas tardes');
    expect(getTimeBasedGreeting(new Date(2026, 8, 7, 22))).toBe('Buenas noches');
  });

  it('extrae nombre e iniciales', () => {
    expect(firstNameFrom('War Room Funcionario')).toBe('War');
    expect(initialsFromName('War Room Funcionario')).toBe('WF');
    expect(firstNameFrom('')).toBe('Funcionario');
  });
});

describe('home-model insight', () => {
  it('separa por asignar, en proceso y cerradas como los filtros de Casos', () => {
    const insight = buildHomeInsight([
      item({ id: '1', status: 'nuevo' }),
      item({ id: '2', status: 'en_progreso' }),
      item({ id: '3', status: 'esperando_usuario' }),
      item({ id: '4', status: 'resuelto' }),
      item({ id: '5', status: 'cerrado' }),
    ]);
    expect(insight).toMatchObject({
      unassigned: 1,
      inProgress: 3,
      yourTurn: 2,
      closed: 1,
      total: 5,
    });
    expect(insight.progress).toBe(0.2);
    expect(insight.scanLine).toBe('2 casos esperan tu acción.');
  });

  it('describe el vacío sin métricas inventadas', () => {
    expect(buildHomeInsight([]).scanLine).toContain('incidente');
    expect(buildHomeInsight([]).progress).toBe(0);
  });

  it('cuenta canceladas como cerradas, no como turno del funcionario', () => {
    const insight = buildHomeInsight([
      item({ id: '1', status: 'cancelado' }),
      item({ id: '2', status: 'cerrado' }),
    ]);
    expect(insight).toMatchObject({ closed: 2, yourTurn: 0, inProgress: 0, unassigned: 0, total: 2 });
    expect(insight.progress).toBe(1);
  });

  it('abre Casos con el filtro del mosaico', () => {
    expect(historialChipForMetric('unassigned')).toBe('Pendientes de asignación');
    expect(historialChipForMetric('inProgress')).toBe('En proceso');
    expect(historialChipForMetric('closed')).toBe('Resueltas');
  });
});

describe('home-model attention', () => {
  it('prioriza responder sobre confirmar', () => {
    const attention = pickHomeAttention([
      item({ id: 'c', status: 'resuelto', caseCode: '2026-09-00004' }),
      item({ id: 'w', status: 'esperando_usuario', caseCode: '2026-09-00003' }),
    ]);
    expect(attention?.kind).toBe('reply');
    expect(attention?.itemId).toBe('w');
    expect(attention?.cta).toBe('Responder');
  });

  it('pide confirmar si no hay espera de información', () => {
    const attention = pickHomeAttention([item({ id: 'c', status: 'resuelto', caseCode: '2026-09-00004' })]);
    expect(attention?.kind).toBe('confirm');
    expect(attention?.cta).toBe('Revisar');
  });
});
