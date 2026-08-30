import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { assertLocalSimulationMongoUri } from '../shared/config/simulation-db-guard'
import { auditCodigoCaso, connectFromEnv } from '../features/tickets/indexes/solicitud-codigo-caso-ops'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test'), override: true })

async function main(): Promise<void> {
  assertLocalSimulationMongoUri(process.env.DB_URI)
  await connectFromEnv()
  const result = await auditCodigoCaso()
  console.log(
    JSON.stringify(
      {
        database: mongoose.connection.name,
        collection: result.collection,
        duplicateGroups: result.duplicateGroups,
        duplicateDocuments: result.duplicateDocuments,
        missingOrEmpty: result.missingOrEmpty,
        indexes: result.indexes.map((index) => ({
          name: index.name,
          key: index.key,
          unique: index.unique,
        })),
      },
      null,
      2
    )
  )
  if (result.duplicateGroups > 0 || result.missingOrEmpty > 0) {
    process.exitCode = 1
  }
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
