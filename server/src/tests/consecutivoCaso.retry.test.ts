import { beforeEach, describe, expect, it, vi } from 'vitest'
import models from '../core/models'
import { postConsecutivoCaso } from '../features/tickets/controllers/consecutivoCaso'

vi.mock('../shared/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}))

describe('postConsecutivoCaso retry', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retries yearMonth E11000 then returns a valid code', async () => {
    const spy = vi.spyOn(models.consecutivoCasoModel, 'findOneAndUpdate')
    spy
      .mockRejectedValueOnce({ code: 11000, keyPattern: { yearMonth: 1 } })
      .mockResolvedValueOnce({ yearMonth: '2099-01', sequence: 7 } as never)

    const code = await postConsecutivoCaso()
    expect(code).toMatch(/^\d{4}-\d{2}-\d{5}$/)
    expect(code.endsWith('-00007')).toBe(true)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('does not retry unrelated errors', async () => {
    const spy = vi.spyOn(models.consecutivoCasoModel, 'findOneAndUpdate')
    spy.mockRejectedValueOnce(new Error('socket hang up'))

    await expect(postConsecutivoCaso()).rejects.toThrow('Error al generar el código del caso')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
