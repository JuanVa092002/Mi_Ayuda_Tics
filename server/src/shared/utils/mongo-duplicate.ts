type DuplicateLike = {
  code?: number
  keyPattern?: Record<string, unknown>
  keyValue?: Record<string, unknown>
  message?: string
}

export function isDuplicateKeyError(error: unknown, field?: string): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as DuplicateLike
  if (err.code !== 11000) return false
  if (!field) return true
  if (err.keyPattern && field in err.keyPattern) return true
  if (err.keyValue && field in err.keyValue) return true
  const message = err.message ?? ''
  return message.includes(field)
}
