import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/shared/query/client';
import { queryKeys } from '@/shared/query/keys';
import {
  clearAuthenticatedSessionMedia,
  peekAuthenticatedMediaCache,
  setAuthMediaCacheStoreForTests,
  writeAuthenticatedMediaCache,
  type AuthMediaCacheStore,
} from './authenticated-media-cache';

function createMemoryStore(): AuthMediaCacheStore & { files: Map<string, Uint8Array> } {
  const files = new Map<string, Uint8Array>();
  return {
    files,
    peek(filename) {
      return files.has(filename) ? `file:///cache/auth-media/${filename}` : null;
    },
    write(filename, bytes) {
      files.set(filename, bytes);
      return `file:///cache/auth-media/${filename}`;
    },
    clear() {
      files.clear();
    },
  };
}

describe('authenticated media cache', () => {
  const store = createMemoryStore();

  beforeEach(() => {
    store.files.clear();
    setAuthMediaCacheStoreForTests(store);
    queryClient.setQueryData(queryKeys.media.file('file-1.jpg'), 'file:///cache/auth-media/file-1.jpg');
    queryClient.setQueryData(queryKeys.solicitudes.detail('abc'), { id: 'abc' });
  });

  afterEach(() => {
    setAuthMediaCacheStoreForTests(null);
    queryClient.clear();
  });

  it('escribe y lee por filename, sin token en la URI', () => {
    const uri = writeAuthenticatedMediaCache('file-1.jpg', new Uint8Array([1, 2, 3]));
    expect(uri).toBe('file:///cache/auth-media/file-1.jpg');
    expect(uri.toLowerCase()).not.toContain('bearer');
    expect(uri).not.toMatch(/eyJ/);
    expect(peekAuthenticatedMediaCache('file-1.jpg')).toBe(uri);
  });

  it('limpia bytes y queries de media/solicitudes/casos en logout', () => {
    writeAuthenticatedMediaCache('file-1.jpg', new Uint8Array([9]));
    clearAuthenticatedSessionMedia();
    expect(peekAuthenticatedMediaCache('file-1.jpg')).toBeNull();
    expect(queryClient.getQueryData(queryKeys.media.file('file-1.jpg'))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.solicitudes.detail('abc'))).toBeUndefined();
  });
});
