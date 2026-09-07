import type { ApiErrorCode } from '@/shared/api/errors';
import { ApiError, API_ERROR_COPY } from '@/shared/api/errors';
import { isClientAbortError } from '@/shared/api/fetch-error';
import type { LoginResult } from './session-types';

export const LOGIN_RETRY_DELAY_MS = 2_000;
export const LOGIN_MAX_ATTEMPTS = 2;

export const LOGIN_CONNECTING_TITLE = 'Estamos conectando con el servicio.';
export const LOGIN_CONNECTING_BODY =
  'Esto puede tardar unos segundos mientras se inicia.';

export const LOGIN_TIMEOUT_EXHAUSTED_COPY =
  'El servicio tardó demasiado en responder. Intenta nuevamente.';

const RETRYABLE_CODES: ReadonlySet<ApiErrorCode> = new Set([
  'TIMEOUT',
  'GATEWAY_RECOVERABLE',
]);

export function isLoginRetryableError(error: unknown): boolean {
  if (isClientAbortError(error)) return true;
  return error instanceof ApiError && RETRYABLE_CODES.has(error.code);
}

export function isLoginRetryableFailure(result: LoginResult): boolean {
  if (result.ok) return false;
  return result.code === 'TIMEOUT' || result.code === 'GATEWAY_RECOVERABLE';
}

export function finalizeLoginFailure(result: LoginResult, attempts: number): LoginResult {
  if (result.ok || attempts < LOGIN_MAX_ATTEMPTS) {
    return result;
  }
  if (result.code === 'TIMEOUT') {
    return { ...result, message: LOGIN_TIMEOUT_EXHAUSTED_COPY };
  }
  if (result.code === 'GATEWAY_RECOVERABLE') {
    return { ...result, message: API_ERROR_COPY.GATEWAY_RECOVERABLE };
  }
  return result;
}

export function createSubmitLock(): {
  tryAcquire: () => boolean;
  release: () => void;
  isHeld: () => boolean;
} {
  let held = false;
  return {
    tryAcquire: () => {
      if (held) return false;
      held = true;
      return true;
    },
    release: () => {
      held = false;
    },
    isHeld: () => held,
  };
}

export async function delayUnlessCancelled(
  ms: number,
  options: {
    isCancelled: () => boolean;
    skipRemaining?: () => boolean;
    sleep?: (chunkMs: number) => Promise<void>;
  },
): Promise<'cancelled' | 'skipped' | 'elapsed'> {
  const sleep = options.sleep ?? ((chunk) => new Promise((resolve) => setTimeout(resolve, chunk)));
  const step = 50;
  let waited = 0;
  while (waited < ms) {
    if (options.isCancelled()) return 'cancelled';
    if (options.skipRemaining?.()) return 'skipped';
    const chunk = Math.min(step, ms - waited);
    await sleep(chunk);
    waited += chunk;
  }
  return options.isCancelled() ? 'cancelled' : 'elapsed';
}

export async function runLoginWithSingleRetry(
  attempt: () => Promise<LoginResult>,
  options: {
    isCancelled: () => boolean;
    onBeforeRetry?: () => void;
    sleep?: (chunkMs: number) => Promise<void>;
    skipRemaining?: () => boolean;
  },
): Promise<LoginResult> {
  const first = await attempt();
  if (first.ok || !isLoginRetryableFailure(first) || options.isCancelled()) {
    return first;
  }

  options.onBeforeRetry?.();
  const wait = await delayUnlessCancelled(LOGIN_RETRY_DELAY_MS, options);
  if (wait === 'cancelled' || options.isCancelled()) {
    return first;
  }

  const second = await attempt();
  return finalizeLoginFailure(second, LOGIN_MAX_ATTEMPTS);
}

export function loginControlLog(payload: Record<string, unknown>): Record<string, unknown> {
  const blocked = ['password', 'Authorization', 'token', 'correo'];
  for (const key of Object.keys(payload)) {
    if (blocked.some((name) => name.toLowerCase() === key.toLowerCase())) {
      throw new Error(`login log must not include ${key}`);
    }
  }
  return payload;
}
