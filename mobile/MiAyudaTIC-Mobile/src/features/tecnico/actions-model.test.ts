import { describe, expect, it } from 'vitest';
import {
  attentionBannerForCaso,
  canSolve,
  isWorkflowTextValid,
  visibleTechnicianActions,
} from './actions-model';

describe('tecnico actions-model', () => {
  it('expone solo las acciones que el backend habilita', () => {
    expect(visibleTechnicianActions({ canStart: true })).toEqual(['start']);
    expect(
      visibleTechnicianActions({
        canUpdate: true,
        canRequestInfo: true,
        canPartialSolution: true,
        canResolve: true,
      }),
    ).toEqual(['update', 'request_info', 'partial', 'resolve']);
    expect(canSolve({ canPartialSolution: true })).toBe(true);
    expect(canSolve({ canStart: true })).toBe(false);
  });

  it('pide el tap de iniciar cuando el caso está asignado', () => {
    expect(attentionBannerForCaso({ status: 'asignado', displayStatus: 'Asignada' })?.title).toBe(
      'Requiere tu atención',
    );
    expect(attentionBannerForCaso({ status: 'resuelto', displayStatus: 'Por confirmar' })?.tone).toBe(
      'success',
    );
  });

  it('exige el mínimo del backend para no fallar al enviar', () => {
    expect(isWorkflowTextValid('ab')).toBe(false);
    expect(isWorkflowTextValid('listo')).toBe(true);
  });
});
