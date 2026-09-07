import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import HistorialSolicitud from '../../features/tickets/models/historialSolicitud'
import {
  fingerprintHistorialIndexes,
  listHistorialIndexes,
  migrateUniqHistorialOperationId,
} from '../../features/tickets/indexes/historial-operation-id-ops'
import { UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID } from '../../features/tickets/indexes/historial-operation-id'
import {
  assertConnectedLocalSimulation,
  assertLocalSimulationMongoUri,
} from '../../shared/config/simulation-db-guard'

const uri = process.env.DB_URI

describe('historial operationId unique index (real Mongo)', () => {
  beforeAll(async () => {
    assertLocalSimulationMongoUri(uri)
    await mongoose.connect(uri!)
    assertConnectedLocalSimulation({
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    })
  }, 60000)

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })

  it('migrate es idempotente y deja el spec único sparse', async () => {
    const before = await listHistorialIndexes()
    const first = await migrateUniqHistorialOperationId()
    const afterFirst = await listHistorialIndexes()
    const created = afterFirst.find((index) => index.name === UNIQ_HISTORIAL_SOLICITUD_OPERATION_ID)
    expect(created).toMatchObject({
      unique: true,
      sparse: true,
      key: { solicitud: 1, operationId: 1 },
    })
    expect(['created', 'already_exists']).toContain(first.action)
    const second = await migrateUniqHistorialOperationId()
    expect(second.action).toBe('already_exists')
    expect(fingerprintHistorialIndexes(await listHistorialIndexes())).toEqual(
      fingerprintHistorialIndexes(afterFirst),
    )
    expect(HistorialSolicitud.modelName).toBe('HistorialSolicitud')
    expect(before.length).toBeGreaterThanOrEqual(0)
  })
})
