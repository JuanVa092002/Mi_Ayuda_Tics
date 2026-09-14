const DESTRUCTIVE_ENVS = new Set(['simulation', 'qa', 'staging'])
const PRODUCTION_HOST_RE = /miayudatics-v1-0\.onrender\.com/i

export function readE2ECredentials() {
  return {
    funcionarioEmail: process.env.E2E_FUNCA_EMAIL ?? process.env.E2E_FUNCIONARIO_EMAIL,
    funcionarioPassword: process.env.E2E_FUNCA_PASSWORD ?? process.env.E2E_FUNCIONARIO_PASSWORD,
    leaderEmail: process.env.E2E_LIDER_EMAIL,
    leaderPassword: process.env.E2E_LIDER_PASSWORD,
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

export function destructiveE2ESkipReason(): string | null {
  if (!isDestructiveE2EEnabled()) {
    return 'RUN_DESTRUCTIVE_E2E is not true; workflow E2E stays skipped'
  }
  if (!DESTRUCTIVE_ENVS.has(e2eEnvName())) {
    return `E2E_ENV=${process.env.E2E_ENV ?? ''} is not simulation|qa|staging`
  }
  const backend = process.env.E2E_BACKEND_URL ?? ''
  if (!backend) {
    return 'E2E_BACKEND_URL must be set explicitly for destructive E2E'
  }
  if (PRODUCTION_HOST_RE.test(backend) || e2eEnvName() === 'production') {
    return 'destructive E2E refuses the production Render host'
  }
  const creds = readE2ECredentials()
  if (
    !creds.funcionarioEmail ||
    !creds.funcionarioPassword ||
    !creds.leaderEmail ||
    !creds.leaderPassword ||
    !creds.technicianEmail ||
    !creds.technicianPassword
  ) {
    return 'destructive E2E requires funcionario, lider and tecnico credentials from env'
  }
  return null
}
