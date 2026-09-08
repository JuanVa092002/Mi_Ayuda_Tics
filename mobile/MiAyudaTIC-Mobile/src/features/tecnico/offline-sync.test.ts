import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import { emptyDraft, markDraftPending, mergeDraft } from './offline-model';
import { flushTecnicoDrafts } from './offline-sync';
import { saveTecnicoDraft, setTecnicoOfflineStoreForTests } from './offline-store';
import { emptySnapshot, type TecnicoOfflineSnapshot } from './offline-model';

describe('tecnico offline-sync', () => {
  it('envía la cola y limpia borradores al sincronizar', async () => {
    const memory = new Map<string, TecnicoOfflineSnapshot>();
    setTecnicoOfflineStoreForTests({
      load: async (userId) => memory.get(userId) ?? emptySnapshot(),
      save: async (userId, snapshot) => {
        memory.set(userId, snapshot);
      },
      clear: async () => {
        memory.clear();
      },
    });
    await saveTecnicoDraft(
      'u1',
      markDraftPending(
        mergeDraft(emptyDraft('c1'), { casoId: 'c1', kind: 'update', mensaje: 'Avance en sitio' }),
      ),
    );
    const api = {
      iniciarAtencion: vi.fn(),
      agregarActualizacion: vi.fn(),
      solicitarInformacion: vi.fn(),
      registrarSolucionParcial: vi.fn(),
      registrarSolucionTotal: vi.fn(),
    };
    const result = await flushTecnicoDrafts('u1', 'token', api);
    expect(result.synced).toBe(1);
    expect(api.agregarActualizacion).toHaveBeenCalledWith('token', 'c1', 'Avance en sitio', undefined);
    setTecnicoOfflineStoreForTests(null);
  });

  it('conserva el texto y marca conflicto en 409', async () => {
    const memory = new Map<string, TecnicoOfflineSnapshot>();
    setTecnicoOfflineStoreForTests({
      load: async (userId) => memory.get(userId) ?? emptySnapshot(),
      save: async (userId, snapshot) => {
        memory.set(userId, snapshot);
      },
      clear: async () => {
        memory.clear();
      },
    });
    await saveTecnicoDraft(
      'u1',
      markDraftPending(
        mergeDraft(emptyDraft('c1'), { casoId: 'c1', kind: 'update', mensaje: 'Avance en sitio' }),
      ),
    );
    const result = await flushTecnicoDrafts('u1', 'token', {
      iniciarAtencion: vi.fn(),
      agregarActualizacion: vi.fn(async () => {
        throw new ApiError('conflicto', 'VALIDATION_ERROR', 409);
      }),
      solicitarInformacion: vi.fn(),
      registrarSolucionParcial: vi.fn(),
      registrarSolucionTotal: vi.fn(),
    });
    expect(result.conflicts).toBe(1);
    const snap = memory.get('u1');
    expect(snap?.drafts.c1).toMatchObject({ mensaje: 'Avance en sitio', conflict: true, pendingSync: true });
    setTecnicoOfflineStoreForTests(null);
  });

  it('inicia y luego actualiza cuando ambas quedaron en cola', async () => {
    const memory = new Map<string, TecnicoOfflineSnapshot>();
    setTecnicoOfflineStoreForTests({
      load: async (userId) => memory.get(userId) ?? emptySnapshot(),
      save: async (userId, snapshot) => {
        memory.set(userId, snapshot);
      },
      clear: async () => {
        memory.clear();
      },
    });
    await saveTecnicoDraft(
      'u1',
      markDraftPending(
        mergeDraft(emptyDraft('c1'), {
          casoId: 'c1',
          kind: 'update',
          pendingStart: true,
          mensaje: 'Avance en sitio',
        }),
      ),
    );
    const api = {
      iniciarAtencion: vi.fn(),
      agregarActualizacion: vi.fn(),
      solicitarInformacion: vi.fn(),
      registrarSolucionParcial: vi.fn(),
      registrarSolucionTotal: vi.fn(),
    };
    await flushTecnicoDrafts('u1', 'token', api);
    expect(api.iniciarAtencion).toHaveBeenCalledWith('token', 'c1');
    expect(api.agregarActualizacion).toHaveBeenCalledWith('token', 'c1', 'Avance en sitio', undefined);
    setTecnicoOfflineStoreForTests(null);
  });
});
