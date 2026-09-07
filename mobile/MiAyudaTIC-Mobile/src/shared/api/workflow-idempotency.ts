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
  const created = globalThis.crypto.randomUUID();
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
