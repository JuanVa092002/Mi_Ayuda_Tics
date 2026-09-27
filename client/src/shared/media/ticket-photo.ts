import axiosConfig from '@/shared/api/axios'
import { getSessionToken } from '@/shared/api/sessionToken'
import type { MediaFile } from '@/shared/types'

export type TicketPhotoSource =
  | { kind: 'none' }
  | { kind: 'public'; url: string }
  | { kind: 'authenticated'; path: string }

const PLACEHOLDER_PHOTO = /usuario-undefined|undefined\.png/i
const LOCAL_MEDIA = /\/(?:api\/)?media\/local\/([^/?#]+)/i

function safeLocalFilename(raw: string): string | undefined {
  try {
    const name = decodeURIComponent(raw)
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return undefined
    return name
  } catch {
    return undefined
  }
}

function rawFotoUrl(foto: MediaFile | string | undefined | null): string | undefined {
  if (!foto) return undefined
  if (typeof foto === 'string') return foto.trim() || undefined
  return foto.url?.trim() || undefined
}

/** Public CDN vs auth-gated local files. Localhost stored URLs are rewritten to the current API. */
export function resolveTicketPhotoSource(
  foto?: MediaFile | string | null,
): TicketPhotoSource {
  const raw = rawFotoUrl(foto)
  if (!raw || PLACEHOLDER_PHOTO.test(raw)) return { kind: 'none' }

  const local = raw.match(LOCAL_MEDIA)
  if (local?.[1]) {
    const filename = safeLocalFilename(local[1])
    if (!filename) return { kind: 'none' }
    return { kind: 'authenticated', path: `/media/local/${filename}` }
  }

  if (/^https:\/\//i.test(raw) && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return { kind: 'public', url: raw }
  }

  return { kind: 'none' }
}

export function authenticatedMediaUrl(path: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export async function fetchAuthenticatedTicketPhoto(path: string): Promise<string> {
  const base = String(axiosConfig.defaults.baseURL || '').replace(/\/$/, '')
  const headers: Record<string, string> = { Accept: 'image/*' }
  const token = getSessionToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(authenticatedMediaUrl(path, base), {
    credentials: 'include',
    headers,
  })
  if (!response.ok) {
    throw new Error('No se pudo cargar la evidencia')
  }

  const blob = await response.blob()
  if (blob.type.includes('json') || blob.type.includes('text')) {
    throw new Error('La evidencia no es una imagen')
  }

  return URL.createObjectURL(blob)
}
