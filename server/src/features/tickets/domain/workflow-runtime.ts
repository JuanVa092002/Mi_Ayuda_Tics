import { assertWorkflowAtomicityAvailable, mongoRequiresTransactions } from './workflow-atomicity'
import { assertHistorialOperationIdIndexReady } from '../indexes/historial-operation-id-ops'

/**
 * Production / mongodb+srv: transactions + explicit unique historial index.
 * Does not create indexes. Does not fall back to autoIndex or standalone.
 */
export async function assertWorkflowV2RuntimeReady(): Promise<void> {
  if (!mongoRequiresTransactions()) return
  assertWorkflowAtomicityAvailable()
  await assertHistorialOperationIdIndexReady()
}
