import { getOptimizedMediaUrl } from '../services/mediaStorage'

interface StorageLike {
  url?: string
  filename?: string
  toObject?: () => Record<string, unknown>
}

export function enrichStorageRecord(
  record: StorageLike | null | undefined
): (StorageLike & { optimizedUrl?: string }) | null | undefined {
  if (!record) return record

  const plain = (record.toObject?.() ?? record) as StorageLike & Record<string, unknown>
  if (!plain.url) return record

  const filename = typeof plain.filename === 'string' ? plain.filename : ''
  try {
    return {
      ...plain,
      optimizedUrl: getOptimizedMediaUrl({ url: plain.url, filename }, { width: 1200 }),
    }
  } catch {
    return {
      ...plain,
      optimizedUrl: plain.url,
    }
  }
}

export function enrichSolicitudFoto<T>(doc: T): T {
  const record = doc as T & { toObject?: () => T; foto?: StorageLike | null }
  const plain = (record.toObject?.() ?? doc) as T & { foto?: StorageLike | null }
  if (!plain.foto || typeof plain.foto !== 'object') return plain
  return {
    ...plain,
    foto: enrichStorageRecord(plain.foto),
  } as T
}

export function enrichSolicitudList<T>(docs: T[]): T[] {
  return docs.map(enrichSolicitudFoto)
}
