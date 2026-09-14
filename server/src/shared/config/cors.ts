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

  origins.add(WEB_PROD_ORIGIN)

  return [...origins]
}

export function isLocalDevOrigin(origin: string): boolean {
  return (
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  )
}

export function originIsAllowed(
  origin: string | undefined,
  allowedProdOrigins: string[]
): origin is string {
  if (!origin) return false
  return isLocalDevOrigin(origin) || allowedProdOrigins.includes(origin)
}

/** CORS headers for public unauthenticated routes that must never fail closed. */
export function corsHeaderMap(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': CORS_ALLOWED_METHODS.join(','),
    'Access-Control-Allow-Headers': CORS_ALLOWED_HEADERS.join(','),
    Vary: 'Origin',
  }
}

export function createCorsOriginValidator(allowedProdOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    if (!origin) {
      callback(null, true)
      return
    }

    if (isLocalDevOrigin(origin)) {
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
