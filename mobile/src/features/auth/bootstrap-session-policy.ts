import {
  ApiError,
  getRestoreFailedReason,
  isForbiddenError,
  isRecoverableError,
  isUnauthorizedError,
} from '@/shared/api/errors';
import type { SessionStatus } from './session-types';

export type BootstrapFailureOutcome =
  | { kind: 'expired' }
  | { kind: 'guest' }
  | { kind: 'restore_failed'; session: Extract<SessionStatus, { state: 'restore_failed' }> };

export type BackgroundRevalidateOutcome = 'keep' | 'expired' | 'guest';

/** Resultado de bootstrap cuando verify-session falla (token presente). */
export function resolveBootstrapFailure(error: unknown): BootstrapFailureOutcome {
  if (isUnauthorizedError(error)) {
    return { kind: 'expired' };
  }

  if (isForbiddenError(error) && error instanceof ApiError) {
    return { kind: 'guest' };
  }

  if (isRecoverableError(error)) {
    return {
      kind: 'restore_failed',
      session: { state: 'restore_failed', reason: getRestoreFailedReason(error) },
    };
  }

  return { kind: 'guest' };
}

/** Resultado de revalidación al volver de background (sesión autenticada). */
export function resolveBackgroundRevalidateFailure(error: unknown): BackgroundRevalidateOutcome {
  if (isUnauthorizedError(error)) {
    return 'expired';
  }

  if (isForbiddenError(error) && error instanceof ApiError) {
    return 'guest';
  }

  return 'keep';
}

export function shouldRevalidateOnForeground(
  session: SessionStatus,
): session is Extract<SessionStatus, { state: 'authenticated' }> {
  return session.state === 'authenticated';
}
