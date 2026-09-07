import mongoose from 'mongoose'

/**
 * Workflow v2 atomicity (no Atlas/deploy from this workstream).
 *
 * Atlas / mongodb+srv / NODE_ENV=production:
 *   MUST use a Mongo session transaction. Solicitud update and HistorialSolicitud
 *   insert commit together or abort together. Silent fallback to standalone is forbidden.
 *
 * Local standalone (`mongodb://127.0.0.1:27017/miayudatics_simulation`):
 *   Conditional Solicitud update keyed by estado + workflowRevision + workflowVersion 2,
 *   then HistorialSolicitud insert. If insert fails, rollback only when the ticket still
 *   belongs to that operation (same revision + lastWorkflowOperationId).
 */
export type WorkflowAtomicityStrategy = 'transactions' | 'operationId'

const REPLICA_TOPOLOGIES = new Set(['ReplicaSetWithPrimary', 'Sharded', 'LoadBalanced'])

let cachedSupport: boolean | undefined

export function resetMongoTransactionCache(): void {
  cachedSupport = undefined
}

export function mongoRequiresTransactions(): boolean {
  if (process.env.WORKFLOW_FORCE_NO_TRANSACTIONS === '1' && process.env.NODE_ENV !== 'production') {
    return false
  }
  if (process.env.WORKFLOW_REQUIRE_TRANSACTIONS === '1') return true
  if (process.env.NODE_ENV === 'production') return true
  const uri = process.env.DB_URI ?? ''
  return uri.includes('mongodb+srv://')
}

export function mongoSupportsTransactions(): boolean {
  if (process.env.WORKFLOW_FORCE_TRANSACTIONS === '1') return true
  if (process.env.WORKFLOW_FORCE_NO_TRANSACTIONS === '1' && !mongoRequiresTransactions()) {
    return false
  }
  if (cachedSupport !== undefined) return cachedSupport

  if (mongoose.connection.readyState !== 1) {
    return false
  }

  const client = mongoose.connection.getClient() as {
    topology?: { description?: { type?: string } }
  }
  const type = client.topology?.description?.type
  cachedSupport = Boolean(type && REPLICA_TOPOLOGIES.has(type))
  return cachedSupport
}

export function getWorkflowAtomicityStrategy(): WorkflowAtomicityStrategy {
  if (mongoRequiresTransactions()) return 'transactions'
  return mongoSupportsTransactions() ? 'transactions' : 'operationId'
}

export function assertWorkflowAtomicityAvailable(): void {
  if (mongoRequiresTransactions() && !mongoSupportsTransactions()) {
    throw {
      status: 503,
      message: 'El flujo v2 requiere transacciones de Mongo y no están disponibles.',
    }
  }
}

export function describeWorkflowAtomicityStrategy(): string {
  const strategy = getWorkflowAtomicityStrategy()
  if (strategy === 'transactions') {
    return 'Atlas/replica: session transaction wraps conditional Solicitud update + HistorialSolicitud insert.'
  }
  return 'Standalone: conditional Solicitud update keyed by workflowRevision, then Historial insert; rollback only if revision and lastWorkflowOperationId still belong to that operation.'
}
