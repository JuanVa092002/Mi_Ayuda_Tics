import { apiFetchBinary } from '@/shared/api/client';
import {
  extractLocalMediaApiPath,
  filenameFromLocalMediaApiPath,
} from '@/shared/media/authenticated-media';
import {
  peekAuthenticatedMediaCache,
  writeAuthenticatedMediaCache,
} from '@/shared/media/authenticated-media-cache';

export async function downloadAuthenticatedMedia(
  token: string,
  apiPath: string,
): Promise<string> {
  const filename = filenameFromLocalMediaApiPath(apiPath);
  if (!filename) {
    throw new Error('Ruta de media local inválida');
  }

  const cached = peekAuthenticatedMediaCache(filename);
  if (cached) {
    return cached;
  }

  const bytes = await apiFetchBinary(apiPath, { token });
  if (!bytes.byteLength) {
    throw new Error('Archivo de evidencia vacío');
  }

  return writeAuthenticatedMediaCache(filename, bytes);
}

export function localMediaApiPathFromUrl(url: string): string | null {
  return extractLocalMediaApiPath(url);
}
