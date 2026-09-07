import axios, { type AxiosError } from 'axios'
import { getApiErrorMessage, notifyUnauthorized } from './apiError'
import { clearAllWorkflowAttemptKeys } from '@/features/tickets/api/workflow-idempotency'

function resolveApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL) as string | undefined
  if (!raw?.trim()) return ''
  const trimmed = raw.trim().replace(/\/$/, '')
  if (trimmed.endsWith('/api')) return trimmed
  return `${trimmed}/api`
}

const apiBaseUrl = resolveApiBaseUrl()

if (!apiBaseUrl && import.meta.env.DEV) {
  console.warn('[api] Define VITE_BACKEND_URL (local) o VITE_API_URL (producción)')
}

const axiosConfig = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
// No axios retry adapter. Workflow v2 mutations must not auto-retry.

axiosConfig.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('auth/verify-token')) {
      clearAllWorkflowAttemptKeys()
      notifyUnauthorized()
    }

    if (import.meta.env.DEV) {
      console.error('Error de API:', getApiErrorMessage(error))
    }

    return Promise.reject(error)
  }
)

export default axiosConfig
