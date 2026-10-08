import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function envGuardPlugin() {
  return {
    name: 'env-guard',
    config(_config: unknown, { command }: { command: string }) {
      if (command === 'build') {
        if (!process.env.VITE_BACKEND_URL) {
          // Configuración por defecto según entorno
          const IS_QA = process.env.NODE_ENV === 'development' || process.env.VITE_QA_MODE === 'true'
          process.env.VITE_BACKEND_URL = IS_QA
            ? 'https://qa-miayudatics-v1-0.onrender.com'
            : 'https://miayudatics-v1-0.onrender.com'
        }

        if (!process.env.VITE_API_URL) {
          process.env.VITE_API_URL = process.env.VITE_BACKEND_URL
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), envGuardPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      overlay: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
