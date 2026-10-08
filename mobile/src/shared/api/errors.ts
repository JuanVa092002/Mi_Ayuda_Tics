export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'CONNECTION_ERROR'
  | 'OFFLINE'
  | 'GATEWAY_RECOVERABLE'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export const API_ERROR_COPY = {
  TIMEOUT: 'El servicio está tardando en responder. Intenta nuevamente en unos segundos.',
  GATEWAY_RECOVERABLE: 'El servicio se está iniciando o está temporalmente ocupado.',
  CONNECTION_ERROR: 'No pudimos conectar con el servicio.',
  OFFLINE: 'Sin conexión. Revisa tu Wi‑Fi o datos móviles.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  SERVER_ERROR: 'El servicio presenta un problema temporal.',
  RATE_LIMITED: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
} as const;

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
  if (status === 401) return 'INVALID_CREDENTIALS';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 408) return 'TIMEOUT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 502 || status === 503 || status === 504) return 'GATEWAY_RECOVERABLE';
  if (status >= 400 && status < 500) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN_ERROR';
}

/** User-facing copy. Validation / 403 keep the server field message. */
export function resolveErrorMessage(code: ApiErrorCode, serverMessage: string): string {
  switch (code) {
    case 'TIMEOUT':
      return API_ERROR_COPY.TIMEOUT;
    case 'GATEWAY_RECOVERABLE':
      return API_ERROR_COPY.GATEWAY_RECOVERABLE;
    case 'CONNECTION_ERROR':
      return API_ERROR_COPY.CONNECTION_ERROR;
    case 'OFFLINE':
      return API_ERROR_COPY.OFFLINE;
    case 'INVALID_CREDENTIALS':
      return API_ERROR_COPY.INVALID_CREDENTIALS;
    case 'SERVER_ERROR':
      return API_ERROR_COPY.SERVER_ERROR;
    case 'RATE_LIMITED':
      return serverMessage || API_ERROR_COPY.RATE_LIMITED;
    default:
      return serverMessage;
  }
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      error.code === 'CONNECTION_ERROR' ||
      error.code === 'OFFLINE')
  );
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === 'UNAUTHORIZED' ||
      error.code === 'INVALID_CREDENTIALS' ||
      error.status === 401)
  );
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
    error.code === 'CONNECTION_ERROR' ||
    error.code === 'OFFLINE' ||
    error.code === 'GATEWAY_RECOVERABLE' ||
    error.code === 'SERVER_ERROR'
  );
}

export function getRestoreFailedReason(error: unknown): 'network' | 'timeout' | 'server' {
  if (error instanceof ApiError && error.code === 'TIMEOUT') {
    return 'timeout';
  }
  if (
    error instanceof ApiError &&
    (error.code === 'SERVER_ERROR' || error.code === 'GATEWAY_RECOVERABLE')
  ) {
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
