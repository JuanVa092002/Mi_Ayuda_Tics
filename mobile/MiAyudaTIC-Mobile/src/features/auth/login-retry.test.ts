import { describe, expect, it, vi } from 'vitest';
import { ApiError, API_ERROR_COPY } from '@/shared/api/errors';
import type { LoginResult } from './session-types';
import {
  createSubmitLock,
  delayUnlessCancelled,
  finalizeLoginFailure,
  isLoginRetryableError,
  isLoginRetryableFailure,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_RETRY_DELAY_MS,
  LOGIN_TIMEOUT_EXHAUSTED_COPY,
  loginControlLog,
  runLoginWithSingleRetry,
} from './login-retry';

function fail(code: ApiError['code'], message = 'x'): LoginResult {
  return { ok: false, kind: 'network', message, code };
}

describe('isLoginRetryableError', () => {
  it('trata Fetch request has been canceled como TIMEOUT retryable', () => {
    expect(isLoginRetryableError(new Error('Fetch request has been canceled'))).toBe(true);
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    expect(isLoginRetryableError(abort)).toBe(true);
  });

  it('no reintenta CONNECTION_ERROR rápido ni 401/403/422', () => {
    expect(isLoginRetryableError(new ApiError('c', 'CONNECTION_ERROR'))).toBe(false);
    expect(isLoginRetryableError(new ApiError('u', 'INVALID_CREDENTIALS', 401))).toBe(false);
    expect(isLoginRetryableError(new ApiError('f', 'FORBIDDEN', 403))).toBe(false);
    expect(isLoginRetryableError(new ApiError('v', 'VALIDATION_ERROR', 422))).toBe(false);
    expect(isLoginRetryableError(new ApiError('s', 'SERVER_ERROR', 500))).toBe(false);
  });
});

describe('runLoginWithSingleRetry', () => {
  it('timeout de login dispara un retry', async () => {
    const attempt = vi
      .fn()
      .mockResolvedValueOnce(fail('TIMEOUT'))
      .mockResolvedValueOnce({ ok: true, access: { state: 'guest' } });

    const result = await runLoginWithSingleRetry(attempt, {
      isCancelled: () => false,
      sleep: async () => undefined,
    });

    expect(attempt).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it('timeout de login no supera dos intentos totales', async () => {
    const attempt = vi.fn().mockResolvedValue(fail('TIMEOUT', 't'));
    const result = await runLoginWithSingleRetry(attempt, {
      isCancelled: () => false,
      sleep: async () => undefined,
    });
    expect(attempt).toHaveBeenCalledTimes(LOGIN_MAX_ATTEMPTS);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(LOGIN_TIMEOUT_EXHAUSTED_COPY);
    }
  });

  it('espera 2 s antes del retry', async () => {
    const slept: number[] = [];
    const attempt = vi
      .fn()
      .mockResolvedValueOnce(fail('TIMEOUT'))
      .mockResolvedValueOnce(fail('TIMEOUT'));

    await runLoginWithSingleRetry(attempt, {
      isCancelled: () => false,
      sleep: async (ms) => {
        slept.push(ms);
      },
    });

    expect(slept.reduce((sum, n) => sum + n, 0)).toBe(LOGIN_RETRY_DELAY_MS);
  });

  it('502/503/504 disparan un retry', async () => {
    for (const status of [502, 503, 504] as const) {
      const attempt = vi
        .fn()
        .mockResolvedValueOnce(fail('GATEWAY_RECOVERABLE'))
        .mockResolvedValueOnce({ ok: true, access: { state: 'guest' } });
      const result = await runLoginWithSingleRetry(attempt, {
        isCancelled: () => false,
        sleep: async () => undefined,
      });
      expect(result.ok).toBe(true);
      expect(attempt).toHaveBeenCalledTimes(2);
      expect(status).toBeGreaterThan(500);
    }
  });

  it('401/403/422 no reintentan', async () => {
    const cases: LoginResult[] = [
      { ok: false, kind: 'invalid_credentials', message: 'bad', code: 'INVALID_CREDENTIALS' },
      { ok: false, kind: 'pending_approval', message: 'p', code: 'FORBIDDEN' },
      { ok: false, kind: 'network', message: 'field', code: 'VALIDATION_ERROR' },
    ];
    for (const first of cases) {
      const attempt = vi.fn().mockResolvedValue(first);
      const result = await runLoginWithSingleRetry(attempt, {
        isCancelled: () => false,
        sleep: async () => undefined,
      });
      expect(attempt).toHaveBeenCalledTimes(1);
      expect(result).toEqual(first);
    }
  });

  it('CONNECTION_ERROR rápido no reintenta', async () => {
    const attempt = vi
      .fn()
      .mockResolvedValue(fail('CONNECTION_ERROR', API_ERROR_COPY.CONNECTION_ERROR));
    const result = await runLoginWithSingleRetry(attempt, {
      isCancelled: () => false,
      sleep: async () => undefined,
    });
    expect(attempt).toHaveBeenCalledTimes(1);
    expect(isLoginRetryableFailure(result)).toBe(false);
  });
});

describe('createSubmitLock', () => {
  it('doble tap solo adquiere una operación', () => {
    const lock = createSubmitLock();
    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);
    expect(lock.isHeld()).toBe(true);
    lock.release();
    expect(lock.tryAcquire()).toBe(true);
  });
});

describe('loginControlLog', () => {
  it('nunca admite password ni Authorization', () => {
    expect(loginControlLog({ route: 'login', attempts: 1 })).toEqual({
      route: 'login',
      attempts: 1,
    });
    expect(() => loginControlLog({ password: 'secret' })).toThrow(/password/i);
    expect(() => loginControlLog({ Authorization: 'Bearer x' })).toThrow(/Authorization/i);
  });
});

describe('delayUnlessCancelled', () => {
  it('respeta cancelación', async () => {
    const result = await delayUnlessCancelled(1000, {
      isCancelled: () => true,
      sleep: async () => undefined,
    });
    expect(result).toBe('cancelled');
  });
});

describe('finalizeLoginFailure', () => {
  it('cambia copy de TIMEOUT agotado', () => {
    const result = finalizeLoginFailure(fail('TIMEOUT', 'old'), 2);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(LOGIN_TIMEOUT_EXHAUSTED_COPY);
    }
  });
});
