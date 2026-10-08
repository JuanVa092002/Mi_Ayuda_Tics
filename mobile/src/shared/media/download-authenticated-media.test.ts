import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/errors';

vi.mock('@/shared/api/client', async () => {
  const errors = await import('@/shared/api/errors');
  return {
    apiFetchBinary: vi.fn(),
    ApiError: errors.ApiError,
  };
});

import { apiFetchBinary } from '@/shared/api/client';
import {
  peekAuthenticatedMediaCache,
  setAuthMediaCacheStoreForTests,
  type AuthMediaCacheStore,
} from './authenticated-media-cache';
import { downloadAuthenticatedMedia } from './download-authenticated-media';

function createMemoryStore(): AuthMediaCacheStore {
  const files = new Map<string, Uint8Array>();
  return {
    peek(filename) {
      return files.has(filename) ? `file:///cache/auth-media/${filename}` : null;
    },
    write(filename, bytes) {
      files.set(filename, new Uint8Array(bytes));
      return `file:///cache/auth-media/${filename}`;
    },
    clear() {
      files.clear();
    },
  };
}

describe('downloadAuthenticatedMedia', () => {
  const store = createMemoryStore();

  beforeEach(() => {
    setAuthMediaCacheStoreForTests(store);
    store.clear();
    vi.mocked(apiFetchBinary).mockReset();
  });

  afterEach(() => {
    setAuthMediaCacheStoreForTests(null);
  });

  it('descarga con el cliente API y cachea URI local', async () => {
    vi.mocked(apiFetchBinary).mockResolvedValue(new Uint8Array([0xff, 0xd8, 0xff]));

    const uri = await downloadAuthenticatedMedia('secret-token', '/media/local/file-9.jpg');

    expect(apiFetchBinary).toHaveBeenCalledWith('/media/local/file-9.jpg', { token: 'secret-token' });
    expect(uri).toBe('file:///cache/auth-media/file-9.jpg');
    expect(uri).not.toContain('secret-token');
    expect(peekAuthenticatedMediaCache('file-9.jpg')).toBe(uri);
  });

  it('reutiliza cache y no refetch', async () => {
    vi.mocked(apiFetchBinary).mockResolvedValue(new Uint8Array([1]));
    await downloadAuthenticatedMedia('tok', '/media/local/file-9.jpg');
    await downloadAuthenticatedMedia('tok', '/media/local/file-9.jpg');
    expect(apiFetchBinary).toHaveBeenCalledTimes(1);
  });

  it('propaga 403 sin URI', async () => {
    vi.mocked(apiFetchBinary).mockRejectedValue(new ApiError('Forbidden', 'FORBIDDEN', 403));
    await expect(downloadAuthenticatedMedia('tok', '/media/local/file-9.jpg')).rejects.toMatchObject({
      status: 403,
    });
    expect(peekAuthenticatedMediaCache('file-9.jpg')).toBeNull();
  });
});
