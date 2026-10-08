import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import {
  applyDraftConflict,
  cacheDetail,
  emptyDraft,
  emptySnapshot,
  isBenignStartConflict,
  isOfflineQueryError,
  isSyncConflict,
  markDraftPending,
  markDraftSynced,
  mergeDraft,
  pendingDrafts,
} from './offline-model';

describe('tecnico offline-model', () => {
  it('guarda borradores y los limpia al sincronizar', () => {
    const draft = mergeDraft(undefined, { casoId: 'c1', mensaje: 'Avance en sitio' });
    expect(draft.mensaje).toBe('Avance en sitio');
    expect(markDraftPending(draft).pendingSync).toBe(true);
    expect(markDraftSynced(draft).mensaje).toBe('');
  });

  it('marca conflicto solo en 409 y pending en offline', () => {
    const draft = emptyDraft('c1');
    expect(isSyncConflict(new ApiError('conflicto', 'VALIDATION_ERROR', 409))).toBe(true);
    expect(isOfflineQueryError(new ApiError('sin red', 'OFFLINE', 0))).toBe(true);
    expect(applyDraftConflict(draft, new ApiError('conflicto', 'VALIDATION_ERROR', 409)).conflict).toBe(true);
    expect(applyDraftConflict(draft, new ApiError('sin red', 'OFFLINE', 0))).toMatchObject({
      pendingSync: true,
      conflict: false,
    });
    expect(isBenignStartConflict(new ApiError('Ya fue iniciado', 'VALIDATION_ERROR', 400))).toBe(true);
    expect(isBenignStartConflict(new ApiError('otro', 'VALIDATION_ERROR', 400))).toBe(false);
    expect(pendingDrafts({ ...emptySnapshot(), drafts: { c1: markDraftPending(emptyDraft('c1')) } })).toHaveLength(1);
  });

  it('cachea detalle sin perder la cola', () => {
    const snap = cacheDetail(emptySnapshot(), {
      id: 'c1',
      caseCode: '2026-09-00001',
      description: 'Red',
      status: 'en_progreso',
      createdAtRaw: '07-09-2026 12:00',
      displayStatus: 'En atención',
    });
    expect(snap.details.c1?.caseCode).toBe('2026-09-00001');
    expect(snap.assigned).toEqual([]);
  });
});
