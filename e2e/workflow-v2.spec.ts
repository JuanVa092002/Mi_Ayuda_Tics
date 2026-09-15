import { cleanupTrackedTickets, resetTrackedE2ETickets } from './helpers/cleanup'
import { test } from './helpers/fixtures'
import { destructiveE2ESkipReason, e2eBackendUrl } from './helpers/env'
import { resetE2EReport, writeE2EReport } from './helpers/report'

const skipReason = destructiveE2ESkipReason()

test.describe.configure({ mode: 'serial' })

test.describe('Workflow v2 journey (harness only — journey not implemented)', () => {
  test.skip(Boolean(skipReason), skipReason ?? 'destructive E2E disabled')

  test.afterAll(async () => {
    if (skipReason) return
    await cleanupTrackedTickets({ backendUrl: e2eBackendUrl() })
    writeE2EReport()
    resetTrackedE2ETickets()
    resetE2EReport()
  })

  test('funcionario crea ticket', async () => {
    throw new Error('Not implemented: do not claim v2 E2E until this runs against simulation/qa/staging')
  })

  test('lider web ve el ticket', async () => {
    throw new Error('Not implemented')
  })

  test('lider asigna tecnico', async () => {
    throw new Error('Not implemented')
  })

  test('tecnico inicia', async () => {
    throw new Error('Not implemented')
  })

  test('tecnico actualiza', async () => {
    throw new Error('Not implemented')
  })

  test('tecnico solicita informacion', async () => {
    throw new Error('Not implemented')
  })

  test('funcionario responde', async () => {
    throw new Error('Not implemented')
  })

  test('tecnico solucion parcial y el ticket sigue abierto', async () => {
    throw new Error('Not implemented')
  })

  test('tecnico solucion total', async () => {
    throw new Error('Not implemented')
  })

  test('funcionario confirma y el ticket queda cerrado', async () => {
    throw new Error('Not implemented')
  })

  test('reopen', async () => {
    throw new Error('Not implemented')
  })

  test('reassign', async () => {
    throw new Error('Not implemented')
  })

  test('cancel', async () => {
    throw new Error('Not implemented')
  })

  test('idempotency replay', async () => {
    throw new Error('Not implemented')
  })

  test('media authorization', async () => {
    throw new Error('Not implemented')
  })

  test('legacy compatibility', async () => {
    throw new Error('Not implemented')
  })
})
