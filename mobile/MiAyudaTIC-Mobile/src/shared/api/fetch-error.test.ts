import { describe, expect, it } from 'vitest';
import { API_ERROR_COPY } from './errors';
import { mapUnknownFetchError } from './fetch-error';

describe('mapUnknownFetchError', () => {
  it('mapea el fallo de expo/fetch con {uri,type,name} a error de foto, no de red', () => {
    const error = mapUnknownFetchError(
      new Error('fetch failed: Unsupported FormDataPart implementation'),
    );
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toMatch(/foto/i);
  });

  it('trata Network request failed como CONNECTION_ERROR, no offline', () => {
    const error = mapUnknownFetchError(new TypeError('Network request failed'));
    expect(error.code).toBe('CONNECTION_ERROR');
    expect(error.message).toBe(API_ERROR_COPY.CONNECTION_ERROR);
    expect(error.code).not.toBe('NETWORK_ERROR');
  });

  it('trata abort como timeout', () => {
    const abort = new Error('The operation was aborted.');
    abort.name = 'AbortError';
    const mapped = mapUnknownFetchError(abort);
    expect(mapped.code).toBe('TIMEOUT');
    expect(mapped.message).toBe(API_ERROR_COPY.TIMEOUT);
  });

  it('trata Fetch request has been canceled como TIMEOUT', () => {
    const mapped = mapUnknownFetchError(new Error('Fetch request has been canceled'));
    expect(mapped.code).toBe('TIMEOUT');
    expect(mapped.message).toBe(API_ERROR_COPY.TIMEOUT);
  });

  it('trata fetch failed: Fetch request has been canceled como TIMEOUT', () => {
    const mapped = mapUnknownFetchError(
      new Error('fetch failed: Fetch request has been canceled'),
    );
    expect(mapped.code).toBe('TIMEOUT');
    expect(mapped.code).not.toBe('NETWORK_ERROR');
  });

  it('trata canceled/cancelled como TIMEOUT', () => {
    expect(mapUnknownFetchError(new Error('The request was canceled.')).code).toBe('TIMEOUT');
    expect(mapUnknownFetchError(new Error('The request was cancelled.')).code).toBe('TIMEOUT');
  });

  it('trata ECONNREFUSED / conexión rechazada como CONNECTION_ERROR', () => {
    const refused = mapUnknownFetchError(new Error('connect ECONNREFUSED 127.0.0.1:18080'));
    expect(refused.code).toBe('CONNECTION_ERROR');
    expect(refused.message).toBe(API_ERROR_COPY.CONNECTION_ERROR);

    const android = mapUnknownFetchError(
      new Error('Failed to connect to /127.0.0.1:18080'),
    );
    expect(android.code).toBe('CONNECTION_ERROR');
  });

  it('trata fallo de DNS/TLS como CONNECTION_ERROR', () => {
    expect(mapUnknownFetchError(new Error('Unable to resolve host miayudatics.invalid')).code).toBe(
      'CONNECTION_ERROR',
    );
    expect(mapUnknownFetchError(new Error('Cleartext HTTP traffic not permitted')).code).toBe(
      'CONNECTION_ERROR',
    );
  });

  it('trata offline confirmado como OFFLINE', () => {
    const mapped = mapUnknownFetchError(new Error('Network is unreachable (offline)'));
    expect(mapped.code).toBe('OFFLINE');
    expect(mapped.message).toBe(API_ERROR_COPY.OFFLINE);
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
