import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import mongoose from 'mongoose'
import solicitudModel from '../../features/tickets/models/solicitud'
import {
  fingerprintSolicitudIndexes,
  listSolicitudIndexes,
  migrateUniqSolicitudCodigoCaso,
} from '../../features/tickets/indexes/solicitud-codigo-caso-ops'
import { UNIQ_SOLICITUD_CODIGO_CASO } from '../../features/tickets/indexes/solicitud-codigo-caso'
import {
  assertConnectedLocalSimulation,
  assertLocalSimulationMongoUri,
} from '../../shared/config/simulation-db-guard'

const uri = process.env.DB_URI

describe('codigoCaso unique index (real Mongo)', () => {
  const extraIndexName = 'tmp_estado_guard_test'

  beforeAll(async () => {
    assertLocalSimulationMongoUri(uri)
    await mongoose.connect(uri!)
    assertConnectedLocalSimulation({
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    })
    const existing = await listSolicitudIndexes()
    if (!existing.some((index) => index.name === extraIndexName)) {
      await solicitudModel.collection.createIndex({ estado: 1 }, { name: extraIndexName })
    }
  }, 60000)

  afterAll(async () => {
    try {
      await solicitudModel.collection.dropIndex(extraIndexName)
    } catch {
      // ignore
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })

  it('adds only uniq_solicitud_codigoCaso and preserves prior indexes', async () => {
    const before = await listSolicitudIndexes()
    const beforeFingerprints = fingerprintSolicitudIndexes(before)
    const beforeNames = new Set(before.map((index) => index.name))

    const first = await migrateUniqSolicitudCodigoCaso()
    const afterFirst = await listSolicitudIndexes()
    const afterNames = new Set(afterFirst.map((index) => index.name))

    const added = [...afterNames].filter((name) => !beforeNames.has(name))
    const removed = [...beforeNames].filter((name) => !afterNames.has(name))

    expect(removed).toEqual([])
    expect(afterNames.has(UNIQ_SOLICITUD_CODIGO_CASO)).toBe(true)
    expect(afterNames.has(extraIndexName)).toBe(true)
    expect(afterNames.has('_id_')).toBe(true)

    if (first.action === 'created') {
      expect(added).toEqual([UNIQ_SOLICITUD_CODIGO_CASO])
    } else {
      expect(added).toEqual([])
    }

    const priorFingerprints = fingerprintSolicitudIndexes(
      afterFirst.filter((index) => index.name !== UNIQ_SOLICITUD_CODIGO_CASO)
    )
    const expectedPrior = fingerprintSolicitudIndexes(
      before.filter((index) => index.name !== UNIQ_SOLICITUD_CODIGO_CASO)
    )
    expect(priorFingerprints).toEqual(expectedPrior)

    expect(afterFirst.find((index) => index.name === UNIQ_SOLICITUD_CODIGO_CASO)).toMatchObject({
      unique: true,
      key: { codigoCaso: 1 },
    })

    const extra = afterFirst.find((index) => index.name === extraIndexName)
    const extraBefore = before.find((index) => index.name === extraIndexName)
    expect(extra).toEqual(extraBefore)

    const second = await migrateUniqSolicitudCodigoCaso()
    expect(second.action).toBe('already_exists')
    expect(['created', 'already_exists']).toContain(first.action)
    expect(fingerprintSolicitudIndexes(await listSolicitudIndexes())).toEqual(
      fingerprintSolicitudIndexes(afterFirst)
    )
    expect(beforeFingerprints.length).toBeGreaterThan(0)
  })

  it('rejects a duplicate codigoCaso at the database', async () => {
    const codigoCaso = `TEST-${Date.now()}`
    const base = {
      usuario: new mongoose.Types.ObjectId(),
      ambiente: new mongoose.Types.ObjectId(),
      tipoCaso: new mongoose.Types.ObjectId(),
      descripcion: 'Prueba de unicidad de codigoCaso',
      telefono: '3000000000',
      codigoCaso,
      estado: 'solicitado' as const,
    }
    await solicitudModel.create(base)
    await expect(solicitudModel.create({ ...base, descripcion: 'duplicado' })).rejects.toMatchObject({
      code: 11000,
    })
    await solicitudModel.deleteMany({ codigoCaso })
  })
})
