import { describe, expect, it } from 'vitest';
import { ApiError, getRestoreFailedReason, isRecoverableError } from './errors';

describe('isRecoverableError', () => {
  it('trata errores de red como recuperables', () => {
    expect(isRecoverableError(new ApiError('sin red', 'NETWORK_ERROR'))).toBe(true);
    expect(isRecoverableError(new ApiError('timeout', 'TIMEOUT'))).toBe(true);
    expect(isRecoverableError(new ApiError('server', 'SERVER_ERROR', 503))).toBe(true);
  });

  it('no trata 401 como recuperable', () => {
    expect(isRecoverableError(new ApiError('no auth', 'UNAUTHORIZED', 401))).toBe(false);
  });

  it('clasifica motivo de restore_failed', () => {
    expect(getRestoreFailedReason(new ApiError('t', 'TIMEOUT'))).toBe('timeout');
    expect(getRestoreFailedReason(new ApiError('s', 'SERVER_ERROR', 500))).toBe('server');
    expect(getRestoreFailedReason(new ApiError('n', 'NETWORK_ERROR'))).toBe('network');
  });
});
