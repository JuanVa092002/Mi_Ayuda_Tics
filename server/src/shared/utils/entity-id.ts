function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Normalize an id from string, ObjectId, populated doc, or `{ _id | id }`.
 */
export function extractEntityId(value: unknown): string | undefined {
  if (value == null) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  if (!isRecord(value)) return undefined

  const withHex = value as { toHexString?: () => string }
  if (typeof withHex.toHexString === 'function') {
    const hex = withHex.toHexString()
    if (typeof hex === 'string' && /^[a-fA-F0-9]{24}$/.test(hex)) {
      return hex
    }
  }

  if ('_id' in value && value._id !== value) {
    const nested = extractEntityId(value._id)
    if (nested) return nested
  }

  if ('id' in value && value.id !== value && typeof value.id === 'string') {
    const nested = extractEntityId(value.id)
    if (nested) return nested
  }

  if (typeof value.toString === 'function') {
    const asString = value.toString()
    if (asString && asString !== '[object Object]' && /^[a-fA-F0-9]{24}$/.test(asString)) {
      return asString
    }
  }

  return undefined
}

export function entityIdsEqual(left: unknown, right: unknown): boolean {
  const a = extractEntityId(left)
  const b = extractEntityId(right)
  return Boolean(a && b && a === b)
}

export function isFuncionarioOwner(
  role: string | undefined,
  requester: unknown,
  owner: unknown
): boolean {
  return role === 'funcionario' && entityIdsEqual(requester, owner)
}
