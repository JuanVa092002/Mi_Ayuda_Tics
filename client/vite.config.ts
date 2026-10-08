import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function envGuardPlugin() {
  return {
    name: 'env-guard',
    config(_config: unknown, { command }: { command: string }) {
      if (command === 'build' && !process.env.VITE_BACKEND_URL && !process.env.VITE_API_URL) {
        throw new Error(
          'VITE_BACKEND_URL o VITE_API_URL es requerido para el build de producción.'
        )
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
