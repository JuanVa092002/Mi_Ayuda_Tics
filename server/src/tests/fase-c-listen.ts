import './fase-c-env'
import mongoose from 'mongoose'
import { server } from '../core/app'
import { dbConnect } from '../shared/config/mongo'
import { assertConnectedLocalSimulation } from '../shared/config/simulation-db-guard'
import { isCloudinaryEnabled } from '../shared/config/cloudinary'

const PORT = 18080
const HOST = '127.0.0.1'

const origFetch = globalThis.fetch.bind(globalThis)
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url.includes('api.brevo.com')) {
    return new Response(JSON.stringify({ messageId: 'fase-d-local' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  return origFetch(input, init)
}) as typeof fetch
process.env.BREVO_API_KEY = 'fase-d-local-stub'

async function main(): Promise<void> {
  if (isCloudinaryEnabled()) {
    throw new Error('STOP: Cloudinary env present; refusing external upload')
  }
  await dbConnect()
  assertConnectedLocalSimulation({
    name: mongoose.connection.name,
    host: mongoose.connection.host,
  })
  await new Promise<void>((resolve, reject) => {
    server.listen(PORT, HOST, () => resolve())
    server.once('error', reject)
  })
  const addr = server.address()
  if (!addr || typeof addr === 'string' || addr.address !== HOST || addr.port !== PORT) {
    throw new Error('STOP: server is not bound to loopback')
  }
  console.log(`listening ${HOST}:${PORT} db=${mongoose.connection.name} cloudinary=false`)
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'STOP'
  console.error(message.replace(/mongodb(\+srv)?:\/\/\S+/gi, '[redacted]'))
  process.exit(1)
})
