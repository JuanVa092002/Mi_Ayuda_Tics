import { DateTime } from 'luxon'
import models from '../../../core/models'
import { isDuplicateKeyError } from '../../../shared/utils/mongo-duplicate'
import { logError } from '../../../shared/utils/logger'

const { consecutivoCasoModel } = models

const MAX_YEAR_MONTH_UPSERT_ATTEMPTS = 3

async function incrementYearMonthSequence(yearMonth: string) {
  return consecutivoCasoModel.findOneAndUpdate(
    { yearMonth },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
}

export const postConsecutivoCaso = async (): Promise<string> => {
  const currentYearMonth = DateTime.now().toFormat('yyyy-MM')
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_YEAR_MONTH_UPSERT_ATTEMPTS; attempt += 1) {
    try {
      const consecutivo = await incrementYearMonthSequence(currentYearMonth)
      if (!consecutivo?.sequence) {
        throw new Error('Consecutivo de caso incompleto')
      }
      const consecutivoFormateado = consecutivo.sequence.toString().padStart(5, '0')
      return `${currentYearMonth}-${consecutivoFormateado}`
    } catch (error) {
      lastError = error
      if (isDuplicateKeyError(error, 'yearMonth') && attempt < MAX_YEAR_MONTH_UPSERT_ATTEMPTS) {
        continue
      }
      logError('Error al generar el código del caso', error, {
        yearMonth: currentYearMonth,
        attempt,
        duplicateYearMonth: isDuplicateKeyError(error, 'yearMonth'),
      })
      const wrapped = new Error('Error al generar el código del caso')
      ;(wrapped as Error & { cause?: unknown }).cause = error
      throw wrapped
    }
  }

  const wrapped = new Error('Error al generar el código del caso')
  ;(wrapped as Error & { cause?: unknown }).cause = lastError
  throw wrapped
}
