import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { parseLocalSimulationMongoUri } from '../shared/config/simulation-db-guard'

const SERVER_ROOT = path.resolve(__dirname, '../..')
const ENV_TEST_PATH = path.join(SERVER_ROOT, '.env.test')

if (!fs.existsSync(ENV_TEST_PATH)) {
  throw new Error('STOP: server/.env.test is missing')
}

process.env.DOTENV_CONFIG_PATH = ENV_TEST_PATH
dotenv.config({ path: ENV_TEST_PATH, override: true })

process.env.NODE_ENV = 'development'
process.env.JWT_SECRET = 'miayudatics-fase-c-http-jwt'
process.env.PORT = '18080'
process.env.PUBLIC_URL = 'http://127.0.0.1:18080'
process.env.REQUIRE_SOLICITUD_FOTO = 'false'

for (const key of [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'BREVO_API_KEY',
  'BREVO_USER',
  'BREVO_PASSWORD',
  'BREVO_PREFER_SMTP',
]) {
  process.env[key] = ''
}

parseLocalSimulationMongoUri(process.env.DB_URI)
