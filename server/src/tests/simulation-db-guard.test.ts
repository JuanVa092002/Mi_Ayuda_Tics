import { describe, expect, it } from 'vitest'
import { parseLocalSimulationMongoUri } from '../shared/config/simulation-db-guard'

describe('parseLocalSimulationMongoUri', () => {
  it('accepts loopback simulation URIs', () => {
    expect(parseLocalSimulationMongoUri('mongodb://127.0.0.1:27017/miayudatics_simulation')).toEqual({
      host: '127.0.0.1',
      port: 27017,
      dbName: 'miayudatics_simulation',
    })
    expect(parseLocalSimulationMongoUri('mongodb://localhost/miayudatics_simulation').host).toBe(
      'localhost'
    )
  })

  it('rejects atlas, production names, and srv without leaking the URI', () => {
    const cases = [
      'mongodb+srv://user:pass@cluster.mongodb.net/miayudatics_simulation',
      'mongodb://127.0.0.1:27017/miayudatics',
      'mongodb://127.0.0.1:27017/other',
      'mongodb://example.com:27017/miayudatics_simulation',
    ]
    for (const uri of cases) {
      try {
        parseLocalSimulationMongoUri(uri)
        throw new Error('expected reject')
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        expect(message.startsWith('STOP:')).toBe(true)
        expect(message.includes(uri)).toBe(false)
        expect(message.toLowerCase().includes('pass')).toBe(false)
      }
    }
  })
})
