const MARKER_RE = /^\[E2E-\d{8}-[0-9a-f]{8}\]$/i

export function makeE2eTicketMarker(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  return `[E2E-${stamp}-${suffix}]`
}

export function isE2eTicketMarker(value: string): boolean {
  return MARKER_RE.test(value.trim())
}

export function embedE2eMarker(description: string, marker: string): string {
  if (!isE2eTicketMarker(marker)) {
    throw new Error(`invalid E2E ticket marker: ${marker}`)
  }
  return `${marker} ${description}`.trim()
}
