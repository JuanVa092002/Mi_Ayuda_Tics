import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/api/errors';
import {
  getPasswordRuleStatus,
  isResetPasswordValid,
  mapPasswordRecoveryError,
  normalizeRouteParam,
} from './password-recovery-errors';

describe('normalizeRouteParam', () => {
  it('acepta string', () => {
    expect(normalizeRouteParam('abc123')).toBe('abc123');
  });

  it('acepta primer elemento de array', () => {
    expect(normalizeRouteParam(['token-a', 'token-b'])).toBe('token-a');
  });

  it('rechaza vacío', () => {
    expect(normalizeRouteParam(undefined)).toBeNull();
    expect(normalizeRouteParam('')).toBeNull();
    expect(normalizeRouteParam([])).toBeNull();
  });
});

describe('getPasswordRuleStatus', () => {
  const validPassword = 'Abcdef12';

  it('valida reglas de contraseña (mínimo 8 caracteres)', () => {
    expect(getPasswordRuleStatus(validPassword, validPassword)).toEqual({
      minLength: true,
      hasLetter: true,
      hasNumber: true,
      matches: true,
    });
  });

  it('rechaza contraseña de 7 caracteres en minLength', () => {
    expect(getPasswordRuleStatus('Abcdef1', 'Abcdef1').minLength).toBe(false);
  });

  it('detecta mismatch', () => {
    const status = getPasswordRuleStatus(validPassword, 'Abcdef13');
    expect(status.matches).toBe(false);
  });
});

describe('isResetPasswordValid', () => {
  it('requiere todas las reglas', () => {
    expect(isResetPasswordValid('short1', 'short1')).toBe(false);
    expect(isResetPasswordValid('abcdefgh', 'abcdefgh')).toBe(false);
    expect(isResetPasswordValid('Abcdef12', 'Abcdef12')).toBe(true);
  });
});

describe('mapPasswordRecoveryError', () => {
  it('mapea red', () => {
    const result = mapPasswordRecoveryError(
      new ApiError('timeout', 'NETWORK_ERROR'),
      'forgot',
    );
    expect(result.kind).toBe('network');
    expect(result.canRetry).toBe(true);
  });

  it('mapea rate limit', () => {
    const result = mapPasswordRecoveryError(
      new ApiError('Demasiados intentos. Espera 15 minutos.', 'VALIDATION_ERROR', 429),
      'reset',
    );
    expect(result.kind).toBe('rate_limited');
    expect(result.canRetry).toBe(false);
  });

  it('mapea token inválido en reset', () => {
    const result = mapPasswordRecoveryError(
      new ApiError('Token inválido o expirado.', 'VALIDATION_ERROR', 400),
      'reset',
    );
    expect(result.kind).toBe('invalid_token');
  });

  it('mapea 422 como validación', () => {
    const result = mapPasswordRecoveryError(
      new ApiError('La contraseña debe tener al menos 8 caracteres', 'VALIDATION_ERROR', 422),
      'reset',
    );
    expect(result.kind).toBe('validation');
  });
});
