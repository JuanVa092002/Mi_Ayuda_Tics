const SESSION_TOKEN_KEY = 'miayuda.webSessionToken'

export function isLocalWebHost(hostname: string = window.location.hostname): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

export function getSessionToken(): string | null {
  if (typeof window === 'undefined' || !isLocalWebHost()) return null
  return window.sessionStorage.getItem(SESSION_TOKEN_KEY)
}

export function setSessionToken(token: string | undefined): void {
  if (typeof window === 'undefined' || !isLocalWebHost()) return
  const value = token?.trim()
  if (!value) {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY)
    return
  }
  window.sessionStorage.setItem(SESSION_TOKEN_KEY, value)
}

export function clearSessionToken(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SESSION_TOKEN_KEY)
}
