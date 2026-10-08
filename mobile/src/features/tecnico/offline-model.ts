import { ApiError } from '@/shared/api/errors';
import type { CasoDetail, CasoSummary } from '@/shared/contracts/caso';

export type TecnicoDraftKind = 'start' | 'update' | 'request_info' | 'partial' | 'resolve';

export type TecnicoDraft = {
  casoId: string;
  kind?: TecnicoDraftKind;
  mensaje: string;
  queSeHizo: string;
  queFalta: string;
  siguienteAccion: string;
  causaIdentificada?: string;
  fechaEsperada?: string;
  attachmentUri?: string;
  attachmentFileName?: string;
  attachmentMimeType?: string;
  pendingStart?: boolean;
  updatedAt: string;
  pendingSync: boolean;
  conflict: boolean;
};

export type TecnicoOfflineSnapshot = {
  assigned: CasoSummary[];
  closed: CasoSummary[];
  details: Record<string, CasoDetail>;
  drafts: Record<string, TecnicoDraft>;
  lastSyncedAt?: string;
};

export function emptySnapshot(): TecnicoOfflineSnapshot {
  return { assigned: [], closed: [], details: {}, drafts: {} };
}

export function emptyDraft(casoId: string, now = new Date()): TecnicoDraft {
  return {
    casoId,
    mensaje: '',
    queSeHizo: '',
    queFalta: '',
    siguienteAccion: '',
    updatedAt: now.toISOString(),
    pendingSync: false,
    conflict: false,
  };
}

export function mergeDraft(current: TecnicoDraft | undefined, patch: Partial<TecnicoDraft>, now = new Date()): TecnicoDraft {
  const casoId = patch.casoId ?? current?.casoId ?? '';
  const base = current ?? emptyDraft(casoId, now);
  return {
    ...base,
    ...patch,
    casoId: patch.casoId ?? base.casoId,
    updatedAt: now.toISOString(),
  };
}

export function markDraftPending(draft: TecnicoDraft): TecnicoDraft {
  return { ...draft, pendingSync: true, conflict: false };
}

export function markDraftSynced(draft: TecnicoDraft): TecnicoDraft {
  return {
    ...emptyDraft(draft.casoId),
    updatedAt: draft.updatedAt,
  };
}

export function pendingDrafts(snapshot: TecnicoOfflineSnapshot): TecnicoDraft[] {
  return Object.values(snapshot.drafts).filter((draft) => draft.pendingSync);
}

export function isOfflineQueryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String(error.code) : '';
  return code === 'OFFLINE' || code === 'CONNECTION_ERROR' || code === 'TIMEOUT' || code === 'NETWORK_ERROR';
}

export function isSyncConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

export function isBenignStartConflict(error: unknown): boolean {
  if (isSyncConflict(error)) return true;
  return error instanceof ApiError && error.status === 400 && /iniciad|en_progreso|en atención/i.test(error.message);
}

export function applyDraftConflict(draft: TecnicoDraft, error: unknown): TecnicoDraft {
  if (isSyncConflict(error)) {
    return { ...draft, pendingSync: true, conflict: true };
  }
  if (isOfflineQueryError(error)) {
    return { ...draft, pendingSync: true, conflict: false };
  }
  return { ...draft, pendingSync: true, conflict: false };
}

export function cacheAssigned(
  snapshot: TecnicoOfflineSnapshot,
  assigned: CasoSummary[],
  now = new Date(),
): TecnicoOfflineSnapshot {
  return { ...snapshot, assigned, lastSyncedAt: now.toISOString() };
}

export function cacheClosed(snapshot: TecnicoOfflineSnapshot, closed: CasoSummary[]): TecnicoOfflineSnapshot {
  return { ...snapshot, closed };
}

export function cacheDetail(snapshot: TecnicoOfflineSnapshot, detail: CasoDetail): TecnicoOfflineSnapshot {
  return { ...snapshot, details: { ...snapshot.details, [detail.id]: detail } };
}
