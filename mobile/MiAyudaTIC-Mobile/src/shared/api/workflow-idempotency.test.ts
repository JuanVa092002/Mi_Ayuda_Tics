import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/shared/query/client';
import {
  clearAllWorkflowAttemptKeys,
  getWorkflowAttemptKey,
  peekWorkflowAttempt,
  peekWorkflowAttemptKey,
  runWithWorkflowAttempt,
} from './workflow-idempotency';
import {
  WORKFLOW_V2_MUTATION_AUTO_RETRY,
  WORKFLOW_V2_MUTATIONS,
  classifyWorkflowMutationFailure,
  executeWorkflowMutationOnce,
  getWorkflowManualRetryView,
  parseRetryAfterHeader,
} from './workflow-retry-policy';

describe('workflow v2 retry policy', () => {
  afterEach(() => {
    clearAllWorkflowAttemptKeys();
  });

  it('todas las mutaciones workflow v2 tienen retry automático 0', () => {
    expect(WORKFLOW_V2_MUTATION_AUTO_RETRY).toBe(0);
    expect(WORKFLOW_V2_MUTATIONS).toHaveLength(11);
    expect(queryClient.getDefaultOptions().mutations?.retry ?? 0).toBe(0);
  });

  it('un timeout conserva la key para CTA manual', async () => {
    const execute = vi.fn(async () => {
      throw { code: 'TIMEOUT', status: 408 };
    });
    await expect(runWithWorkflowAttempt('start', 'ticket-1', execute)).rejects.toMatchObject({
      code: 'TIMEOUT',
    });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(peekWorkflowAttemptKey('start', 'ticket-1')).toBeDefined();
  });

  it('retry manual con el mismo payload reutiliza la key', async () => {
    const payload = { mensaje: 'mismo' };
    const first = getWorkflowAttemptKey('update', 'ticket-1', payload);
    await expect(
      runWithWorkflowAttempt(
        'update',
        'ticket-1',
        async () => {
          throw { status: 503 };
        },
        payload,
      ),
    ).rejects.toMatchObject({ status: 503 });
    expect(getWorkflowAttemptKey('update', 'ticket-1', payload)).toBe(first);
  });

  it('modificar payload crea una key nueva', () => {
    const first = getWorkflowAttemptKey('update', 'ticket-1', { mensaje: 'uno' });
    expect(getWorkflowAttemptKey('update', 'ticket-1', { mensaje: 'dos' })).not.toBe(first);
  });

  it('429 no ejecuta retry automático', async () => {
    const execute = vi.fn(async () => {
      throw { status: 429, code: 'RATE_LIMITED', details: { retryAfter: '20' } };
    });
    await expect(runWithWorkflowAttempt('resolve', 'ticket-1', execute)).rejects.toMatchObject({
      status: 429,
    });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('429 con Retry-After expone espera sin loop automático', () => {
    const now = 1_700_000_000_000;
    expect(parseRetryAfterHeader('20', now)?.seconds).toBe(20);
    const failure = classifyWorkflowMutationFailure(
      { status: 429, code: 'RATE_LIMITED', details: { retryAfter: '20' } },
      now,
    );
    const view = getWorkflowManualRetryView(failure, { now });
    expect(failure.autoRetry).toBe(0);
    expect(view.ctaEnabled).toBe(false);
    expect(view.waitSecondsRemaining).toBe(20);
    expect(view.ctaLabel).toBe('Reintentar acción');
  });

  it('500 no ejecuta retry automático', async () => {
    const execute = vi.fn(async () => {
      throw { status: 500, code: 'SERVER_ERROR' };
    });
    await expect(runWithWorkflowAttempt('start', 'ticket-1', execute)).rejects.toMatchObject({
      status: 500,
    });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('NETWORK_ERROR no ejecuta retry automático', async () => {
    const execute = vi.fn(async () => {
      throw { code: 'NETWORK_ERROR' };
    });
    await expect(runWithWorkflowAttempt('confirm', 'ticket-1', execute)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
    expect(execute).toHaveBeenCalledTimes(1);
    const once = vi.fn(async () => {
      throw { code: 'CONNECTION_ERROR' };
    });
    await expect(executeWorkflowMutationOnce(once)).rejects.toMatchObject({ code: 'CONNECTION_ERROR' });
    expect(once).toHaveBeenCalledTimes(1);
  });

  it('replay manual reenvía la misma key y payload', async () => {
    const payload = { motivo: 'corte' };
    const keys: string[] = [];
    await expect(
      runWithWorkflowAttempt(
        'reopen',
        'ticket-1',
        async (key) => {
          keys.push(key);
          throw { status: 504 };
        },
        payload,
      ),
    ).rejects.toMatchObject({ status: 504 });
    await runWithWorkflowAttempt(
      'reopen',
      'ticket-1',
      async (key) => {
        keys.push(key);
      },
      payload,
    );
    expect(keys[0]).toBe(keys[1]);
  });

  it('reintento manual no cambia actor, acción ni payload', async () => {
    const payload = { mensaje: 'info' };
    await expect(
      runWithWorkflowAttempt(
        'wait_for_requester',
        'ticket-4',
        async () => {
          throw { status: 503 };
        },
        payload,
      ),
    ).rejects.toMatchObject({ status: 503 });
    const before = peekWorkflowAttempt('wait_for_requester', 'ticket-4');
    await runWithWorkflowAttempt(
      'wait_for_requester',
      'ticket-4',
      async (key) => {
        expect(key).toBe(before?.key);
        expect(peekWorkflowAttempt('wait_for_requester', 'ticket-4')).toMatchObject({
          action: 'wait_for_requester',
          solicitudId: 'ticket-4',
          payload,
        });
      },
      payload,
    );
  });
});
