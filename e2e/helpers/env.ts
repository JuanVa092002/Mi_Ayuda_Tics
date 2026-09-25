const DESTRUCTIVE_ENVS = new Set(['simulation', 'qa', 'staging'])
const PRODUCTION_BACKEND_RE = /miayudatics-v1-0\.onrender\.com/i
const PRODUCTION_FRONTEND_RE = /miayudatics\.vercel\.app/i

export type E2ECredentials = {
  funcionarioEmail: string | undefined
  funcionarioPassword: string | undefined
  leaderEmail: string | undefined
  leaderPassword: string | undefined
  technicianEmail: string | undefined
  technicianPassword: string | undefined
}

export function readE2ECredentials(): E2ECredentials {
  return {
    funcionarioEmail: process.env.E2E_FUNCA_EMAIL ?? process.env.E2E_FUNCIONARIO_EMAIL,
    funcionarioPassword: process.env.E2E_FUNCA_PASSWORD ?? process.env.E2E_FUNCIONARIO_PASSWORD,
    leaderEmail: process.env.E2E_LIDER_EMAIL ?? process.env.E2E_LEADER_EMAIL,
    leaderPassword: process.env.E2E_LIDER_PASSWORD ?? process.env.E2E_LEADER_PASSWORD,
    technicianEmail: process.env.E2E_TECNICO_EMAIL,
    technicianPassword: process.env.E2E_TECNICO_PASSWORD,
  }
}

export function isDestructiveE2EEnabled(): boolean {
  return process.env.RUN_DESTRUCTIVE_E2E === 'true'
}

export function e2eEnvName(): string {
  return (process.env.E2E_ENV ?? '').trim().toLowerCase()
}

export function e2eBackendUrl(): string {
  return (process.env.E2E_BACKEND_URL ?? '').trim()
}

export function e2eFrontendUrl(): string {
  return (process.env.E2E_FRONTEND_URL ?? '').trim()
}

export function pointsAtProductionHost(url: string): boolean {
  return PRODUCTION_BACKEND_RE.test(url) || PRODUCTION_FRONTEND_RE.test(url)
}

function missingRoleCredentials(creds: E2ECredentials): string[] {
  const missing: string[] = []
  if (!creds.funcionarioEmail || !creds.funcionarioPassword) {
    missing.push('E2E_FUNCA_EMAIL/PASSWORD')
  }
  if (!creds.leaderEmail || !creds.leaderPassword) {
    missing.push('E2E_LIDER_EMAIL/PASSWORD')
  }
  if (!creds.technicianEmail || !creds.technicianPassword) {
    missing.push('E2E_TECNICO_EMAIL/PASSWORD')
  }
  return missing
}

export function destructiveE2ESkipReason(): string | null {
  if (!isDestructiveE2EEnabled()) {
    return 'RUN_DESTRUCTIVE_E2E is not true; workflow E2E stays skipped'
  }

  const envName = e2eEnvName()
  if (!envName) {
    return 'E2E_ENV must be set explicitly to simulation|qa|staging'
  }
  if (envName === 'production') {
    return 'destructive E2E refuses E2E_ENV=production'
  }
  if (!DESTRUCTIVE_ENVS.has(envName)) {
    return `E2E_ENV=${process.env.E2E_ENV ?? ''} is not simulation|qa|staging`
  }

  const backend = e2eBackendUrl()
  const frontend = e2eFrontendUrl()
  if (!backend) {
    return 'E2E_BACKEND_URL must be set explicitly for destructive E2E'
  }
  if (!frontend) {
    return 'E2E_FRONTEND_URL must be set explicitly for destructive E2E'
  }
  if (pointsAtProductionHost(backend) || pointsAtProductionHost(frontend)) {
    return 'destructive E2E refuses production Render and Vercel hosts'
  }

  const missing = missingRoleCredentials(readE2ECredentials())
  if (missing.length > 0) {
    return `destructive E2E requires env credentials: ${missing.join(', ')}`
  }
  return null
}
