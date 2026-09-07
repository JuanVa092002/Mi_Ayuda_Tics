import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { assertLocalSimulationMongoUri } from '../shared/config/simulation-db-guard'
import {
  connectHistorialMigrateFromEnv,
  migrateUniqHistorialOperationId,
} from '../features/tickets/indexes/historial-operation-id-ops'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test'), override: true })

async function main(): Promise<void> {
  assertLocalSimulationMongoUri(process.env.DB_URI)
  await connectHistorialMigrateFromEnv()
  const result = await migrateUniqHistorialOperationId()
  console.log(
    JSON.stringify(
      {
        database: mongoose.connection.name,
        collection: result.collection,
        action: result.action,
        index: result.indexes
          .filter((index) => index.name === 'uniq_historial_solicitud_operationId')
          .map((index) => ({
            name: index.name,
            key: index.key,
            unique: index.unique,
            sparse: index.sparse,
          })),
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
