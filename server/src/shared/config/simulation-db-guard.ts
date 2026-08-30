const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost'])
const ALLOWED_DB = 'miayudatics_simulation'

export type LocalSimulationTarget = {
  host: string
  port: number
  dbName: string
}

function fail(message: string): never {
  throw new Error(message)
}

/**
 * Fail-closed: only local Mongo on miayudatics_simulation.
 * Never include the URI or credentials in thrown messages.
 */
export function parseLocalSimulationMongoUri(uri: string | undefined): LocalSimulationTarget {
  if (!uri?.trim()) {
    fail('STOP: DB_URI is not configured for local simulation')
  }

  let parsed: URL
  try {
    parsed = new URL(uri)
  } catch {
    fail('STOP: DB_URI is not a valid Mongo URI')
  }

  if (parsed.protocol !== 'mongodb:') {
    fail('STOP: only local mongodb:// URIs are allowed')
  }

  const host = parsed.hostname
  if (!ALLOWED_HOSTS.has(host)) {
    fail('STOP: Mongo host is not local loopback')
  }

  const port = parsed.port ? Number(parsed.port) : 27017
  if (!Number.isInteger(port) || port <= 0) {
    fail('STOP: Mongo port is invalid')
  }

  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, '').split('/')[0] ?? '')
  if (dbName === 'miayudatics') {
    fail('STOP: refusing non-simulation database')
  }
  if (dbName !== ALLOWED_DB) {
    fail('STOP: database is not the local simulation database')
  }

  return { host, port, dbName }
}

export function assertLocalSimulationMongoUri(uri: string | undefined): LocalSimulationTarget {
  return parseLocalSimulationMongoUri(uri)
}

export function isLocalSimulationMongoUri(uri: string | undefined): boolean {
  try {
    parseLocalSimulationMongoUri(uri)
    return true
  } catch {
    return false
  }
}

export function assertConnectedLocalSimulation(connection: {
  name?: string
  host?: string
}): LocalSimulationTarget {
  const host = connection.host ?? ''
  const dbName = connection.name ?? ''
  if (!ALLOWED_HOSTS.has(host)) {
    fail('STOP: connected Mongo host is not local loopback')
  }
  if (dbName !== ALLOWED_DB) {
    fail('STOP: connected database is not the local simulation database')
  }
  return {
    host: host || '127.0.0.1',
    port: 27017,
    dbName,
  }
}
