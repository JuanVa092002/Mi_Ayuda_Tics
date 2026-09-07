import { beforeEach, describe, expect, it, vi } from 'vitest'
import mongoose, { Types } from 'mongoose'
import Solicitud from '../features/tickets/models/solicitud'
import HistorialSolicitud from '../features/tickets/models/historialSolicitud'
import { applySolicitudWorkflowAction } from '../features/tickets/domain/solicitud-workflow'
import { workflowPayloadHash } from '../features/tickets/domain/workflow-idempotency'
import type { SolicitudWorkflowAction } from '../features/tickets/domain/solicitud-lifecycle'

const lider = { id: '60d0fe4f5311236168a109ba', rol: 'lider' as const }
const tecnico = { id: '60d0fe4f5311236168a109bb', rol: 'tecnico' as const }
const funcionario = { id: '60d0fe4f5311236168a109bc', rol: 'funcionario' as const }
const otherTech = '60d0fe4f5311236168a109bd'

function mockFindOneResult(value: unknown) {
  return {
    session: vi.fn().mockReturnThis(),
    then(onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
      return Promise.resolve(value).then(onFulfilled, onRejected)
    },
  }
}

function mockNoExistingOperation() {
  vi.spyOn(HistorialSolicitud, 'findOne').mockReturnValue(mockFindOneResult(null) as never)
}

function storedReplay(
  action: SolicitudWorkflowAction,
  actor: { id: string },
  payload: Record<string, unknown>,
) {
  return {
    type: action,
    operationId: payload.operationId,
    author: actor.id,
    actionType: action,
    payloadHash: workflowPayloadHash(action, payload),
  }
}

function mockSession() {
  return {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    abortTransaction: vi.fn(),
    endSession: vi.fn(),
  }
}

function v2Ticket(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId('60d0fe4f5311236168a109aa'),
    estado: 'en_progreso',
    workflowVersion: 2,
    usuario: funcionario.id,
    tecnico: tecnico.id,
    codigoCaso: '2026-09-00001',
    ...overrides,
  }
}

describe('applySolicitudWorkflowAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rechaza tickets legacy sin mutarlos', async () => {
    const updateSpy = vi.spyOn(Solicitud, 'findOneAndUpdate')
    const createSpy = vi.spyOn(HistorialSolicitud, 'create')
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ workflowVersion: undefined, estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
        payload: { operationId: 'op-legacy-start' },
      }),
    ).rejects.toMatchObject({ status: 409 })
    expect(updateSpy).not.toHaveBeenCalled()
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('solución parcial mantiene en_progreso y no bloquea una total posterior', async () => {
    mockNoExistingOperation()
    const createSpy = vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({
      type: 'partial_solution',
    } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso' }) as never,
    )

    const partial = await applySolicitudWorkflowAction({
      solicitud: v2Ticket() as never,
      action: 'partial_solution',
      actor: tecnico,
      payload: {
        operationId: 'op-partial-1',
        queSeHizo: 'Reinicio del switch',
        queFalta: 'Validar cableado',
        siguienteAccion: 'Revisar patch panel',
      },
    })
    expect(partial.solicitud.estado).toBe('en_progreso')
    expect(createSpy).toHaveBeenCalledTimes(1)

    mockNoExistingOperation()
    createSpy.mockResolvedValue({ type: 'resolved' } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'resuelto' }) as never,
    )
    const total = await applySolicitudWorkflowAction({
      solicitud: v2Ticket() as never,
      action: 'resolve',
      actor: tecnico,
      payload: { operationId: 'op-resolve-1', queSeHizo: 'Se reemplazó el switch' },
    })
    expect(total.solicitud.estado).toBe('resuelto')
  })

  it('confirmación cierra y reapertura vuelve a en_progreso', async () => {
    mockNoExistingOperation()
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({ type: 'closed' } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'cerrado' }) as never,
    )
    const closed = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'resuelto' }) as never,
      action: 'confirm',
      actor: funcionario,
      payload: { operationId: 'op-confirm-1' },
    })
    expect(closed.solicitud.estado).toBe('cerrado')

    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso' }) as never,
    )
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({ type: 'reopened' } as never)
    const reopened = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'resuelto' }) as never,
      action: 'reopen',
      actor: funcionario,
      payload: { operationId: 'op-reopen-1', motivo: 'El problema continúa después del reinicio' },
    })
    expect(reopened.solicitud.estado).toBe('en_progreso')
  })

  it('solo el técnico asignado inicia o resuelve', async () => {
    mockNoExistingOperation()
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: { ...tecnico, id: otherTech },
        payload: { operationId: 'op-other-tech' },
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('funcionario no responde fuera de esperando_usuario', async () => {
    mockNoExistingOperation()
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'en_progreso' }) as never,
        action: 'requester_reply',
        actor: funcionario,
        payload: { operationId: 'op-reply-wrong', mensaje: 'Adjunto la clave del aula' },
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('doble submit del mismo operationId no crea un segundo evento', async () => {
    const payload = { operationId: 'op-start-1' }
    const existing = storedReplay('start', tecnico, payload)
    vi.spyOn(HistorialSolicitud, 'findOne').mockResolvedValue(existing as never)
    const createSpy = vi.spyOn(HistorialSolicitud, 'create')
    const updateSpy = vi.spyOn(Solicitud, 'findOneAndUpdate')
    vi.spyOn(Solicitud, 'findById').mockResolvedValue(v2Ticket({ estado: 'en_progreso' }) as never)
    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload,
    })
    expect(result.idempotent).toBe(true)
    expect(result.event).toMatchObject({ actionType: 'start', operationId: 'op-start-1' })
    expect(createSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('iniciar atención sin Idempotency-Key no genera UUID y responde 400', async () => {
    mockNoExistingOperation()
    const createSpy = vi.spyOn(HistorialSolicitud, 'create')
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'IDEMPOTENCY_KEY_REQUIRED',
    })
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('cancelar conserva el ticket y registra cancelled', async () => {
    mockNoExistingOperation()
    const createSpy = vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({
      type: 'cancelled',
    } as never)
    const deleteSpy = vi.spyOn(Solicitud, 'findByIdAndDelete')
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'cancelado' }) as never,
    )
    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'nuevo', tecnico: undefined }) as never,
      action: 'cancel',
      actor: lider,
      payload: { operationId: 'op-cancel-1', motivo: 'Duplicada por el funcionario' },
    })
    expect(result.solicitud.estado).toBe('cancelado')
    expect(createSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).not.toHaveBeenCalled()
  })
})

describe('reasignación workflow v2', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockNoExistingOperation()
  })

  it('reasigna desde asignado y crea un evento reassigned', async () => {
    const createSpy = vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({
      type: 'reassigned',
    } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'asignado', tecnico: otherTech }) as never,
    )
    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'reassign',
      actor: lider,
      payload: {
        operationId: 'op-reassign-asignado',
        tecnicoId: otherTech,
        tecnicoNombre: 'Ana Técnico',
        motivo: 'Balance de carga del equipo',
      },
    })
    expect(result.solicitud.estado).toBe('asignado')
    expect(createSpy).toHaveBeenCalledTimes(1)
    const created = createSpy.mock.calls[0]?.[0] as { type?: string; message?: string }
    expect(created.type).toBe('reassigned')
    expect(created.message).toContain('Ana Técnico')
    expect(created.message).toContain('Balance de carga del equipo')
  })

  it('reasigna desde en_progreso y termina en asignado', async () => {
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({ type: 'reassigned' } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'asignado', tecnico: otherTech }) as never,
    )
    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'en_progreso' }) as never,
      action: 'reassign',
      actor: lider,
      payload: {
        operationId: 'op-reassign-progress',
        tecnicoId: otherTech,
        tecnicoNombre: 'Ana Técnico',
        motivo: 'El técnico actual no puede continuar',
      },
    })
    expect(result.solicitud.estado).toBe('asignado')
  })

  it('reasigna desde esperando_usuario y conserva el estado', async () => {
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({ type: 'reassigned' } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'esperando_usuario', tecnico: otherTech }) as never,
    )
    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'esperando_usuario' }) as never,
      action: 'reassign',
      actor: lider,
      payload: {
        operationId: 'op-reassign-waiting',
        tecnicoId: otherTech,
        tecnicoNombre: 'Ana Técnico',
        motivo: 'Cobertura durante ausencia',
      },
    })
    expect(result.solicitud.estado).toBe('esperando_usuario')
  })

  it('rechaza reasignación desde nuevo, resuelto, cerrado y cancelado', async () => {
    for (const estado of ['nuevo', 'resuelto', 'cerrado', 'cancelado'] as const) {
      await expect(
        applySolicitudWorkflowAction({
          solicitud: v2Ticket({ estado, tecnico: estado === 'nuevo' ? undefined : tecnico.id }) as never,
          action: 'reassign',
          actor: lider,
          payload: { operationId: 'op-reassign-bad-state', tecnicoId: otherTech, motivo: 'No aplica en este estado' },
        }),
      ).rejects.toMatchObject({ status: 409 })
    }
  })

  it('exige motivo de reasignación', async () => {
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'reassign',
        actor: lider,
        payload: { operationId: 'op-reassign-blank', tecnicoId: otherTech, motivo: '  ' },
      }),
    ).rejects.toMatchObject({ status: 422 })
  })

  it('no permite reasignación por técnico o funcionario', async () => {
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'reassign',
        actor: tecnico,
        payload: { operationId: 'op-reassign-tech', tecnicoId: otherTech, motivo: 'Intento del técnico' },
      }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'reassign',
        actor: funcionario,
        payload: { operationId: 'op-reassign-fun', tecnicoId: otherTech, motivo: 'Intento del funcionario' },
      }),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe('idempotencia persistente C4', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('doble iniciar atención con el mismo operationId no duplica el evento', async () => {
    const payload = { operationId: 'start-dup' }
    const event = storedReplay('start', tecnico, payload)
    const findSpy = vi
      .spyOn(HistorialSolicitud, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValue(event as never)
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue(event as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso' }) as never,
    )
    vi.spyOn(Solicitud, 'findById').mockResolvedValue(v2Ticket({ estado: 'en_progreso' }) as never)

    const first = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload,
    })
    const second = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload,
    })
    expect(first.idempotent).toBe(false)
    expect(second.idempotent).toBe(true)
    expect(second.event).toMatchObject({ actionType: 'start', payloadHash: event.payloadHash })
    expect(HistorialSolicitud.create).toHaveBeenCalledTimes(1)
    expect(findSpy).toHaveBeenCalled()
  })

  it('doble solución parcial, total, confirmación, reapertura, cancelación y reasignación respetan operationId', async () => {
    const cases = [
      {
        action: 'partial_solution' as const,
        estado: 'en_progreso',
        actor: tecnico,
        payload: {
          operationId: 'dup-partial',
          queSeHizo: 'Avance',
          queFalta: 'Cable',
          siguienteAccion: 'Validar',
        },
        next: 'en_progreso',
      },
      {
        action: 'resolve' as const,
        estado: 'en_progreso',
        actor: tecnico,
        payload: { operationId: 'dup-resolve', queSeHizo: 'Cambio de switch' },
        next: 'resuelto',
      },
      {
        action: 'confirm' as const,
        estado: 'resuelto',
        actor: funcionario,
        payload: { operationId: 'dup-confirm' },
        next: 'cerrado',
      },
      {
        action: 'reopen' as const,
        estado: 'resuelto',
        actor: funcionario,
        payload: { operationId: 'dup-reopen', motivo: 'Sigue fallando el acceso' },
        next: 'en_progreso',
      },
      {
        action: 'cancel' as const,
        estado: 'nuevo',
        actor: lider,
        payload: { operationId: 'dup-cancel', motivo: 'Duplicada' },
        next: 'cancelado',
      },
      {
        action: 'reassign' as const,
        estado: 'asignado',
        actor: lider,
        payload: {
          operationId: 'dup-reassign',
          tecnicoId: otherTech,
          tecnicoNombre: 'Ana',
          motivo: 'Cobertura',
        },
        next: 'asignado',
      },
    ]

    for (const item of cases) {
      vi.restoreAllMocks()
      const event = storedReplay(item.action, item.actor, item.payload)
      vi.spyOn(HistorialSolicitud, 'findOne').mockResolvedValueOnce(null).mockResolvedValue(event as never)
      const createSpy = vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue(event as never)
      vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
        v2Ticket({ estado: item.next, tecnico: item.action === 'cancel' ? undefined : tecnico.id }) as never,
      )
      vi.spyOn(Solicitud, 'findById').mockResolvedValue(
        v2Ticket({ estado: item.next }) as never,
      )
      const ticket = v2Ticket({
        estado: item.estado,
        tecnico: item.action === 'cancel' ? undefined : tecnico.id,
      })
      const first = await applySolicitudWorkflowAction({
        solicitud: ticket as never,
        action: item.action,
        actor: item.actor,
        payload: item.payload,
      })
      const second = await applySolicitudWorkflowAction({
        solicitud: ticket as never,
        action: item.action,
        actor: item.actor,
        payload: item.payload,
      })
      expect(first.idempotent).toBe(false)
      expect(second.idempotent).toBe(true)
      expect(second.event).toMatchObject({
        actionType: item.action,
        payloadHash: event.payloadHash,
        author: item.actor.id,
      })
      expect(createSpy).toHaveBeenCalledTimes(1)
      const created = createSpy.mock.calls[0]?.[0] as {
        actionType?: string
        payloadHash?: string
        author?: string
      }
      expect(created.actionType).toBe(item.action)
      expect(created.payloadHash).toBe(event.payloadHash)
      expect(created.author).toBe(item.actor.id)
    }
  })

  it('si falla la inserción de historial revierte el estado del ticket', async () => {
    mockNoExistingOperation()
    const updateSpy = vi
      .spyOn(Solicitud, 'findOneAndUpdate')
      .mockResolvedValueOnce(v2Ticket({ estado: 'en_progreso', workflowRevision: 1 }) as never)
      .mockResolvedValueOnce(v2Ticket({ estado: 'asignado', workflowRevision: 0 }) as never)
    vi.spyOn(HistorialSolicitud, 'create').mockRejectedValue(new Error('insert fail'))

    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
        payload: { operationId: 'op-insert-fail' },
        atomicity: 'operationId',
      }),
    ).rejects.toThrow('insert fail')
    expect(updateSpy).toHaveBeenCalledTimes(2)
    const applyFilter = updateSpy.mock.calls[0]?.[0] as Record<string, unknown>
    const rollbackFilter = updateSpy.mock.calls[1]?.[0] as Record<string, unknown>
    expect(applyFilter).toMatchObject({
      estado: 'asignado',
      workflowVersion: 2,
    })
    expect(rollbackFilter).toMatchObject({
      estado: 'en_progreso',
      workflowVersion: 2,
      workflowRevision: 1,
      lastWorkflowOperationId: 'op-insert-fail',
    })
    const rollbackUpdate = updateSpy.mock.calls[1]?.[1] as { $set?: Record<string, unknown> }
    expect(rollbackUpdate.$set).toMatchObject({ estado: 'asignado', workflowRevision: 0 })
  })

  it('si falla el insert después de una mutación concurrente no pisa el estado posterior', async () => {
    mockNoExistingOperation()
    const laterTicket = v2Ticket({
      estado: 'en_progreso',
      workflowRevision: 2,
      lastWorkflowOperationId: 'later-op',
    })
    const updateSpy = vi
      .spyOn(Solicitud, 'findOneAndUpdate')
      .mockResolvedValueOnce(v2Ticket({ estado: 'en_progreso', workflowRevision: 1 }) as never)
      .mockResolvedValueOnce(null)
    vi.spyOn(HistorialSolicitud, 'create').mockRejectedValue(new Error('insert fail'))
    vi.spyOn(Solicitud, 'findById').mockResolvedValue(laterTicket as never)

    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
        payload: { operationId: 'op-stale-rollback' },
        atomicity: 'operationId',
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: 'La operación no quedó confirmada porque el ticket cambió después.',
    })
    const rollbackFilter = updateSpy.mock.calls[1]?.[0] as Record<string, unknown>
    expect(rollbackFilter.lastWorkflowOperationId).toBe('op-stale-rollback')
    expect(rollbackFilter.workflowRevision).toBe(1)
    expect(await updateSpy.mock.results[1]?.value).toBeNull()
  })

  it('éxito nunca se reporta sin evento de historial', async () => {
    mockNoExistingOperation()
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso', workflowRevision: 1 }) as never,
    )
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue(undefined as never)

    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
        payload: { operationId: 'op-no-event' },
        atomicity: 'operationId',
      }),
    ).rejects.toMatchObject({ status: 500, message: 'La operación no quedó confirmada.' })
  })

  it('ruta Atlas usa sesión: update e insert hacen commit juntos', async () => {
    mockNoExistingOperation()
    const session = mockSession()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    const event = { type: 'started', operationId: 'op-atlas' }
    vi.spyOn(HistorialSolicitud, 'create').mockImplementation((async (docs: unknown) => {
      if (Array.isArray(docs)) return [event]
      return event
    }) as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso', workflowRevision: 1 }) as never,
    )

    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload: { operationId: 'op-atlas' },
      atomicity: 'transactions',
    })
    expect(result.idempotent).toBe(false)
    expect(result.event).toBeTruthy()
    expect(session.startTransaction).toHaveBeenCalled()
    expect(session.commitTransaction).toHaveBeenCalled()
    expect(session.abortTransaction).not.toHaveBeenCalled()
    expect(HistorialSolicitud.create).toHaveBeenCalledWith(
      [expect.objectContaining({ operationId: 'op-atlas', actionType: 'start' })],
      { session },
    )
  })

  it('ruta Atlas aborta si falla el insert y no reporta éxito', async () => {
    mockNoExistingOperation()
    const session = mockSession()
    vi.spyOn(mongoose, 'startSession').mockResolvedValue(session as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso', workflowRevision: 1 }) as never,
    )
    vi.spyOn(HistorialSolicitud, 'create').mockRejectedValue(new Error('atlas insert fail'))

    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
        payload: { operationId: 'op-atlas-fail' },
        atomicity: 'transactions',
      }),
    ).rejects.toThrow('atlas insert fail')
    expect(session.abortTransaction).toHaveBeenCalled()
    expect(session.commitTransaction).not.toHaveBeenCalled()
  })

  it('ruta standalone no abre sesión y aplica fallback con operationId', async () => {
    mockNoExistingOperation()
    const sessionSpy = vi.spyOn(mongoose, 'startSession')
    vi.spyOn(HistorialSolicitud, 'create').mockResolvedValue({ type: 'started' } as never)
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(
      v2Ticket({ estado: 'en_progreso', workflowRevision: 1 }) as never,
    )
    const result = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload: { operationId: 'op-standalone' },
      atomicity: 'operationId',
    })
    expect(result.event).toBeTruthy()
    expect(sessionSpy).not.toHaveBeenCalled()
  })

  it('si falla el update del ticket no crea evento', async () => {
    mockNoExistingOperation()
    vi.spyOn(Solicitud, 'findOneAndUpdate').mockResolvedValue(null)
    vi.spyOn(Solicitud, 'findById').mockResolvedValue(v2Ticket({ estado: 'asignado' }) as never)
    const createSpy = vi.spyOn(HistorialSolicitud, 'create')
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: tecnico,
        payload: { operationId: 'op-update-fail' },
      }),
    ).rejects.toMatchObject({ status: 409 })
    expect(createSpy).not.toHaveBeenCalled()
  })
})

describe('idempotencia G2 — scope actor/acción/payload', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('misma key y payload distinto responde 409 y no muta', async () => {
    const stored = storedReplay('resolve', tecnico, {
      operationId: 'same-key',
      queSeHizo: 'Cambio de switch',
    })
    vi.spyOn(HistorialSolicitud, 'findOne').mockResolvedValue(stored as never)
    const createSpy = vi.spyOn(HistorialSolicitud, 'create')
    const updateSpy = vi.spyOn(Solicitud, 'findOneAndUpdate')
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'en_progreso' }) as never,
        action: 'resolve',
        actor: tecnico,
        payload: { operationId: 'same-key', queSeHizo: 'Reinicio distinto' },
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: 'La clave de idempotencia no puede reutilizarse.',
    })
    expect(createSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('misma key en acción distinta no reutiliza el resultado', async () => {
    const stored = storedReplay('partial_solution', tecnico, {
      operationId: 'shared-key',
      queSeHizo: 'Avance',
      queFalta: 'Cable',
      siguienteAccion: 'Validar',
    })
    vi.spyOn(HistorialSolicitud, 'findOne').mockResolvedValue(stored as never)
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'en_progreso' }) as never,
        action: 'resolve',
        actor: tecnico,
        payload: { operationId: 'shared-key', queSeHizo: 'Cambio de switch' },
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('misma key de actor distinto no filtra el resultado previo', async () => {
    const stored = storedReplay('start', tecnico, { operationId: 'actor-key' })
    vi.spyOn(HistorialSolicitud, 'findOne').mockResolvedValue(stored as never)
    const createSpy = vi.spyOn(HistorialSolicitud, 'create')
    await expect(
      applySolicitudWorkflowAction({
        solicitud: v2Ticket({ estado: 'asignado' }) as never,
        action: 'start',
        actor: { ...tecnico, id: otherTech },
        payload: { operationId: 'actor-key' },
      }),
    ).rejects.toMatchObject({ status: 409 })
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('respuesta repetida es determinista para la misma key/actor/acción/payload', async () => {
    const payload = { operationId: 'det-key-01' }
    const stored = storedReplay('start', tecnico, payload)
    vi.spyOn(HistorialSolicitud, 'findOne').mockResolvedValue(stored as never)
    vi.spyOn(Solicitud, 'findById').mockResolvedValue(v2Ticket({ estado: 'en_progreso' }) as never)
    const first = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload,
    })
    const second = await applySolicitudWorkflowAction({
      solicitud: v2Ticket({ estado: 'asignado' }) as never,
      action: 'start',
      actor: tecnico,
      payload,
    })
    expect(first).toEqual(second)
    expect(first.idempotent).toBe(true)
  })
})
