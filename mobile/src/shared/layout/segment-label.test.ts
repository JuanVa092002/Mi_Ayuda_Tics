import { describe, expect, it } from 'vitest';
import { segmentLabelSize } from './segment-label';

describe('segmentLabelSize', () => {
  it('reduce la fuente en anchos estrechos con 4 opciones', () => {
    expect(segmentLabelSize(320, 4)).toBe(11);
    expect(segmentLabelSize(360, 4)).toBe(12);
    expect(segmentLabelSize(414, 4)).toBe(13);
  });

  it('no compacta de más si hay pocas opciones', () => {
    expect(segmentLabelSize(320, 2)).toBe(13);
  });
});
