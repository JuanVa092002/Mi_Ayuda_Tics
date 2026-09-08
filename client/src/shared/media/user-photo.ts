import type { MediaFile } from '@/shared/types'

const UNSAFE_PHOTO =
  /localhost|127\.0\.0\.1|\[::1\]|usuario-undefined|undefined\.png/i

function rawFotoUrl(foto: MediaFile | string | undefined): string | undefined {
  if (!foto) return undefined
  if (typeof foto === 'string') return foto.trim() || undefined
  return foto.url?.trim() || undefined
}

/** Safe avatar URL for HTTPS pages. Never returns localhost or placeholder junk. */
export function resolveUserPhotoUrl(foto: MediaFile | string | undefined): string | undefined {
  const raw = rawFotoUrl(foto)
  if (!raw) return undefined
  if (UNSAFE_PHOTO.test(raw)) return undefined
  if (raw.includes('undefined')) return undefined
  return raw
}

export function userInitials(nombre?: string): string {
  const parts = (nombre ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}
