/**
 * Unique index for Solicitud.codigoCaso.
 * Created only by the explicit migrate script — never by schema unique / autoIndex.
 */
export const UNIQ_SOLICITUD_CODIGO_CASO = 'uniq_solicitud_codigoCaso'

export const CODIGO_CASO_UNIQUE_KEY = { codigoCaso: 1 as const }

export const CODIGO_CASO_UNIQUE_SPEC = {
  name: UNIQ_SOLICITUD_CODIGO_CASO,
  key: CODIGO_CASO_UNIQUE_KEY,
  unique: true as const,
}

export type MongoIndexInfo = {
  name: string
  key: Record<string, number>
  unique?: boolean
}

export function isCodigoCasoUniqueIndex(index: MongoIndexInfo): boolean {
  return (
    index.name === UNIQ_SOLICITUD_CODIGO_CASO &&
    index.unique === true &&
    index.key.codigoCaso === 1 &&
    Object.keys(index.key).length === 1
  )
}

export function findConflictingCodigoCasoIndex(
  indexes: MongoIndexInfo[]
): MongoIndexInfo | undefined {
  return indexes.find((index) => {
    if (index.name === '_id_') return false
    const isCodigoOnly = index.key.codigoCaso === 1 && Object.keys(index.key).length === 1
    if (!isCodigoOnly) return false
    return !isCodigoCasoUniqueIndex(index)
  })
}
