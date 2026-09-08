import { describe, expect, it } from 'vitest';
import {
  buildTecnicoInsight,
  casosForQueue,
  ctaForCaso,
  ctaForQueue,
  firstNameFrom,
  mosaicCount,
  pickNextWork,
  queuesForFocus,
  relativeWaitLabel,
  sectionTitleForQueue,
} from './home-model';
import type { CasoSummary } from '@/shared/contracts/caso';

function item(partial: Partial<CasoSummary> & Pick<CasoSummary, 'id' | 'status'>): CasoSummary {
  return {
    caseCode: partial.caseCode ?? `2026-09-${partial.id}`,
    description: partial.description ?? 'Incidente',
    createdAtRaw: partial.createdAtRaw ?? '07-09-2026 12:00',
    displayStatus: partial.displayStatus ?? partial.status,
    workflowVersion: 2,
    ...partial,
  };
}

describe('tecnico home-model', () => {
  it('prioriza iniciar sobre continuar', () => {
    const assigned = [
      item({ id: 'a', status: 'en_progreso' }),
      item({ id: 'b', status: 'asignado', caseCode: '2026-09-00010' }),
    ];
    const next = pickNextWork(assigned);
    expect(next?.item.id).toBe('b');
    expect(next?.cta).toBe('Iniciar atención');
    expect(next?.startOnPress).toBe(true);
  });

  it('cuenta colas v2 sin mezclar esperas con trabajo activo', () => {
    const insight = buildTecnicoInsight([
      item({ id: '1', status: 'asignado' }),
      item({ id: '2', status: 'en_progreso' }),
      item({ id: '3', status: 'esperando_usuario' }),
      item({ id: '4', status: 'resuelto' }),
    ]);
    expect(insight).toMatchObject({
      porIniciar: 1,
      enAtencion: 1,
      esperandoFuncionario: 1,
      esperandoConfirmacion: 1,
      openTotal: 4,
    });
    expect(insight.scanLine).toBe('1 caso por iniciar.');
    expect(casosForQueue([item({ id: '1', status: 'asignado' })], 'por_iniciar')).toHaveLength(1);
  });

  it('describe la cola vacía sin inventar trabajo', () => {
    expect(buildTecnicoInsight([]).scanLine).toBe('No hay casos en tu cola.');
    expect(buildTecnicoInsight([], [item({ id: 'c', status: 'cerrado' })]).scanLine).toBe('Cola al día.');
  });

  it('expone CTA de 1 tap por cola y espera relativa', () => {
    expect(ctaForQueue('por_iniciar')).toEqual({ label: 'Iniciar atención', action: 'start' });
    expect(ctaForQueue('en_atencion').action).toBe('update');
    expect(ctaForQueue('esperando_funcionario').label).toBe('Ver respuesta');
    const insight = buildTecnicoInsight([
      item({ id: '1', status: 'asignado' }),
      item({ id: '2', status: 'esperando_usuario' }),
      item({ id: '3', status: 'resuelto' }),
    ]);
    expect(mosaicCount(insight, 'esperandole')).toBe(2);
    expect(relativeWaitLabel('07-09-2026 12:00', new Date(2026, 8, 7, 14, 0))).toBe('Esperando desde hace 2 h');
    expect(queuesForFocus('esperandole')).toEqual(['esperando_funcionario', 'esperando_confirmacion']);
    expect(sectionTitleForQueue('por_iniciar', 5)).toBe('Por hacer (5)');
    expect(firstNameFrom('Ana María Ruiz')).toBe('Ana');
  });

  it('no ofrece iniciar ni actualizar en tickets del flujo anterior', () => {
    const v1Pendiente = item({ id: 'v1', status: 'pendiente', workflowVersion: 1 });
    const v1Asignado = item({ id: 'v1a', status: 'asignado', workflowVersion: 1 });
    expect(ctaForCaso(v1Pendiente, 'en_atencion')).toEqual({ label: 'Resolver', action: 'view' });
    expect(ctaForCaso(v1Asignado, 'por_iniciar')).toEqual({ label: 'Resolver', action: 'view' });
    expect(ctaForCaso(item({ id: 'v2', status: 'en_progreso' }), 'en_atencion').action).toBe('update');
  });
});
