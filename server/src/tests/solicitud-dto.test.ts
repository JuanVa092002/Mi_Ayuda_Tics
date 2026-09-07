import { describe, expect, it } from 'vitest'
import { listItemHasHistorial, toSolicitudListItem } from '../features/tickets/domain/solicitud-dto'

const actor = { id: '60d0fe4f5311236168a109bb', rol: 'tecnico' as const }

describe('toSolicitudListItem', () => {
  it('no serializa historial ni eventos en un listado', () => {
    const item = toSolicitudListItem(
      {
        _id: 's1',
        codigoCaso: '2026-09-00001',
        estado: 'en_progreso',
        workflowVersion: 2,
        tecnico: { _id: actor.id, nombre: 'Ana', correo: 'ana@example.com' },
        historial: [{ type: 'started', message: 'no debe salir' }],
        historyNote: 'tampoco',
        events: [{ type: 'updated' }],
        event: { type: 'started' },
      },
      actor,
    )

    expect(listItemHasHistorial(item)).toBe(false)
    expect(item.historial).toBeUndefined()
    expect(item.historyNote).toBeUndefined()
    expect(item.events).toBeUndefined()
    expect(item.event).toBeUndefined()
    expect(item.codigoCaso).toBe('2026-09-00001')
    expect(item.queue).toBe('en_atencion')
    expect(item.displayStatus).toBeTruthy()
    expect(item.lifecycleState).toBe('en_progreso')
  })
})
