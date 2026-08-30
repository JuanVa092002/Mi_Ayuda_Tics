import { describe, expect, it } from 'vitest';
import { mapUnknownFetchError } from './fetch-error';

describe('mapUnknownFetchError', () => {
  it('mapea el fallo de expo/fetch con {uri,type,name} a error de foto, no de red', () => {
    const error = mapUnknownFetchError(
      new Error('fetch failed: Unsupported FormDataPart implementation'),
    );
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toMatch(/foto/i);
  });

  it('conserva el copy de red solo para fallos de fetch reales', () => {
    const error = mapUnknownFetchError(new TypeError('Network request failed'));
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('No hay conexión con el servidor. Verifica tu internet.');
  });

  it('trata abort como timeout', () => {
    const abort = new Error('The operation was aborted.');
    abort.name = 'AbortError';
    expect(mapUnknownFetchError(abort).code).toBe('TIMEOUT');
  });

  it('mapea UploadFileError a validación, no a red', async () => {
    const { UploadFileError } = await import('@/shared/media/create-upload-file');
    const error = mapUnknownFetchError(new UploadFileError('La imagen supera el límite de 10 MB', 'FILE_TOO_LARGE'));
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('La imagen supera el límite de 10 MB');
  });

  it('mapea fallo de lectura local a validación, nunca NETWORK_ERROR', async () => {
    const { UploadFileError } = await import('@/shared/media/create-upload-file');
    const error = mapUnknownFetchError(
      new UploadFileError('No se pudo leer la imagen seleccionada', 'UNREADABLE'),
    );
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.code).not.toBe('NETWORK_ERROR');
    expect(error.message).toBe('No se pudo leer la imagen seleccionada');
  });
});
