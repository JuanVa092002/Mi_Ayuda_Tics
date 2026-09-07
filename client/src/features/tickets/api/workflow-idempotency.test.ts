import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearAllWorkflowAttemptKeys,
  getWorkflowAttemptKey,
  peekWorkflowAttempt,
  peekWorkflowAttemptKey,
  runWithWorkflowAttempt,
} from './workflow-idempotency'
import {
  WORKFLOW_V2_MUTATION_AUTO_RETRY,
  WORKFLOW_V2_MUTATIONS,
  classifyWorkflowMutationFailure,
  executeWorkflowMutationOnce,
  fingerprintWorkflowPayload,
  getWorkflowManualRetryView,
  parseRetryAfterHeader,
} from './workflow-retry-policy'
import axiosConfig from '@/shared/api/axios'

describe('workflow v2 retry policy', () => {
  afterEach(() => {
    clearAllWorkflowAttemptKeys()
  })

  it('todas las mutaciones workflow v2 tienen retry automático 0', () => {
    expect(WORKFLOW_V2_MUTATION_AUTO_RETRY).toBe(0)
    expect(WORKFLOW_V2_MUTATIONS).toEqual([
      'reasignarTecnico',
      'iniciarAtencion',
      'actualizacion',
      'solicitarInformacion',
      'solucionParcial',
      'solucionTotal',
      'responder',
      'confirmarSolucion',
      'reabrir',
      'cancelar',
      'asignarTecnico',
    ])
    expect(axiosConfig.interceptors.response).toBeDefined()
  })

  it('un timeout conserva la key para CTA manual', async () => {
    const execute = vi.fn(async () => {
      throw { code: 'ECONNABORTED' }
    })
    await expect(runWithWorkflowAttempt('start', 'ticket-1', execute)).rejects.toMatchObject({
      code: 'ECONNABORTED',
    })
    expect(execute).toHaveBeenCalledTimes(1)
    expect(peekWorkflowAttemptKey('start', 'ticket-1')).toBeDefined()
  })

  it('retry manual con el mismo payload reutiliza la key', async () => {
    const payload = { mensaje: 'mismo' }
    const first = getWorkflowAttemptKey('update', 'ticket-1', payload)
    await expect(
      runWithWorkflowAttempt('update', 'ticket-1', async () => {
        throw { status: 503 }
      }, payload),
    ).rejects.toMatchObject({ status: 503 })
    const second = getWorkflowAttemptKey('update', 'ticket-1', payload)
    expect(second).toBe(first)
    const snapshot = peekWorkflowAttempt('update', 'ticket-1')
    expect(snapshot).toMatchObject({
      action: 'update',
      solicitudId: 'ticket-1',
      key: first,
      payload,
    })
  })

  it('modificar payload crea una key nueva', () => {
    const first = getWorkflowAttemptKey('update', 'ticket-1', { mensaje: 'uno' })
    const second = getWorkflowAttemptKey('update', 'ticket-1', { mensaje: 'dos' })
    expect(second).not.toBe(first)
    expect(fingerprintWorkflowPayload({ mensaje: 'uno' })).not.toBe(
      fingerprintWorkflowPayload({ mensaje: 'dos' }),
    )
  })

  it('429 no ejecuta retry automático', async () => {
    const execute = vi.fn(async () => {
      throw { status: 429, response: { status: 429, headers: { 'retry-after': '12' } } }
    })
    await expect(runWithWorkflowAttempt('resolve', 'ticket-1', execute)).rejects.toMatchObject({
      status: 429,
    })
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('429 con Retry-After expone espera sin loop automático', () => {
    const now = 1_700_000_000_000
    const parsed = parseRetryAfterHeader('15', now)
    expect(parsed).toEqual({ seconds: 15, until: now + 15_000 })
    const failure = classifyWorkflowMutationFailure(
      { status: 429, response: { status: 429, headers: { 'retry-after': '15' } } },
      now,
    )
    expect(failure.autoRetry).toBe(0)
    const view = getWorkflowManualRetryView(failure, { now })
    expect(view.showCta).toBe(true)
    expect(view.ctaEnabled).toBe(false)
    expect(view.waitSecondsRemaining).toBe(15)
    expect(view.ctaLabel).toBe('Reintentar acción')
  })

  it('500 no ejecuta retry automático', async () => {
    const execute = vi.fn(async () => {
      throw { status: 500 }
    })
    await expect(runWithWorkflowAttempt('start', 'ticket-1', execute)).rejects.toMatchObject({
      status: 500,
    })
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('NETWORK_ERROR no ejecuta retry automático', async () => {
    const execute = vi.fn(async () => {
      throw { code: 'NETWORK_ERROR' }
    })
    await expect(runWithWorkflowAttempt('cancel', 'ticket-1', execute, { motivo: 'corte' })).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    })
    expect(execute).toHaveBeenCalledTimes(1)
    const once = vi.fn(async () => {
      throw { code: 'ERR_NETWORK' }
    })
    await expect(executeWorkflowMutationOnce(once)).rejects.toMatchObject({ code: 'ERR_NETWORK' })
    expect(once).toHaveBeenCalledTimes(1)
  })

  it('replay manual reenvía la misma key y payload sin duplicar la intención', async () => {
    const payload = { queSeHizo: 'reinicio' }
    const sent: Array<{ key: string; payload: unknown }> = []
    await expect(
      runWithWorkflowAttempt('resolve', 'ticket-1', async (key) => {
        sent.push({ key, payload })
        throw { status: 504 }
      }, payload),
    ).rejects.toMatchObject({ status: 504 })
    await expect(
      runWithWorkflowAttempt('resolve', 'ticket-1', async (key) => {
        sent.push({ key, payload })
        return { ok: true }
      }, payload),
    ).resolves.toEqual({ ok: true })
    expect(sent).toHaveLength(2)
    expect(sent[0]?.key).toBe(sent[1]?.key)
    expect(sent[0]?.payload).toEqual(sent[1]?.payload)
  })

  it('reintento manual no cambia actor, acción ni payload', async () => {
    const payload = { motivo: 'mismo motivo' }
    await expect(
      runWithWorkflowAttempt('reopen', 'ticket-9', async () => {
        throw { status: 503 }
      }, payload),
    ).rejects.toMatchObject({ status: 503 })
    const before = peekWorkflowAttempt('reopen', 'ticket-9')
    await runWithWorkflowAttempt('reopen', 'ticket-9', async (key) => {
      expect(key).toBe(before?.key)
      expect(peekWorkflowAttempt('reopen', 'ticket-9')).toMatchObject({
        action: 'reopen',
        solicitudId: 'ticket-9',
        payload,
      })
      return { ok: true }
    }, payload)
  })
})
