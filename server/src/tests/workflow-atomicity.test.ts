import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assertWorkflowAtomicityAvailable,
  getWorkflowAtomicityStrategy,
  mongoRequiresTransactions,
  resetMongoTransactionCache,
} from '../features/tickets/domain/workflow-atomicity'

describe('workflow atomicity G1', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    resetMongoTransactionCache()
  })

  it('producción exige transacciones y no acepta FORCE_NO_TRANSACTIONS', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('WORKFLOW_FORCE_NO_TRANSACTIONS', '1')
    vi.stubEnv('DB_URI', 'mongodb://127.0.0.1:27017/miayudatics')
    expect(mongoRequiresTransactions()).toBe(true)
    expect(getWorkflowAtomicityStrategy()).toBe('transactions')
  })

  it('mongodb+srv exige transacciones', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('DB_URI', 'mongodb+srv://cluster.mongodb.net/miayudatics')
    expect(mongoRequiresTransactions()).toBe(true)
    expect(getWorkflowAtomicityStrategy()).toBe('transactions')
  })

  it('producción sin topología replica falla cerrado', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DB_URI', 'mongodb://127.0.0.1:27017/miayudatics')
    resetMongoTransactionCache()
    let caught: unknown
    try {
      assertWorkflowAtomicityAvailable()
    } catch (error) {
      caught = error
    }
    expect(caught).toMatchObject({
      status: 503,
      message: 'El flujo v2 requiere transacciones de Mongo y no están disponibles.',
    })
  })

  it('standalone local usa fallback operationId', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('DB_URI', 'mongodb://127.0.0.1:27017/miayudatics_simulation')
    vi.stubEnv('WORKFLOW_REQUIRE_TRANSACTIONS', '')
    expect(mongoRequiresTransactions()).toBe(false)
    expect(getWorkflowAtomicityStrategy()).toBe('operationId')
  })
})
