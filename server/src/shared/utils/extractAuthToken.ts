export interface AuthTokenSources {
  authorizationHeader?: string | string[]
  cookieHeader?: string
  cookies?: { token?: string }
  handshakeAuthToken?: unknown
  queryParamToken?: unknown
}

export function extractBearerFromAuthorization(
  header: string | string[] | undefined
): string | null {
  if (!header) return null
  const value = Array.isArray(header) ? header[0] : header
  const parts = value.split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1]) {
    return parts[1]
  }
  return null
}

export function parseTokenFromCookie(
  cookieHeader: string | undefined,
  cookies?: { token?: string }
): string | null {
  if (cookies?.token) return cookies.token
  if (!cookieHeader) return null
  const match = cookieHeader.split(';').find(part => part.trim().startsWith('token='))
  if (!match) return null
  return decodeURIComponent(match.trim().slice('token='.length))
}

/**
 * Priority: Authorization Bearer → httpOnly cookie → Socket handshake auth.token → Query param (?token=)
 */
export function extractAuthToken(sources: AuthTokenSources): string | null {
  const bearer = extractBearerFromAuthorization(sources.authorizationHeader)
  if (bearer) return bearer

  const cookie = parseTokenFromCookie(sources.cookieHeader, sources.cookies)
  if (cookie) return cookie

  if (typeof sources.handshakeAuthToken === 'string' && sources.handshakeAuthToken.trim()) {
    return sources.handshakeAuthToken.trim()
  }

  if (typeof sources.queryParamToken === 'string' && sources.queryParamToken.trim()) {
    return sources.queryParamToken.trim()
  }

  return null
}
