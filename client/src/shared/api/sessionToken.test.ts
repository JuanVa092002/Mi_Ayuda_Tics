import { describe, expect, it, beforeEach } from 'vitest'
import { clearSessionToken, getSessionToken, isLocalWebHost, setSessionToken } from './sessionToken'

describe('sessionToken', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('reconoce hosts de desarrollo local', () => {
    expect(isLocalWebHost('localhost')).toBe(true)
    expect(isLocalWebHost('127.0.0.1')).toBe(true)
    expect(isLocalWebHost('miayudatics.vercel.app')).toBe(false)
  })

  it('guarda y limpia el token en localhost', () => {
    setSessionToken('abc')
    expect(getSessionToken()).toBe('abc')
    clearSessionToken()
    expect(getSessionToken()).toBeNull()
  })
})
