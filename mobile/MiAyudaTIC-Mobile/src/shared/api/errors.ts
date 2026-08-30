export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, code: ApiErrorCode, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function mapHttpStatusToCode(status: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 408) return 'TIMEOUT';
  if (status >= 400 && status < 500) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN_ERROR';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT');
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'UNAUTHORIZED';
}

export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'FORBIDDEN';
}

export function isPendingTechnicianMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('aprobación') || lower.includes('aprobacion');
}

export function isInactiveAccountMessage(message: string): boolean {
  return message.toLowerCase().includes('inactiva');
}

/** Errores recuperables en bootstrap (token se conserva). */
export function isRecoverableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT' ||
    error.code === 'SERVER_ERROR'
  );
}

export function getRestoreFailedReason(error: unknown): 'network' | 'timeout' | 'server' {
  if (error instanceof ApiError && error.code === 'TIMEOUT') {
    return 'timeout';
  }
  if (error instanceof ApiError && error.code === 'SERVER_ERROR') {
    return 'server';
  }
  return 'network';
}

/**
 * Matriz error → acción (bootstrap / auth).
 *
 * | Condición              | Token   | SessionStatus   | UI                    |
 * |------------------------|---------|-----------------|-----------------------|
 * | Sin token              | —       | guest           | welcome               |
 * | verify 200             | keep    | authenticated   | home por rol          |
 * | verify 401             | wipe    | expired         | session-expired       |
 * | verify 403             | wipe    | guest           | welcome / pending*    |
 * | verify red/timeout/5xx | keep    | restore_failed  | ErrorState + Reintentar |
 * | login credenciales     | —       | guest           | Alert                 |
 * | request autenticado 401| wipe    | expired         | session-expired       |
 *
 * * pending solo si el mensaje del backend indica aprobación pendiente.
 */
