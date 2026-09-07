import mongoose from 'mongoose'
import {
  applyUniqHistorialOperationIdIndex,
} from '../features/tickets/indexes/historial-operation-id-ops'
import { UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID } from '../features/tickets/indexes/historial-operation-id'
import {
  assertRemoteHistorialMigration,
  safeRemoteMigrationLog,
} from './guards/remote-historial-migration'

async function connectRemote(uri: string, expectedDb: string): Promise<void> {
  await mongoose.connect(uri)
  const dbName = mongoose.connection.name
  const host = mongoose.connection.host ?? ''
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1') {
    await mongoose.disconnect()
    throw new Error('STOP: remote historial migration refuses loopback Mongo')
  }
  if (dbName !== expectedDb) {
    await mongoose.disconnect()
    throw new Error('STOP: connected database name does not match MIGRATION_EXPECTED_DB')
  }
}

async function main(): Promise<void> {
  const approval = assertRemoteHistorialMigration(process.env)
  const uri = (process.env.DB_URI || process.env.MONGODB_URI || '').trim()
  await connectRemote(uri, approval.expectedDb)
  const result = await applyUniqHistorialOperationIdIndex()
  console.log(
    JSON.stringify(
      safeRemoteMigrationLog(approval, {
        collection: result.collection,
        action: result.action,
        index: result.indexes
          .filter((index) => index.name === UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID)
          .map((index) => ({
            name: index.name,
            key: index.key,
            unique: index.unique,
            sparse: index.sparse,
          })),
      }),
      null,
      2,
    ),
  )
}

function sanitizeMigrationError(message: string): string {
  return message
    .replace(/mongodb(\+srv)?:\/\/\S+/gi, '[redacted-uri]')
    .replace(/[A-Za-z0-9._%+-]+:[^@\s]+@/g, '[redacted-cred]@')
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(sanitizeMigrationError(message))
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })
