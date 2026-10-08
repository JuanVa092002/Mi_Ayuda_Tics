import { Directory, File, Paths } from 'expo-file-system';
import { queryClient } from '@/shared/query/client';
import { queryKeys } from '@/shared/query/keys';

export const AUTH_MEDIA_CACHE_DIR = 'auth-media';

export type AuthMediaCacheStore = {
  peek(filename: string): string | null;
  write(filename: string, bytes: Uint8Array): string;
  clear(): void;
};

function expoAuthMediaDirectory(): Directory {
  return new Directory(Paths.cache, AUTH_MEDIA_CACHE_DIR);
}

const expoStore: AuthMediaCacheStore = {
  peek(filename) {
    const file = new File(expoAuthMediaDirectory(), filename);
    if (file.exists && file.size > 0) {
      return file.uri;
    }
    return null;
  },
  write(filename, bytes) {
    const dir = expoAuthMediaDirectory();
    if (!dir.exists) {
      dir.create({ intermediates: true, idempotent: true });
    }
    const file = new File(dir, filename);
    if (!file.exists) {
      file.create();
    }
    file.write(bytes);
    return file.uri;
  },
  clear() {
    const dir = expoAuthMediaDirectory();
    if (dir.exists) {
      dir.delete();
    }
  },
};

let cacheStore: AuthMediaCacheStore = expoStore;

export function setAuthMediaCacheStoreForTests(next: AuthMediaCacheStore | null): void {
  cacheStore = next ?? expoStore;
}

export function peekAuthenticatedMediaCache(filename: string): string | null {
  return cacheStore.peek(filename);
}

export function writeAuthenticatedMediaCache(filename: string, bytes: Uint8Array): string {
  return cacheStore.write(filename, bytes);
}

export function clearAuthenticatedMediaCache(): void {
  cacheStore.clear();
}

/** Logout / session wipe: drop bytes on disk and in-memory query cache. Never throws. */
export function clearAuthenticatedSessionMedia(): void {
  try {
    clearAuthenticatedMediaCache();
  } catch {
    // logout must still succeed
  }
  queryClient.removeQueries({ queryKey: queryKeys.media.all });
  queryClient.removeQueries({ queryKey: queryKeys.solicitudes.all });
  queryClient.removeQueries({ queryKey: queryKeys.casos.all });
}
