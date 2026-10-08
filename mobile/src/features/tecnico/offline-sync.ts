import type { CasoEvidenceInput } from '@/features/casos/api';
import {
  applyDraftConflict,
  isBenignStartConflict,
  isOfflineQueryError,
  isSyncConflict,
  markDraftPending,
  markDraftSynced,
  mergeDraft,
  pendingDrafts,
  type TecnicoDraft,
} from './offline-model';
import {
  loadTecnicoOffline,
  persistTecnicoPhoto,
  saveTecnicoDraft,
} from './offline-store';

export type TecnicoSyncApi = {
  iniciarAtencion: (token: string, id: string) => Promise<void>;
  agregarActualizacion: (
    token: string,
    id: string,
    mensaje: string,
    evidence?: CasoEvidenceInput,
  ) => Promise<void>;
  solicitarInformacion: (token: string, id: string, mensaje: string) => Promise<void>;
  registrarSolucionParcial: (
    token: string,
    id: string,
    payload: {
      queSeHizo: string;
      queFalta: string;
      siguienteAccion: string;
      fechaEsperada?: string;
      evidence?: CasoEvidenceInput;
    },
  ) => Promise<void>;
  registrarSolucionTotal: (
    token: string,
    id: string,
    payload: { queSeHizo: string; causaIdentificada?: string; evidence?: CasoEvidenceInput },
  ) => Promise<void>;
};

export type TecnicoSyncResult = {
  synced: number;
  conflicts: number;
  failed: number;
};

function evidenceOf(draft: TecnicoDraft): CasoEvidenceInput | undefined {
  if (!draft.attachmentUri) return undefined;
  return {
    uri: draft.attachmentUri,
    fileName: draft.attachmentFileName,
    mimeType: draft.attachmentMimeType,
  };
}

async function flushOne(token: string, draft: TecnicoDraft, api: TecnicoSyncApi): Promise<void> {
  if (draft.pendingStart || draft.kind === 'start') {
    try {
      await api.iniciarAtencion(token, draft.casoId);
    } catch (error) {
      if (!isBenignStartConflict(error)) throw error;
    }
    if (!draft.kind || draft.kind === 'start') return;
  }

  if (draft.kind === 'update') {
    await api.agregarActualizacion(token, draft.casoId, draft.mensaje.trim(), evidenceOf(draft));
    return;
  }
  if (draft.kind === 'request_info') {
    await api.solicitarInformacion(token, draft.casoId, draft.mensaje.trim());
    return;
  }
  if (draft.kind === 'partial') {
    await api.registrarSolucionParcial(token, draft.casoId, {
      queSeHizo: draft.queSeHizo.trim(),
      queFalta: draft.queFalta.trim(),
      siguienteAccion: draft.siguienteAccion.trim(),
      fechaEsperada: draft.fechaEsperada,
      evidence: evidenceOf(draft),
    });
    return;
  }
  if (draft.kind === 'resolve') {
    await api.registrarSolucionTotal(token, draft.casoId, {
      queSeHizo: draft.queSeHizo.trim(),
      causaIdentificada: draft.causaIdentificada,
      evidence: evidenceOf(draft),
    });
  }
}

export async function enqueueTechnicianDraft(
  userId: string,
  patch: Partial<TecnicoDraft> & { casoId: string },
): Promise<TecnicoDraft> {
  const snapshot = await loadTecnicoOffline(userId);
  const current = snapshot.drafts[patch.casoId];
  let next = markDraftPending(mergeDraft(current, patch));
  if (next.attachmentUri && next.attachmentUri !== current?.attachmentUri) {
    next = {
      ...next,
      attachmentUri: await persistTecnicoPhoto(userId, next.casoId, next.attachmentUri),
    };
  }
  await saveTecnicoDraft(userId, next);
  return next;
}

export async function runOrQueue<T>(
  userId: string | undefined,
  execute: () => Promise<T>,
  enqueue: () => Promise<void>,
): Promise<{ queued: boolean; data?: T }> {
  try {
    const data = await execute();
    return { queued: false, data };
  } catch (error) {
    if (isOfflineQueryError(error) && userId) {
      await enqueue();
      return { queued: true };
    }
    throw error;
  }
}

export async function flushTecnicoDrafts(
  userId: string,
  token: string,
  api: TecnicoSyncApi,
): Promise<TecnicoSyncResult> {
  const snapshot = await loadTecnicoOffline(userId);
  const pending = pendingDrafts(snapshot);
  let synced = 0;
  let conflicts = 0;
  let failed = 0;

  for (const draft of pending) {
    try {
      await flushOne(token, draft, api);
      await saveTecnicoDraft(userId, markDraftSynced(draft));
      synced += 1;
    } catch (error) {
      await saveTecnicoDraft(userId, applyDraftConflict(draft, error));
      if (isSyncConflict(error)) conflicts += 1;
      else failed += 1;
    }
  }

  return { synced, conflicts, failed };
}
