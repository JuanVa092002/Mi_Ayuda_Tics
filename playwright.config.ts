import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, 'e2e/.env.e2e') })

const frontendUrl = process.env.E2E_FRONTEND_URL ?? 'https://miayudatics.vercel.app'
const backendUrl = process.env.E2E_BACKEND_URL ?? 'https://miayudatics-v1-0.onrender.com'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  outputDir: 'test-results',
  use: {
    baseURL: frontendUrl,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  metadata: {
    backendUrl,
    frontendUrl,
    e2eEnv: process.env.E2E_ENV ?? '',
    destructive: process.env.RUN_DESTRUCTIVE_E2E === 'true',
  },
})
