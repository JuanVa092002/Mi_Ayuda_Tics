import { recordTicket } from './report'

export type TrackedE2ETicket = {
  id: string
  marker: string
  state: string
}

const tracked: TrackedE2ETicket[] = []

export function trackE2ETicket(ticket: TrackedE2ETicket): void {
  tracked.push(ticket)
  recordTicket({ ...ticket, action: 'created' })
}

export function trackedE2ETickets(): readonly TrackedE2ETicket[] {
  return tracked
}

export function resetTrackedE2ETickets(): void {
  tracked.length = 0
}

export function assertCleanupMethod(method: string): void {
  if (method.toUpperCase() === 'DELETE') {
    throw new Error('E2E cleanup forbids DELETE; close or cancel the ticket instead')
  }
}

function jsonHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID(),
  }
}

async function postWorkflow(
  backendUrl: string,
  token: string,
  ticketId: string,
  action: 'cancelar' | 'confirmarSolucion',
  body: Record<string, string>,
): Promise<{ ok: boolean; status: number }> {
  assertCleanupMethod('POST')
  const response = await fetch(`${backendUrl}/api/solicitudes/${ticketId}/${action}`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  })
  return { ok: response.ok, status: response.status }
}

export async function cancelE2ETicket(
  backendUrl: string,
  leaderToken: string,
  ticket: TrackedE2ETicket,
): Promise<void> {
  const result = await postWorkflow(backendUrl, leaderToken, ticket.id, 'cancelar', {
    motivo: `${ticket.marker} e2e cleanup cancel`,
  })
  recordTicket({
    id: ticket.id,
    marker: ticket.marker,
    state: result.ok ? 'cancelado' : ticket.state,
    action: result.ok ? 'cleanup-cancel' : `cleanup-cancel-failed:${result.status}`,
  })
}

export async function confirmE2ETicket(
  backendUrl: string,
  funcionarioToken: string,
  ticket: TrackedE2ETicket,
): Promise<void> {
  const result = await postWorkflow(backendUrl, funcionarioToken, ticket.id, 'confirmarSolucion', {})
  recordTicket({
    id: ticket.id,
    marker: ticket.marker,
    state: result.ok ? 'cerrado' : ticket.state,
    action: result.ok ? 'cleanup-confirm' : `cleanup-confirm-failed:${result.status}`,
  })
}

/**
 * Close via confirmarSolucion when already solved; otherwise cancel.
 * Never DELETE /api/solicitudes/:id.
 */
export async function cleanupTrackedTickets(input: {
  backendUrl: string
  leaderToken?: string
  funcionarioToken?: string
}): Promise<void> {
  for (const ticket of [...tracked].reverse()) {
    const closed = ticket.state === 'cerrado' || ticket.state === 'cancelado'
    if (closed) continue
    if (ticket.state === 'solucionado' && input.funcionarioToken) {
      await confirmE2ETicket(input.backendUrl, input.funcionarioToken, ticket)
      continue
    }
    if (!input.leaderToken) {
      recordTicket({
        id: ticket.id,
        marker: ticket.marker,
        state: ticket.state,
        action: 'cleanup-skipped-no-leader-token',
      })
      continue
    }
    await cancelE2ETicket(input.backendUrl, input.leaderToken, ticket)
  }
}
