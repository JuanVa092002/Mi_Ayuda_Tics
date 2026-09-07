import { describe, expect, it } from 'vitest'
import {
  assertRemoteHistorialMigration,
  safeRemoteMigrationLog,
} from '../scripts/guards/remote-historial-migration'

const secretUri = 'mongodb+srv://ci-user:super-secret@cluster.example.net/miayudatics_preview'

function approvedEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    MIGRATION_ENV: 'preview',
    MIGRATION_APPROVED: 'true',
    MIGRATION_CONFIRM_REMOTE: 'true',
    MIGRATION_CHANGE_ID: 'rel-20260907',
    MIGRATION_EXPECTED_DB: 'miayudatics_preview',
    DB_URI: secretUri,
    ...overrides,
  }
}

describe('remote historial migration guard', () => {
  it('falla si falta cualquier flag', () => {
    expect(() => assertRemoteHistorialMigration({})).toThrow(/MIGRATION_ENV/)
    expect(() => assertRemoteHistorialMigration(approvedEnv({ MIGRATION_APPROVED: 'yes' }))).toThrow(
      /MIGRATION_APPROVED/,
    )
    expect(() =>
      assertRemoteHistorialMigration(approvedEnv({ MIGRATION_CONFIRM_REMOTE: undefined })),
    ).toThrow(/MIGRATION_CONFIRM_REMOTE/)
  })

  it('rechaza entorno local o simulation', () => {
    expect(() => assertRemoteHistorialMigration(approvedEnv({ MIGRATION_ENV: 'local' }))).toThrow(
      /approved remote target/,
    )
    expect(() =>
      assertRemoteHistorialMigration(approvedEnv({ MIGRATION_ENV: 'simulation' })),
    ).toThrow(/approved remote target/)
  })

  it('rechaza loopback y la base simulation', () => {
    expect(() =>
      assertRemoteHistorialMigration(
        approvedEnv({
          DB_URI: 'mongodb://127.0.0.1:27017/miayudatics_preview',
        }),
      ),
    ).toThrow(/loopback/)
    expect(() =>
      assertRemoteHistorialMigration(
        approvedEnv({
          MIGRATION_EXPECTED_DB: 'miayudatics_simulation',
          DB_URI: 'mongodb+srv://ci-user:super-secret@cluster.example.net/miayudatics_simulation',
        }),
      ),
    ).toThrow(/simulation/)
  })

  it('detiene mismatch de DB y no revela la URI', () => {
    expect(() =>
      assertRemoteHistorialMigration(
        approvedEnv({ MIGRATION_EXPECTED_DB: 'otra_base' }),
      ),
    ).toThrow(/does not match MIGRATION_EXPECTED_DB/)
    try {
      assertRemoteHistorialMigration(approvedEnv({ MIGRATION_EXPECTED_DB: 'otra_base' }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      expect(message).not.toContain('super-secret')
      expect(message).not.toContain('mongodb+srv://')
    }
  })

  it('aprueba el target seguro y el log no incluye URI', () => {
    const approval = assertRemoteHistorialMigration(approvedEnv())
    const log = JSON.stringify(safeRemoteMigrationLog(approval, { action: 'already_exists' }))
    expect(approval).toMatchObject({
      mode: 'remote',
      env: 'preview',
      expectedDb: 'miayudatics_preview',
      hostKind: 'mongodb+srv',
      uriConfigured: true,
    })
    expect(log).not.toContain('super-secret')
    expect(log).not.toContain('mongodb+srv://')
    expect(log).toContain('miayudatics_preview')
  })
})
