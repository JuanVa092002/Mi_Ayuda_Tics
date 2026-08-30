import { describe, expect, it } from 'vitest';
import {
  classifyMediaUrl,
  extractLocalMediaApiPath,
  filenameFromLocalMediaApiPath,
  isLocalPreviewUri,
  needsAuthenticatedMediaFetch,
} from './authenticated-media';

describe('authenticated media URL classification', () => {
  it('trata file/content/ph como preview local (picker) sin fetch autenticado', () => {
    expect(classifyMediaUrl('file:///data/cache/ImagePicker/abc.jpg')).toBe('local-preview');
    expect(classifyMediaUrl('content://media/external/images/media/1')).toBe('local-preview');
    expect(classifyMediaUrl('ph://uuid')).toBe('local-preview');
    expect(needsAuthenticatedMediaFetch('file:///cache/a.jpg')).toBe(false);
    expect(isLocalPreviewUri('file:///cache/a.jpg')).toBe(true);
  });

  it('detecta storage local autenticado aunque PUBLIC_URL sea 127.0.0.1', () => {
    const url = 'http://127.0.0.1:18080/api/media/local/file-1710000000000.jpg';
    expect(classifyMediaUrl(url)).toBe('authenticated-local');
    expect(needsAuthenticatedMediaFetch(url)).toBe(true);
    expect(extractLocalMediaApiPath(url)).toBe('/media/local/file-1710000000000.jpg');
  });

  it('reescribe host del emulador 10.0.2.2 al path del cliente API', () => {
    const url = 'http://10.0.2.2:18080/api/media/local/file-abc.png';
    expect(extractLocalMediaApiPath(url)).toBe('/media/local/file-abc.png');
  });

  it('deja Cloudinary público como remote displayable por Image', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/evidencias/file-1.jpg';
    expect(classifyMediaUrl(url)).toBe('public-remote');
    expect(needsAuthenticatedMediaFetch(url)).toBe(false);
    expect(extractLocalMediaApiPath(url)).toBeNull();
  });

  it('rechaza filename inseguro', () => {
    expect(extractLocalMediaApiPath('http://127.0.0.1:18080/api/media/local/../secret')).toBeNull();
    expect(filenameFromLocalMediaApiPath('/media/local/../x')).toBeNull();
    expect(filenameFromLocalMediaApiPath('/media/local/file-1.jpg')).toBe('file-1.jpg');
  });
});
