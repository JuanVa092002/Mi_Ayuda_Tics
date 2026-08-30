import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetchBinary } from './client';

describe('apiFetchBinary', () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://10.0.2.2:18080';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }),
    );
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    vi.unstubAllGlobals();
  });

  it('envía Bearer en header y no en la URL', async () => {
    const bytes = await apiFetchBinary('/media/local/file-1.jpg', { token: 'jwt-secret' });

    expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe('http://10.0.2.2:18080/api/media/local/file-1.jpg');
    expect(String(url)).not.toContain('jwt-secret');
    expect(String(url)).not.toMatch(/[?&]token=/);
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer jwt-secret',
    });
  });
});
