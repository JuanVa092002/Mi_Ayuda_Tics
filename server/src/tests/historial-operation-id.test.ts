import { describe, expect, it } from 'vitest'
import HistorialSolicitud from '../features/tickets/models/historialSolicitud'
import {
  findConflictingHistorialOperationIdIndex,
  isHistorialOperationIdIndex,
  UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID,
} from '../features/tickets/indexes/historial-operation-id'

describe('uniq_historial_solicitud_operationId definition', () => {
  it('el schema no declara unique operationId (autoIndex no lo crea)', () => {
    const declared = HistorialSolicitud.schema.indexes()
    const uniqueOperationId = declared.filter(
      ([key, options]) =>
        Boolean((options as { unique?: boolean } | undefined)?.unique) &&
        Object.prototype.hasOwnProperty.call(key, 'operationId'),
    )
    expect(uniqueOperationId).toEqual([])
  })

  it('acepta solo el spec named unique sparse', () => {
    expect(
      isHistorialOperationIdIndex({
        name: UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID,
        key: { solicitud: 1, operationId: 1 },
        unique: true,
        sparse: true,
      }),
    ).toBe(true)
    expect(
      isHistorialOperationIdIndex({
        name: UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID,
        key: { solicitud: 1, operationId: 1 },
        unique: true,
        sparse: false,
      }),
    ).toBe(false)
  })

  it('detecta conflicto de mismo key con otro nombre', () => {
    const conflict = findConflictingHistorialOperationIdIndex([
      {
        name: 'solicitud_1_operationId_1',
        key: { solicitud: 1, operationId: 1 },
        unique: true,
        sparse: true,
      },
    ])
    expect(conflict?.name).toBe('solicitud_1_operationId_1')
  })
})
