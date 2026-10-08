import { describe, it, expect } from 'vitest'
import {
  extractAuthToken,
  extractBearerFromAuthorization,
  parseTokenFromCookie,
} from '../shared/utils/extractAuthToken'

describe('extractAuthToken', () => {
  it('prioriza Bearer sobre cookie', () => {
    const token = extractAuthToken({
      authorizationHeader: 'Bearer abc123',
      cookies: { token: 'cookie-token' },
    })
    expect(token).toBe('abc123')
  })

  it('lee cookie si no hay Bearer', () => {
    const token = extractAuthToken({
      cookieHeader: 'token=cookie-value; other=x',
    })
    expect(token).toBe('cookie-value')
  })

  it('lee handshake auth token', () => {
    const token = extractAuthToken({
      handshakeAuthToken: 'socket-token',
    })
    expect(token).toBe('socket-token')
  })

  it('extractBearerFromAuthorization rechaza mal formado', () => {
    expect(extractBearerFromAuthorization('Basic xyz')).toBeNull()
  })

  it('parseTokenFromCookie desde cookies object', () => {
    expect(parseTokenFromCookie(undefined, { token: 'from-object' })).toBe('from-object')
  })

  it('lee query param token para soporte SSE nativo de EventSource', () => {
    const token = extractAuthToken({
      queryParamToken: 'sse-query-token',
    })
    expect(token).toBe('sse-query-token')
  })
})
