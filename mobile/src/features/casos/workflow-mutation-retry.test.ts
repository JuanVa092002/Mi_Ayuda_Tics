import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { WORKFLOW_V2_MUTATION_AUTO_RETRY } from '../../shared/api/workflow-retry-policy'

const casosHooks = readFileSync(path.join(__dirname, 'hooks.ts'), 'utf8')
const solicitudesHooks = readFileSync(
  path.join(__dirname, '..', 'solicitudes', 'hooks.ts'),
  'utf8',
)

describe('mobile workflow v2 mutation retry', () => {
  it('hooks v2 usan retry automático 0', () => {
    expect(WORKFLOW_V2_MUTATION_AUTO_RETRY).toBe(0)
    expect(casosHooks.match(/retry: WORKFLOW_V2_MUTATION_AUTO_RETRY/g)).toHaveLength(5)
    expect(solicitudesHooks.match(/retry: WORKFLOW_V2_MUTATION_AUTO_RETRY/g)).toHaveLength(3)
  })
})
