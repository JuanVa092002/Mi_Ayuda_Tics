import mongoose from 'mongoose'
import {
  assertConnectedLocalSimulation,
  assertLocalSimulationMongoUri,
} from '../../../shared/config/simulation-db-guard'
import solicitudModel from '../models/solicitud'
import {
  findConflictingCodigoCasoIndex,
  isCodigoCasoUniqueIndex,
  type MongoIndexInfo,
  UNIQ_SOLICITUD_CODIGO_CASO,
} from './solicitud-codigo-caso'

export type CodigoCasoAuditResult = {
  collection: string
  duplicateGroups: number
  duplicateDocuments: number
  missingOrEmpty: number
  duplicateCodes: Array<{ codigoCaso: string; count: number; ids: string[] }>
  indexes: MongoIndexInfo[]
}

export async function listSolicitudIndexes(): Promise<MongoIndexInfo[]> {
  try {
    const indexes = await solicitudModel.collection.indexes()
    return indexes.map((index) => ({
      name: String(index.name),
      key: index.key as Record<string, number>,
      unique: Boolean(index.unique),
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

/** Stable fingerprint so migrations can prove they only add uniq_solicitud_codigoCaso. */
export function fingerprintSolicitudIndexes(indexes: MongoIndexInfo[]): string[] {
  return indexes
    .map((index) =>
      JSON.stringify({
        name: index.name,
        key: index.key,
        unique: Boolean(index.unique),
      })
    )
    .sort()
}

export async function auditCodigoCaso(): Promise<CodigoCasoAuditResult> {
  const collection = solicitudModel.collection

  const duplicateCodes = await collection
    .aggregate<{ _id: string; count: number; ids: unknown[] }>([
      { $match: { codigoCaso: { $type: 'string', $ne: '' } } },
      { $group: { _id: '$codigoCaso', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray()

  const missingOrEmpty = await collection.countDocuments({
    $or: [{ codigoCaso: { $exists: false } }, { codigoCaso: null }, { codigoCaso: '' }],
  })

  return {
    collection: collection.collectionName,
    duplicateGroups: duplicateCodes.length,
    duplicateDocuments: duplicateCodes.reduce((sum, row) => sum + row.count, 0),
    missingOrEmpty,
    duplicateCodes: duplicateCodes.map((row) => ({
      codigoCaso: row._id,
      count: row.count,
      ids: row.ids.map((id) => String(id)),
    })),
    indexes: await listSolicitudIndexes(),
  }
}

export function assertAuditClean(audit: CodigoCasoAuditResult): void {
  if (audit.duplicateGroups > 0 || audit.missingOrEmpty > 0) {
    throw new Error(
      `STOP: codigoCaso audit failed (duplicates=${audit.duplicateGroups}, missingOrEmpty=${audit.missingOrEmpty}). No index will be created.`
    )
  }
}

export function assertMigrationEnvironment(): void {
  assertLocalSimulationMongoUri(process.env.DB_URI)
}

export async function migrateUniqSolicitudCodigoCaso(): Promise<{
  action: 'created' | 'already_exists'
  indexes: MongoIndexInfo[]
}> {
  assertMigrationEnvironment()
  const audit = await auditCodigoCaso()
  assertAuditClean(audit)

  const conflict = findConflictingCodigoCasoIndex(audit.indexes)
  if (conflict) {
    throw new Error(
      `STOP: conflicting index '${conflict.name}' on codigoCaso. Refusing to create ${UNIQ_SOLICITUD_CODIGO_CASO}.`
    )
  }

  const existing = audit.indexes.find(isCodigoCasoUniqueIndex)
  if (existing) {
    return { action: 'already_exists', indexes: audit.indexes }
  }

  await solicitudModel.collection.createIndex(
    { codigoCaso: 1 },
    { unique: true, name: UNIQ_SOLICITUD_CODIGO_CASO }
  )

  const indexes = await listSolicitudIndexes()
  const created = indexes.find(isCodigoCasoUniqueIndex)
  if (!created) {
    throw new Error(`Index ${UNIQ_SOLICITUD_CODIGO_CASO} was not found after createIndex`)
  }
  return { action: 'created', indexes }
}

export async function connectFromEnv(): Promise<void> {
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
