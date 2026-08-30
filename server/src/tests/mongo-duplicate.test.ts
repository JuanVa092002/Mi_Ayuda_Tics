import { describe, expect, it } from 'vitest'
import { isDuplicateKeyError } from '../shared/utils/mongo-duplicate'

describe('isDuplicateKeyError', () => {
  it('detects E11000 for a field', () => {
    expect(
      isDuplicateKeyError({ code: 11000, keyPattern: { yearMonth: 1 } }, 'yearMonth')
    ).toBe(true)
    expect(
      isDuplicateKeyError({ code: 11000, keyPattern: { codigoCaso: 1 } }, 'codigoCaso')
    ).toBe(true)
    expect(
      isDuplicateKeyError({ code: 11000, keyPattern: { yearMonth: 1 } }, 'codigoCaso')
    ).toBe(false)
    expect(isDuplicateKeyError(new Error('nope'), 'yearMonth')).toBe(false)
  })
})
