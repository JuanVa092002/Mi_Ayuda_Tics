import { describe, expect, it } from 'vitest';
import {
  normalizeImageFileName,
  normalizeImageMime,
  toMultipartImagePart,
} from './multipart-image';

describe('toMultipartImagePart', () => {
  it('normaliza image/jpg y completa el nombre', () => {
    expect(toMultipartImagePart({ uri: 'file:///tmp/a', mimeType: 'image/jpg' })).toEqual({
      uri: 'file:///tmp/a',
      type: 'image/jpeg',
      name: 'foto.jpg',
    });
  });

  it('conserva content:// de Android y el nombre del picker', () => {
    expect(
      toMultipartImagePart({
        uri: 'content://media/external/images/media/12',
        mimeType: 'image/png',
        fileName: 'IMG_001',
      }),
    ).toEqual({
      uri: 'content://media/external/images/media/12',
      type: 'image/png',
      name: 'IMG_001.png',
    });
  });

  it('mime helpers', () => {
    expect(normalizeImageMime(undefined)).toBe('image/jpeg');
    expect(normalizeImageFileName('a.heic', 'image/heic')).toBe('a.heic');
  });
});
