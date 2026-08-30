import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import {
  resolveBackgroundRevalidateFailure,
  resolveBootstrapFailure,
  shouldRevalidateOnForeground,
} from './bootstrap-session-policy';

describe('resolveBootstrapFailure', () => {
  it('401 → expired (sesión inválida)', () => {
    expect(resolveBootstrapFailure(new ApiError('no auth', 'UNAUTHORIZED', 401))).toEqual({
      kind: 'expired',
    });
  });

  it('403 → guest (cuenta sin acceso móvil)', () => {
    expect(resolveBootstrapFailure(new ApiError('forbidden', 'FORBIDDEN', 403))).toEqual({
      kind: 'guest',
    });
  });

  it('timeout → restore_failed sin bloquear welcome', () => {
    expect(resolveBootstrapFailure(new ApiError('timeout', 'TIMEOUT'))).toEqual({
      kind: 'restore_failed',
      session: { state: 'restore_failed', reason: 'timeout' },
    });
  });

  it('error desconocido → restore_failed (conserva token para reintentar)', () => {
    expect(resolveBootstrapFailure(new Error('boom'))).toEqual({
      kind: 'restore_failed',
      session: { state: 'restore_failed', reason: 'network' },
    });
  });
});

describe('resolveBackgroundRevalidateFailure', () => {
  it('401 → expired', () => {
    expect(
      resolveBackgroundRevalidateFailure(new ApiError('no auth', 'UNAUTHORIZED', 401)),
    ).toBe('expired');
  });

  it('403 → guest', () => {
    expect(
      resolveBackgroundRevalidateFailure(new ApiError('forbidden', 'FORBIDDEN', 403)),
    ).toBe('guest');
  });

  it('timeout/red/5xx → keep (no rompe navegación)', () => {
    expect(resolveBackgroundRevalidateFailure(new ApiError('timeout', 'TIMEOUT'))).toBe('keep');
    expect(resolveBackgroundRevalidateFailure(new ApiError('red', 'NETWORK_ERROR'))).toBe('keep');
    expect(resolveBackgroundRevalidateFailure(new ApiError('srv', 'SERVER_ERROR', 503))).toBe(
      'keep',
    );
  });
});

describe('shouldRevalidateOnForeground', () => {
  it('solo revalida con sesión autenticada', () => {
    expect(
      shouldRevalidateOnForeground({
        state: 'authenticated',
        session: {
          token: 't',
          user: {
            id: '1',
            fullName: 'U',
            email: 'u@test.com',
            role: 'funcionario',
            isApproved: true,
          },
        },
      }),
    ).toBe(true);
    expect(shouldRevalidateOnForeground({ state: 'guest' })).toBe(false);
    expect(shouldRevalidateOnForeground({ state: 'bootstrapping' })).toBe(false);
  });
});
