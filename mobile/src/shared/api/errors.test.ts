import { describe, expect, it } from 'vitest';
import {
  ApiError,
  API_ERROR_COPY,
  getRestoreFailedReason,
  isRecoverableError,
  isUnauthorizedError,
  mapHttpStatusToCode,
  resolveErrorMessage,
} from './errors';

describe('mapHttpStatusToCode', () => {
  it('401 → INVALID_CREDENTIALS', () => {
    expect(mapHttpStatusToCode(401)).toBe('INVALID_CREDENTIALS');
  });

  it('422 → VALIDATION_ERROR', () => {
    expect(mapHttpStatusToCode(422)).toBe('VALIDATION_ERROR');
  });

  it('502/503/504 → GATEWAY_RECOVERABLE', () => {
    expect(mapHttpStatusToCode(502)).toBe('GATEWAY_RECOVERABLE');
    expect(mapHttpStatusToCode(503)).toBe('GATEWAY_RECOVERABLE');
    expect(mapHttpStatusToCode(504)).toBe('GATEWAY_RECOVERABLE');
  });

  it('500 → SERVER_ERROR', () => {
    expect(mapHttpStatusToCode(500)).toBe('SERVER_ERROR');
  });

  it('403 → FORBIDDEN', () => {
    expect(mapHttpStatusToCode(403)).toBe('FORBIDDEN');
  });
});

describe('resolveErrorMessage', () => {
  it('usa copy fijo de credenciales en 401', () => {
    expect(resolveErrorMessage('INVALID_CREDENTIALS', 'credenciales inválidas')).toBe(
      API_ERROR_COPY.INVALID_CREDENTIALS,
    );
  });

  it('conserva el mensaje de campo en 422', () => {
    expect(resolveErrorMessage('VALIDATION_ERROR', 'El correo electrónico no es válido')).toBe(
      'El correo electrónico no es válido',
    );
  });
});

describe('isUnauthorizedError', () => {
  it('trata INVALID_CREDENTIALS y UNAUTHORIZED como 401 de sesión', () => {
    expect(isUnauthorizedError(new ApiError('x', 'INVALID_CREDENTIALS', 401))).toBe(true);
    expect(isUnauthorizedError(new ApiError('x', 'UNAUTHORIZED', 401))).toBe(true);
    expect(isUnauthorizedError(new ApiError('x', 'FORBIDDEN', 403))).toBe(false);
  });
});

describe('isRecoverableError', () => {
  it('trata errores de red como recuperables', () => {
    expect(isRecoverableError(new ApiError('sin red', 'NETWORK_ERROR'))).toBe(true);
    expect(isRecoverableError(new ApiError('timeout', 'TIMEOUT'))).toBe(true);
    expect(isRecoverableError(new ApiError('conn', 'CONNECTION_ERROR'))).toBe(true);
    expect(isRecoverableError(new ApiError('server', 'SERVER_ERROR', 500))).toBe(true);
    expect(isRecoverableError(new ApiError('gw', 'GATEWAY_RECOVERABLE', 503))).toBe(true);
  });

  it('no trata 401 como recuperable', () => {
    expect(isRecoverableError(new ApiError('no auth', 'UNAUTHORIZED', 401))).toBe(false);
    expect(isRecoverableError(new ApiError('bad pass', 'INVALID_CREDENTIALS', 401))).toBe(false);
  });

  it('clasifica motivo de restore_failed', () => {
    expect(getRestoreFailedReason(new ApiError('t', 'TIMEOUT'))).toBe('timeout');
    expect(getRestoreFailedReason(new ApiError('s', 'SERVER_ERROR', 500))).toBe('server');
    expect(getRestoreFailedReason(new ApiError('g', 'GATEWAY_RECOVERABLE', 503))).toBe('server');
    expect(getRestoreFailedReason(new ApiError('n', 'NETWORK_ERROR'))).toBe('network');
    expect(getRestoreFailedReason(new ApiError('c', 'CONNECTION_ERROR'))).toBe('network');
  });
});
