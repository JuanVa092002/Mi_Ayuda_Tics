/**
 * Unique sparse index for HistorialSolicitud.operationId per ticket.
 * Created only by the explicit migrate script — never by schema unique / autoIndex.
 */
export const UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID = 'uniq_historial_solicitud_operationId'

export const HISTORIAL_OPERATION_ID_KEY = { solicitud: 1 as const, operationId: 1 as const }

export type MongoIndexInfo = {
  name: string
  key: Record<string, number>
  unique?: boolean
  sparse?: boolean
}

export function isHistorialOperationIdIndex(index: MongoIndexInfo): boolean {
  return (
    index.name === UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID &&
    index.unique === true &&
    index.sparse === true &&
    index.key.solicitud === 1 &&
    index.key.operationId === 1 &&
    Object.keys(index.key).length === 2
  )
}

export function findConflictingHistorialOperationIdIndex(
  indexes: MongoIndexInfo[],
): MongoIndexInfo | undefined {
  return indexes.find((index) => {
    if (index.name === '_id_') return false
    if (isHistorialOperationIdIndex(index)) return false
    const sameKey =
      index.key.solicitud === 1 &&
      index.key.operationId === 1 &&
      Object.keys(index.key).length === 2
    return sameKey || index.name === UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID
  })
}
