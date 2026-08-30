import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { parseLocalSimulationMongoUri } from '../shared/config/simulation-db-guard'

const SERVER_ROOT = path.resolve(__dirname, '../..')

export const INTEGRATION_ENV_TEST_PATH = path.join(SERVER_ROOT, '.env.test')

/** Harness-only JWT. Not read from `.env` / `.env.test` and not a production secret. */
export const INTEGRATION_TEST_JWT_SECRET = 'miayudatics-integration-test-jwt'

const MAIL_PROVIDER_KEYS = [
  'BREVO_API_KEY',
  'BREVO_USER',
  'BREVO_PASSWORD',
  'BREVO_PREFER_SMTP',
] as const

/**
 * Load server/.env.test from an absolute path, then pin test-only values.
 * Must run before importing `core/app` so `dotenv/config` cannot fill production secrets.
 */
export function loadIntegrationEnv(): void {
  if (!fs.existsSync(INTEGRATION_ENV_TEST_PATH)) {
    throw new Error('STOP: server/.env.test is missing; refusing to run integration tests')
  }

  process.env.DOTENV_CONFIG_PATH = INTEGRATION_ENV_TEST_PATH

  const loaded = dotenv.config({ path: INTEGRATION_ENV_TEST_PATH, override: true })
  if (loaded.error) {
    throw new Error('STOP: failed to load server/.env.test')
  }

  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = INTEGRATION_TEST_JWT_SECRET

  for (const key of MAIL_PROVIDER_KEYS) {
    process.env[key] = ''
  }

  if (process.env.NODE_ENV !== 'test') {
    throw new Error('STOP: NODE_ENV must be test for integration')
  }

  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error('STOP: JWT_SECRET for test is missing')
  }

  parseLocalSimulationMongoUri(process.env.DB_URI)
}
