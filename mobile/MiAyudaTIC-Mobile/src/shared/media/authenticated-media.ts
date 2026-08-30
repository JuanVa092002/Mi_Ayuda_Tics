const LOCAL_MEDIA_FILENAME_RE = /^[A-Za-z0-9._-]+$/;
const LOCAL_MEDIA_PATH_RE = /\/api\/media\/local\/([A-Za-z0-9._-]+)/;

export type AuthenticatedMediaKind = 'local-preview' | 'authenticated-local' | 'public-remote';

/**
 * Local storage URLs require Bearer (`GET /api/media/local/:file`).
 * Cloudinary `secure_url` / `cloudinary.url(...)` today are public HTTPS —
 * `<Image>` can load them without Authorization.
 *
 * Future private Cloudinary:
 * - Signed URL (query signature, no JWT): still `public-remote`; Image can GET it.
 * - Authenticated/private delivery that needs Bearer: treat like `authenticated-local`
 *   (same download-via-apiFetch → cache file → Image). Do not put JWT in query params.
 */
export function classifyMediaUrl(url: string): AuthenticatedMediaKind {
  const trimmed = url.trim();
  if (!trimmed) return 'public-remote';
  if (isLocalPreviewUri(trimmed)) return 'local-preview';
  if (extractLocalMediaApiPath(trimmed)) return 'authenticated-local';
  return 'public-remote';
}

export function isLocalPreviewUri(url: string): boolean {
  return (
    url.startsWith('file:') ||
    url.startsWith('content:') ||
    url.startsWith('ph:') ||
    url.startsWith('data:') ||
    url.startsWith('asset:')
  );
}

export function needsAuthenticatedMediaFetch(url: string): boolean {
  return classifyMediaUrl(url) === 'authenticated-local';
}

/** API path for `apiFetchBinary`, host-agnostic (PUBLIC_URL vs emulator 10.0.2.2). */
export function extractLocalMediaApiPath(url: string): string | null {
  const match = LOCAL_MEDIA_PATH_RE.exec(url);
  if (!match) return null;
  const filename = match[1];
  if (!LOCAL_MEDIA_FILENAME_RE.test(filename) || filename.includes('..')) return null;
  return `/media/local/${filename}`;
}

export function filenameFromLocalMediaApiPath(apiPath: string): string | null {
  const prefix = '/media/local/';
  if (!apiPath.startsWith(prefix)) return null;
  const filename = apiPath.slice(prefix.length);
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return null;
  }
  if (!LOCAL_MEDIA_FILENAME_RE.test(filename)) return null;
  return filename;
}
