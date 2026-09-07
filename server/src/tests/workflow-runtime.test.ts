import { afterEach, describe, expect, it, vi } from 'vitest'
import { assertWorkflowV2RuntimeReady } from '../features/tickets/domain/workflow-runtime'
import { resetMongoTransactionCache } from '../features/tickets/domain/workflow-atomicity'
import { resetHistorialOperationIdIndexCache } from '../features/tickets/indexes/historial-operation-id-ops'

vi.mock('../features/tickets/indexes/historial-operation-id-ops', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../features/tickets/indexes/historial-operation-id-ops')>()
  return {
    ...actual,
    assertHistorialOperationIdIndexReady: vi.fn(),
  }
})

import { assertHistorialOperationIdIndexReady } from '../features/tickets/indexes/historial-operation-id-ops'

describe('assertWorkflowV2RuntimeReady', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    resetMongoTransactionCache()
    resetHistorialOperationIdIndexCache()
    vi.mocked(assertHistorialOperationIdIndexReady).mockReset()
  })

  it('en local no exige índice ni transacciones', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('DB_URI', 'mongodb://127.0.0.1:27017/miayudatics_simulation')
    await assertWorkflowV2RuntimeReady()
    expect(assertHistorialOperationIdIndexReady).not.toHaveBeenCalled()
  })

  it('en producción exige transacciones e índice', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DB_URI', 'mongodb://127.0.0.1:27017/miayudatics')
    vi.mocked(assertHistorialOperationIdIndexReady).mockRejectedValue({
      status: 503,
      message: 'El flujo v2 requiere el índice uniq_historial_solicitud_operationId y no está disponible.',
    })
    await expect(assertWorkflowV2RuntimeReady()).rejects.toMatchObject({ status: 503 })
  })
})
