import mongoose from 'mongoose'
import {
  assertConnectedLocalSimulation,
  assertLocalSimulationMongoUri,
} from '../../../shared/config/simulation-db-guard'
import HistorialSolicitud from '../models/historialSolicitud'
import {
  findConflictingHistorialOperationIdIndex,
  isHistorialOperationIdIndex,
  UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID,
  type MongoIndexInfo,
} from './historial-operation-id'

let indexReadyCache: boolean | undefined

export function resetHistorialOperationIdIndexCache(): void {
  indexReadyCache = undefined
}

export async function listHistorialIndexes(): Promise<MongoIndexInfo[]> {
  try {
    const indexes = await HistorialSolicitud.collection.indexes()
    return indexes.map((index) => ({
      name: String(index.name),
      key: index.key as Record<string, number>,
      unique: Boolean(index.unique),
      sparse: Boolean(index.sparse),
    }))
  } catch (error) {
    const code = (error as { code?: number }).code
    const message = error instanceof Error ? error.message : String(error)
    if (code === 26 || /ns does not exist/i.test(message)) {
      return []
    }
    throw error
  }
}

export function fingerprintHistorialIndexes(indexes: MongoIndexInfo[]): string[] {
  return indexes
    .map((index) =>
      JSON.stringify({
        name: index.name,
        key: index.key,
        unique: Boolean(index.unique),
        sparse: Boolean(index.sparse),
      }),
    )
    .sort()
}

export function assertHistorialMigrationEnvironment(): void {
  assertLocalSimulationMongoUri(process.env.DB_URI)
}

export async function applyUniqHistorialOperationIdIndex(): Promise<{
  action: 'created' | 'already_exists'
  collection: string
  indexes: MongoIndexInfo[]
}> {
  const collection = HistorialSolicitud.collection.collectionName
  const indexesBefore = await listHistorialIndexes()

  const conflict = findConflictingHistorialOperationIdIndex(indexesBefore)
  if (conflict) {
    throw new Error(
      `STOP: conflicting index '${conflict.name}' on solicitud+operationId. Refusing to create ${UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID}.`,
    )
  }

  const existing = indexesBefore.find(isHistorialOperationIdIndex)
  if (existing) {
    return { action: 'already_exists', collection, indexes: indexesBefore }
  }

  await HistorialSolicitud.collection.createIndex(
    { solicitud: 1, operationId: 1 },
    { unique: true, sparse: true, name: UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID },
  )

  const indexes = await listHistorialIndexes()
  const created = indexes.find(isHistorialOperationIdIndex)
  if (!created) {
    throw new Error(
      `Index ${UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID} was not found after createIndex`,
    )
  }
  indexReadyCache = true
  return { action: 'created', collection, indexes }
}

export async function migrateUniqHistorialOperationId(): Promise<{
  action: 'created' | 'already_exists'
  collection: string
  indexes: MongoIndexInfo[]
}> {
  assertHistorialMigrationEnvironment()
  return applyUniqHistorialOperationIdIndex()
}

export async function assertHistorialOperationIdIndexReady(): Promise<void> {
  if (indexReadyCache) return
  const indexes = await listHistorialIndexes()
  if (!indexes.find(isHistorialOperationIdIndex)) {
    throw {
      status: 503,
      message:
        'El flujo v2 requiere el índice uniq_historial_solicitud_operationId y no está disponible.',
    }
  }
  indexReadyCache = true
}

export async function connectHistorialMigrateFromEnv(): Promise<void> {
  const uri = process.env.DB_URI?.trim()
  const target = assertLocalSimulationMongoUri(uri)
  await mongoose.connect(uri as string)
  assertConnectedLocalSimulation({
    name: mongoose.connection.name,
    host: mongoose.connection.host,
  })
  if (mongoose.connection.name !== target.dbName) {
    await mongoose.disconnect()
    throw new Error('STOP: connected database is not the local simulation database')
  }
}
