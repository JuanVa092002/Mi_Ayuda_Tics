import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Do not auto-load server/.env (Vite would merge it with .env.test).
  envDir: false,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/integration/**/*.test.ts'],
    setupFiles: [path.resolve(__dirname, 'src/tests/setup-integration.ts')],
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
