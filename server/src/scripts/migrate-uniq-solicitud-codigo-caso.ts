import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { assertLocalSimulationMongoUri } from '../shared/config/simulation-db-guard'
import { connectFromEnv, migrateUniqSolicitudCodigoCaso } from '../features/tickets/indexes/solicitud-codigo-caso-ops'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test'), override: true })

async function main(): Promise<void> {
  assertLocalSimulationMongoUri(process.env.DB_URI)
  await connectFromEnv()
  const result = await migrateUniqSolicitudCodigoCaso()
  console.log(
    JSON.stringify(
      {
        database: mongoose.connection.name,
        action: result.action,
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
