import { describe, expect, it } from 'vitest'
import {
  assertIdempotentReplayAllowed,
  requireClientOperationId,
  workflowPayloadHash,
} from '../features/tickets/domain/workflow-idempotency'

const tecnico = { id: '60d0fe4f5311236168a109bb', rol: 'tecnico' as const }

describe('workflowPayloadHash', () => {
  it('es estable para el mismo payload de negocio', () => {
    const payload = { queSeHizo: 'Cambio de switch', operationId: 'ignored' }
    expect(workflowPayloadHash('resolve', payload)).toBe(workflowPayloadHash('resolve', payload))
  })

  it('cambia si cambia el payload de negocio', () => {
    expect(workflowPayloadHash('resolve', { queSeHizo: 'A' })).not.toBe(
      workflowPayloadHash('resolve', { queSeHizo: 'B' }),
    )
  })

  it('no incluye password, JWT ni Authorization', () => {
    const hash = workflowPayloadHash('resolve', {
      queSeHizo: 'Cambio de switch',
      password: 'secret',
      jwt: 'header.payload.sig',
      Authorization: 'Bearer abc',
    } as never)
    expect(hash).toBe(workflowPayloadHash('resolve', { queSeHizo: 'Cambio de switch' }))
    expect(hash).not.toMatch(/secret|Bearer|password|Authorization/i)
  })
})

describe('assertIdempotentReplayAllowed', () => {
  const payloadHash = workflowPayloadHash('resolve', { queSeHizo: 'Listo' })

  it('permite replay idéntico', () => {
    expect(
      assertIdempotentReplayAllowed({
        stored: { author: tecnico.id, actionType: 'resolve', payloadHash },
        actor: tecnico,
        action: 'resolve',
        payloadHash,
      }),
    ).toBeNull()
  })

  it('rechaza payload, acción o actor distinto sin filtrar el previo', () => {
    const conflict = { status: 409, message: 'La clave de idempotencia no puede reutilizarse.' }
    expect(
      assertIdempotentReplayAllowed({
        stored: { author: tecnico.id, actionType: 'resolve', payloadHash },
        actor: tecnico,
        action: 'resolve',
        payloadHash: workflowPayloadHash('resolve', { queSeHizo: 'Otro' }),
      }),
    ).toEqual(conflict)
    expect(
      assertIdempotentReplayAllowed({
        stored: { author: tecnico.id, actionType: 'resolve', payloadHash },
        actor: tecnico,
        action: 'partial_solution',
        payloadHash,
      }),
    ).toEqual(conflict)
    expect(
      assertIdempotentReplayAllowed({
        stored: { author: tecnico.id, actionType: 'resolve', payloadHash },
        actor: { ...tecnico, id: '60d0fe4f5311236168a109bd' },
        action: 'resolve',
        payloadHash,
      }),
    ).toEqual(conflict)
  })
})

describe('requireClientOperationId', () => {
  it('rechaza ausencia de key sin generar un valor', () => {
    let missing: unknown
    try {
      requireClientOperationId(undefined)
    } catch (error) {
      missing = error
    }
    expect(missing).toMatchObject({ status: 400, code: 'IDEMPOTENCY_KEY_REQUIRED' })
    let blank: unknown
    try {
      requireClientOperationId('   ')
    } catch (error) {
      blank = error
    }
    expect(blank).toMatchObject({ code: 'IDEMPOTENCY_KEY_REQUIRED' })
  })

  it('acepta la key del cliente', () => {
    expect(requireClientOperationId('client-key-1234')).toBe('client-key-1234')
  })
})
