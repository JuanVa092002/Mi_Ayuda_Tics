import {
  classifyWorkflowMutationFailure,
  executeWorkflowMutationOnce,
  fingerprintWorkflowPayload,
} from './workflow-retry-policy';

export type WorkflowAttemptAction =
  | 'assign'
  | 'reassign'
  | 'start'
  | 'update'
  | 'wait_for_requester'
  | 'requester_reply'
  | 'partial_solution'
  | 'resolve'
  | 'confirm'
  | 'reopen'
  | 'cancel';

export type WorkflowAttemptRecord = {
  key: string;
  action: WorkflowAttemptAction;
  solicitudId: string;
  payloadFingerprint: string;
  payload: unknown;
};

const attempts = new Map<string, WorkflowAttemptRecord>();

function createIdempotencyKey(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function scopeOf(action: WorkflowAttemptAction, solicitudId: string): string {
  return `${action}:${solicitudId}`;
}

export function peekWorkflowAttempt(
  action: WorkflowAttemptAction,
  solicitudId: string,
): WorkflowAttemptRecord | undefined {
  return attempts.get(scopeOf(action, solicitudId));
}

export function peekWorkflowAttemptKey(
  action: WorkflowAttemptAction,
  solicitudId: string,
): string | undefined {
  return peekWorkflowAttempt(action, solicitudId)?.key;
}

/** One UUID per user intention (action + ticket + payload). Manual retries reuse it. */
export function getWorkflowAttemptKey(
  action: WorkflowAttemptAction,
  solicitudId: string,
  payload?: unknown,
): string {
  const scope = scopeOf(action, solicitudId);
  const payloadFingerprint = fingerprintWorkflowPayload(payload);
  const existing = attempts.get(scope);
  if (existing && existing.payloadFingerprint === payloadFingerprint) {
    return existing.key;
  }
  const created = createIdempotencyKey();
  attempts.set(scope, {
    key: created,
    action,
    solicitudId,
    payloadFingerprint,
    payload,
  });
  return created;
}

export function clearWorkflowAttemptKey(
  action: WorkflowAttemptAction,
  solicitudId: string,
): void {
  attempts.delete(scopeOf(action, solicitudId));
}

export function clearAllWorkflowAttemptKeys(): void {
  attempts.clear();
}

/** Keep the key for a later manual CTA. Never used to schedule automatic retries. */
export function shouldKeepWorkflowAttempt(status: number | undefined): boolean {
  if (status === undefined) return true;
  return status >= 500 || status === 429 || status === 408;
}

export async function runWithWorkflowAttempt<T>(
  action: WorkflowAttemptAction,
  solicitudId: string,
  execute: (idempotencyKey: string) => Promise<T>,
  payload?: unknown,
): Promise<T> {
  const key = getWorkflowAttemptKey(action, solicitudId, payload);
  try {
    const result = await executeWorkflowMutationOnce(() => execute(key));
    clearWorkflowAttemptKey(action, solicitudId);
    return result;
  } catch (error) {
    const failure = classifyWorkflowMutationFailure(error);
    if (!failure.keepAttempt) {
      clearWorkflowAttemptKey(action, solicitudId);
    }
    throw error;
  }
}
