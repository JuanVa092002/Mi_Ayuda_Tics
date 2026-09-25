import fs from 'node:fs'
import path from 'node:path'

export type TicketReportRow = {
  id: string
  marker: string
  state: string
  action: string
}

const rows: TicketReportRow[] = []

export function resetE2EReport(): void {
  rows.length = 0
}

export function recordTicket(row: TicketReportRow): void {
  rows.push({
    id: row.id,
    marker: row.marker,
    state: row.state,
    action: row.action,
  })
}

export function ticketReportRows(): readonly TicketReportRow[] {
  return rows
}

export function reportDir(): string {
  return path.resolve(process.cwd(), 'e2e/.reports')
}

/** Writes ticket IDs and states only. Never emails, passwords, tokens, or JWT. */
export function writeE2EReport(): string | null {
  if (rows.length === 0) return null
  const dir = reportDir()
  fs.mkdirSync(dir, { recursive: true })
  const out = path.join(dir, 'last-run.json')
  fs.writeFileSync(
    out,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        e2eEnv: process.env.E2E_ENV ?? '',
        tickets: rows,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  return out
}
