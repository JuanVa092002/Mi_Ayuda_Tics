import { describe, expect, it } from 'vitest';
import { queryClient } from './client';
import { queryKeys } from './keys';

describe('queryClient defaults', () => {
  it('no refetch al volver de cámara/galería ni al reconectar', () => {
    const queries = queryClient.getDefaultOptions().queries;
    expect(queries?.refetchOnWindowFocus).toBe(false);
    expect(queries?.refetchOnReconnect).toBe(false);
  });
});

describe('media query keys', () => {
  it('no incluye token en la clave de cache', () => {
    expect(queryKeys.media.file('file-1.jpg')).toEqual(['auth-media', 'file-1.jpg']);
    expect(JSON.stringify(queryKeys.media.file('file-1.jpg'))).not.toMatch(/bearer|eyJ/i);
  });
});
