/** Headers the web actually sends (plus Authorization for Bearer clients). */
export const CORS_ALLOWED_HEADERS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'Idempotency-Key',
] as const

export const CORS_ALLOWED_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
] as const

export const WEB_PROD_ORIGIN = 'https://miayudatics.vercel.app'

export function parseAllowedOrigins(): string[] {
  const origins = new Set<string>()

  const socketOrigins = process.env.SOCKET_CORS_ORIGINS?.trim()
  const fromEnv =
    socketOrigins || process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || ''
  for (const entry of fromEnv.split(',')) {
    const trimmed = entry.trim()
    if (trimmed) origins.add(trimmed)
  }

  const clientUrl = process.env.CLIENT_URL?.trim()
  if (clientUrl) origins.add(clientUrl)

  const legacyOrigin = process.env.LEGACY_RENDER_FRONTEND_URL?.trim()
  if (legacyOrigin) origins.add(legacyOrigin)

  return [...origins]
}

export function isLocalDevOrigin(origin: string): boolean {
  return (
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  )
}

export function createCorsOriginValidator(allowedProdOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    if (!origin) {
      callback(null, true)
      return
    }

    if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin)) {
      callback(null, true)
      return
    }

    if (allowedProdOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  }
}
