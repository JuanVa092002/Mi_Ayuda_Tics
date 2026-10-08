import { ApiError, isNetworkError } from '@/shared/api/errors';

export type PasswordRecoveryErrorKind =
  | 'validation'
  | 'rate_limited'
  | 'network'
  | 'server'
  | 'invalid_token'
  | 'unknown_recoverable';

export type PasswordRecoveryUiError = {
  kind: PasswordRecoveryErrorKind;
  message: string;
  canRetry: boolean;
};

export type PasswordRuleStatus = {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  matches: boolean;
};

const FORGOT_FALLBACK = 'No se pudo enviar la solicitud. Intenta de nuevo.';
const RESET_FALLBACK = 'No se pudo restablecer la contraseña. Intenta de nuevo.';

export function normalizeRouteParam(param: string | string[] | undefined): string | null {
  if (typeof param === 'string' && param.length > 0) {
    return param;
  }
  if (Array.isArray(param) && param.length > 0 && typeof param[0] === 'string' && param[0].length > 0) {
    return param[0];
  }
  return null;
}

export function getPasswordRuleStatus(password: string, confirmPassword: string): PasswordRuleStatus {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    matches: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
  };
}

export function isResetPasswordValid(password: string, confirmPassword: string): boolean {
  const rules = getPasswordRuleStatus(password, confirmPassword);
  return rules.minLength && rules.hasLetter && rules.hasNumber && rules.matches;
}

function isInvalidTokenMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('token') || lower.includes('enlace') || lower.includes('expir');
}

export function mapPasswordRecoveryError(
  error: unknown,
  context: 'forgot' | 'reset',
): PasswordRecoveryUiError {
  const fallback = context === 'forgot' ? FORGOT_FALLBACK : RESET_FALLBACK;

  if (isNetworkError(error)) {
    return {
      kind: 'network',
      message: 'No hay conexión. Revisa tu red e intenta de nuevo.',
      canRetry: true,
    };
  }

  if (!(error instanceof ApiError)) {
    return {
      kind: 'unknown_recoverable',
      message: fallback,
      canRetry: true,
    };
  }

  if (error.status === 429) {
    return {
      kind: 'rate_limited',
      message: error.message || 'Demasiados intentos. Espera 15 minutos.',
      canRetry: false,
    };
  }

  if (error.status === 400 && context === 'reset' && isInvalidTokenMessage(error.message)) {
    return {
      kind: 'invalid_token',
      message: error.message || 'El enlace expiró o es inválido.',
      canRetry: false,
    };
  }

  if (error.status === 422) {
    return {
      kind: 'validation',
      message: error.message || 'La contraseña no cumple los requisitos.',
      canRetry: true,
    };
  }

  if (error.status === 400) {
    return {
      kind: 'validation',
      message: error.message || fallback,
      canRetry: true,
    };
  }

  if (error.code === 'SERVER_ERROR' || (error.status !== undefined && error.status >= 500)) {
    return {
      kind: 'server',
      message: error.message || 'Error del servidor. Intenta más tarde.',
      canRetry: true,
    };
  }

  return {
    kind: 'unknown_recoverable',
    message: error.message || fallback,
    canRetry: true,
  };
}
