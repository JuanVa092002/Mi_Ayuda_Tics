import { Directory, File, Paths } from 'expo-file-system';
import {
  cacheAssigned,
  cacheClosed,
  cacheDetail,
  emptySnapshot,
  type TecnicoDraft,
  type TecnicoOfflineSnapshot,
} from './offline-model';
import type { CasoDetail, CasoSummary } from '@/shared/contracts/caso';

const DIR_NAME = 'tecnico-offline';

export type TecnicoOfflineStore = {
  load(userId: string): Promise<TecnicoOfflineSnapshot>;
  save(userId: string, snapshot: TecnicoOfflineSnapshot): Promise<void>;
  clear(): Promise<void>;
};

const memory = new Map<string, TecnicoOfflineSnapshot>();
const assignedSource = new Map<string, 'network' | 'cache'>();

function documentDir(): Directory {
  const root = Paths.document ?? Paths.cache;
  return new Directory(root, DIR_NAME);
}

const fileStore: TecnicoOfflineStore = {
  async load(userId) {
    const cached = memory.get(userId);
    if (cached) return cached;
    try {
      const file = new File(documentDir(), `${userId}.json`);
      if (!file.exists) return emptySnapshot();
      const bytes = await file.bytes();
      const parsed = JSON.parse(new TextDecoder().decode(bytes)) as TecnicoOfflineSnapshot;
      memory.set(userId, parsed);
      return parsed;
    } catch {
      return emptySnapshot();
    }
  },
  async save(userId, snapshot) {
    memory.set(userId, snapshot);
    try {
      const dir = documentDir();
      if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
      const file = new File(dir, `${userId}.json`);
      if (!file.exists) file.create();
      file.write(JSON.stringify(snapshot));
    } catch {
      // Cache is best-effort; memory still holds the snapshot for this session.
    }
  },
  async clear() {
    memory.clear();
    try {
      const dir = documentDir();
      if (dir.exists) dir.delete();
    } catch {
      // logout must still succeed
    }
  },
};

let store: TecnicoOfflineStore = fileStore;

export function setTecnicoOfflineStoreForTests(next: TecnicoOfflineStore | null): void {
  store = next ?? fileStore;
  if (!next) {
    memory.clear();
    assignedSource.clear();
  }
}

export function peekTecnicoOffline(userId: string): TecnicoOfflineSnapshot | undefined {
  return memory.get(userId);
}

export async function loadTecnicoOffline(userId: string): Promise<TecnicoOfflineSnapshot> {
  if (!userId) return emptySnapshot();
  return store.load(userId);
}

export async function saveTecnicoAssigned(userId: string, assigned: CasoSummary[]): Promise<void> {
  const current = await store.load(userId);
  await store.save(userId, cacheAssigned(current, assigned));
}

export async function saveTecnicoClosed(userId: string, closed: CasoSummary[]): Promise<void> {
  const current = await store.load(userId);
  await store.save(userId, cacheClosed(current, closed));
}

export async function saveTecnicoDetail(userId: string, detail: CasoDetail): Promise<void> {
  const current = await store.load(userId);
  await store.save(userId, cacheDetail(current, detail));
}

export async function saveTecnicoDraft(userId: string, draft: TecnicoDraft): Promise<void> {
  const current = await store.load(userId);
  await store.save(userId, {
    ...current,
    drafts: { ...current.drafts, [draft.casoId]: draft },
  });
}

export async function persistTecnicoPhoto(userId: string, casoId: string, uri: string): Promise<string> {
  try {
    const photos = new Directory(documentDir(), 'photos');
    const userDir = new Directory(photos, userId);
    if (!userDir.exists) userDir.create({ intermediates: true, idempotent: true });
    const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const dest = new File(userDir, `${casoId}-${Date.now()}.${ext.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'}`);
    const source = new File(uri);
    const bytes = await source.bytes();
    if (!dest.exists) dest.create();
    dest.write(bytes);
    return dest.uri;
  } catch {
    return uri;
  }
}

export function markAssignedSource(userId: string, source: 'network' | 'cache'): void {
  assignedSource.set(userId, source);
}

export function getAssignedSource(userId: string): 'network' | 'cache' | undefined {
  return assignedSource.get(userId);
}

export async function readTecnicoDraft(userId: string, casoId: string): Promise<TecnicoDraft | undefined> {
  const current = await store.load(userId);
  return current.drafts[casoId];
}

export async function clearTecnicoOffline(): Promise<void> {
  assignedSource.clear();
  await store.clear();
}
