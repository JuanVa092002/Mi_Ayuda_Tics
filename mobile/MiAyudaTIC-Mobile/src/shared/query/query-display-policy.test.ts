import { describe, expect, it } from 'vitest';
import { shouldShowQueryError, shouldShowQueryLoading } from './query-display-policy';

describe('query display policy', () => {
  it('no muestra error si hay datos en caché (refetch al volver de cámara/galería)', () => {
    expect(shouldShowQueryError(true, true)).toBe(false);
    expect(shouldShowQueryError(true, false)).toBe(true);
    expect(shouldShowQueryError(false, true)).toBe(false);
  });

  it('no sustituye la UI por loading si ya hay datos', () => {
    expect(shouldShowQueryLoading(true, true)).toBe(false);
    expect(shouldShowQueryLoading(true, false)).toBe(true);
    expect(shouldShowQueryLoading(false, false)).toBe(false);
  });
});
