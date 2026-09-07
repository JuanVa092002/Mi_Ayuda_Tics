const ALLOWED_ENVS = ['preview', 'qa', 'staging', 'production'] as const

export type RemoteMigrationEnv = (typeof ALLOWED_ENVS)[number]

export type RemoteHistorialMigrationApproval = {
  mode: 'remote'
  env: RemoteMigrationEnv
  changeId: string
  expectedDb: string
  hostKind: 'mongodb' | 'mongodb+srv'
  uriConfigured: true
}

type EnvMap = Record<string, string | undefined>

function fail(message: string): never {
  throw new Error(message)
}

function required(env: EnvMap, name: string): string {
  const value = env[name]?.trim()
  if (!value) fail(`STOP: ${name} is required for remote historial index migration`)
  return value
}

function parseMongoDbNameAndKind(uri: string): { dbName: string; hostKind: 'mongodb' | 'mongodb+srv'; loopback: boolean } {
  let parsed: URL
  try {
    parsed = new URL(uri)
  } catch {
    fail('STOP: migration URI is not a valid Mongo URI')
  }

  const hostKind = parsed.protocol === 'mongodb+srv:' ? 'mongodb+srv' : parsed.protocol === 'mongodb:' ? 'mongodb' : null
  if (!hostKind) {
    fail('STOP: migration URI protocol is not allowed')
  }

  const host = parsed.hostname.toLowerCase()
  const loopback = host === '127.0.0.1' || host === 'localhost' || host === '::1'
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, '').split('/')[0] ?? '')
  if (!dbName) {
    fail('STOP: migration URI does not include a database name')
  }

  return { dbName, hostKind, loopback }
}

/**
 * Fail-closed gate for a future CI/release migrate. Unusable unless every
 * approval flag is present at once. Never logs the URI or credentials.
 */
export function assertRemoteHistorialMigration(env: EnvMap): RemoteHistorialMigrationApproval {
  const migrationEnv = required(env, 'MIGRATION_ENV')
  if (!(ALLOWED_ENVS as readonly string[]).includes(migrationEnv)) {
    fail('STOP: MIGRATION_ENV is not an approved remote target')
  }
  if (env.MIGRATION_APPROVED !== 'true') {
    fail('STOP: MIGRATION_APPROVED=true is required')
  }
  if (env.MIGRATION_CONFIRM_REMOTE !== 'true') {
    fail('STOP: MIGRATION_CONFIRM_REMOTE=true is required')
  }
  const changeId = required(env, 'MIGRATION_CHANGE_ID')
  if (changeId.length < 8) {
    fail('STOP: MIGRATION_CHANGE_ID is too short')
  }
  const expectedDb = required(env, 'MIGRATION_EXPECTED_DB')
  const uri = env.DB_URI?.trim() || env.MONGODB_URI?.trim()
  if (!uri) {
    fail('STOP: CI must inject DB_URI for remote historial index migration')
  }

  const target = parseMongoDbNameAndKind(uri)
  if (target.loopback) {
    fail('STOP: remote historial migration refuses loopback Mongo')
  }
  if (target.dbName === 'miayudatics_simulation') {
    fail('STOP: remote historial migration refuses the local simulation database')
  }
  if (target.dbName !== expectedDb) {
    fail('STOP: connected database name does not match MIGRATION_EXPECTED_DB')
  }

  return {
    mode: 'remote',
    env: migrationEnv as RemoteMigrationEnv,
    changeId,
    expectedDb,
    hostKind: target.hostKind,
    uriConfigured: true,
  }
}

export function safeRemoteMigrationLog(
  approval: RemoteHistorialMigrationApproval,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    mode: approval.mode,
    env: approval.env,
    database: approval.expectedDb,
    changeId: approval.changeId,
    hostKind: approval.hostKind,
    uriConfigured: approval.uriConfigured,
    ...extra,
  }
}
