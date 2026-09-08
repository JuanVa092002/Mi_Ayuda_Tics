import { describe, expect, it } from 'vitest';
import { queueHistorialChip, takeQueuedHistorialChip } from './historial-intent';

describe('historial-intent', () => {
  it('entrega el chip encolado una sola vez', () => {
    queueHistorialChip('En proceso');
    expect(takeQueuedHistorialChip()).toBe('En proceso');
    expect(takeQueuedHistorialChip()).toBeNull();
  });
});
