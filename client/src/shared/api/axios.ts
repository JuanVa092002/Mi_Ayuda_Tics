import axios, { type AxiosError } from 'axios'
import { getApiErrorMessage, notifyUnauthorized } from './apiError'
import { clearAllWorkflowAttemptKeys } from '@/features/tickets/api/workflow-idempotency'
import { clearSessionToken, getSessionToken } from './sessionToken'

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

export function shouldClearSessionOnUnauthorized(url?: string, status?: number): boolean {
  return status === 401 && !url?.includes('auth/verify-token')
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

axiosConfig.interceptors.request.use(config => {
  const token = getSessionToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosConfig.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (shouldClearSessionOnUnauthorized(error.config?.url, error.response?.status)) {
      clearAllWorkflowAttemptKeys()
      clearSessionToken()
      notifyUnauthorized()
    }

    if (import.meta.env.DEV) {
      console.error('Error de API:', getApiErrorMessage(error))
    }

    return Promise.reject(error)
  }
)

export default axiosConfig
