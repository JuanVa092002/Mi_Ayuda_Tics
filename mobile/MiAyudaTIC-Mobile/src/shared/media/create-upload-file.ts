import { File, Paths } from 'expo-file-system';
import { logFileRead, logFileReadError } from '@/shared/media/upload-log';

const ALLOWED_UPLOAD_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

/** Matches backend default `MEDIA_MAX_BYTES` (10 MiB). */
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export type UploadFileErrorCode =
  | 'MISSING_URI'
  | 'UNREADABLE'
  | 'UNSUPPORTED_MIME'
  | 'FILE_TOO_LARGE';

export class UploadFileError extends Error {
  readonly code: UploadFileErrorCode;

  constructor(message: string, code: UploadFileErrorCode) {
    super(message);
    this.name = 'UploadFileError';
    this.code = code;
  }
}

export type UploadOrigin = 'camera' | 'gallery';

export type PickerAssetLike = {
  uri?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  /** Optional. Logged in __DEV__; not required by the multipart contract. */
  origin?: UploadOrigin;
};

export type UriProtocol = 'file' | 'content' | 'http' | 'ph' | 'data' | 'unknown';

/**
 * Shape that `expo/fetch` `convertFormDataAsync` actually serializes:
 * an object with `name`, `type`, and `bytes()` — not RN `{ uri, type, name }`,
 * and not a generic Blob (instanceof Blob can fail across Blob implementations).
 */
export type ExpoFetchUploadFile = {
  name: string;
  type: string;
  size: number;
  uriProtocol: UriProtocol;
  bytes(): Promise<Uint8Array>;
  arrayBuffer(): Promise<ArrayBuffer>;
};

export type UploadLocalFile = {
  uri: string;
  exists: boolean;
  size: number;
  type: string;
  name: string;
  bytes(): Promise<Uint8Array>;
  copyTo(destination: UploadLocalFile): Promise<void>;
};

export type UploadFileSystem = {
  open(uri: string): UploadLocalFile;
  createCacheFile(fileName: string): UploadLocalFile;
};

type FormDataWithFilePart = {
  append(name: string, value: string | ExpoFetchUploadFile, fileName?: string): void;
};

type ExpoFileLike = {
  readonly uri: string;
  exists: boolean;
  size: number;
  type: string;
  name: string;
  bytes(): Promise<Uint8Array>;
  copy(destination: unknown): Promise<void>;
};

let overrideFileSystem: UploadFileSystem | null = null;

export function setUploadFileSystemForTests(next: UploadFileSystem | null): void {
  overrideFileSystem = next;
}

export function detectUriProtocol(uri: string): UriProtocol {
  if (uri.startsWith('file:')) return 'file';
  if (uri.startsWith('content:')) return 'content';
  if (uri.startsWith('ph:')) return 'ph';
  if (uri.startsWith('data:')) return 'data';
  if (uri.startsWith('http://') || uri.startsWith('https://')) return 'http';
  return 'unknown';
}

export function normalizeImageMime(mimeType?: string | null): string {
  const raw = mimeType?.trim().toLowerCase() ?? '';
  if (raw === 'image/jpg') return 'image/jpeg';
  if (raw.startsWith('image/')) return raw;
  return 'image/jpeg';
}

export function inferMimeFromFileName(fileName?: string | null): string | undefined {
  if (!fileName) return undefined;
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return undefined;
  return IMAGE_MIME_BY_EXT[ext];
}

export function normalizeImageFileName(fileName: string | null | undefined, mimeType: string): string {
  const extFromMime = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('gif')
        ? 'gif'
        : mimeType.includes('heic')
          ? 'heic'
          : mimeType.includes('heif')
            ? 'heif'
            : 'jpg';

  const trimmed = fileName?.trim();
  if (!trimmed) return `foto.${extFromMime}`;
  if (trimmed.includes('.')) return trimmed;
  return `${trimmed}.${extFromMime}`;
}

export function detectMediaMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (bytes.length >= 12) {
    const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    if (ftyp === 'ftyp') {
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
      if (brand.startsWith('heic') || brand.startsWith('heif') || brand.startsWith('mif1')) {
        return 'image/heic';
      }
    }
  }
  return null;
}

export function isAllowedUploadMime(mimeType: string): boolean {
  return ALLOWED_UPLOAD_MIME.has(mimeType.toLowerCase());
}

function unreadableError(cause?: unknown): UploadFileError {
  if (cause instanceof UploadFileError) return cause;
  return new UploadFileError('No se pudo leer la imagen seleccionada', 'UNREADABLE');
}

function logOrigin(asset: PickerAssetLike): UploadOrigin | 'unknown' {
  return asset.origin === 'camera' || asset.origin === 'gallery' ? asset.origin : 'unknown';
}

function logScheme(protocol: UriProtocol): string {
  return protocol === 'file' || protocol === 'content' ? protocol : protocol;
}

function safeCacheFileName(fileName: string | null | undefined, mimeType: string): string {
  const normalized = normalizeImageFileName(fileName, mimeType);
  const safe = normalized.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 80) || 'foto.jpg';
  return `upload-${Date.now()}-${safe}`;
}

function wrapExpoFile(file: ExpoFileLike): UploadLocalFile {
  return {
    get uri() {
      return file.uri;
    },
    get exists() {
      try {
        return Boolean(file.exists);
      } catch {
        return false;
      }
    },
    get size() {
      try {
        return typeof file.size === 'number' && Number.isFinite(file.size) ? file.size : 0;
      } catch {
        return 0;
      }
    },
    get type() {
      try {
        return file.type || '';
      } catch {
        return '';
      }
    },
    get name() {
      try {
        return file.name || 'foto.jpg';
      } catch {
        return 'foto.jpg';
      }
    },
    bytes() {
      return file.bytes();
    },
    async copyTo(destination) {
      await file.copy(new File(destination.uri));
    },
  };
}

const expoFileSystem: UploadFileSystem = {
  open(uri: string) {
    return wrapExpoFile(new File(uri));
  },
  createCacheFile(fileName: string) {
    return wrapExpoFile(new File(Paths.cache, fileName));
  },
};

function getUploadFileSystem(): UploadFileSystem {
  return overrideFileSystem ?? expoFileSystem;
}

/**
 * ImagePicker Android (SDK 56 MediaHandler) copies camera/gallery into app
 * cache and returns `file://` (`Uri.fromFile`). `content://` can still appear
 * from other pickers. Expo File (56.0.8) routes `content://` to
 * ContentProviderFile (native InputStream, not XHR, not base64).
 *
 * If that File reports !exists or `bytes()` fails, we `File.copy` into
 * `Paths.cache` and read the app-owned `file://`. That is a native copy, not
 * a URI-string conversion. The temp file is left in cache: preview/retry still
 * use the picker URI, and deleting it here could race a second submit.
 */
async function resolveReadableFile(
  uri: string,
  cacheName: string,
): Promise<{ file: UploadLocalFile; reader: 'expo-file-system' }> {
  const fs = getUploadFileSystem();
  const protocol = detectUriProtocol(uri);
  let local = fs.open(uri);

  if (!local.exists && protocol === 'content') {
    const dest = fs.createCacheFile(cacheName);
    try {
      await local.copyTo(dest);
      local = dest;
    } catch (error) {
      throw unreadableError(error);
    }
  }

  if (!local.exists) {
    throw new UploadFileError('No se pudo leer la imagen seleccionada', 'UNREADABLE');
  }

  return { file: local, reader: 'expo-file-system' };
}

async function readFileBytes(
  local: UploadLocalFile,
  protocol: UriProtocol,
  cacheName: string,
): Promise<{ bytes: Uint8Array; file: UploadLocalFile }> {
  try {
    const bytes = await local.bytes();
    return { bytes, file: local };
  } catch (error) {
    if (protocol !== 'content') {
      throw unreadableError(error);
    }
    const fs = getUploadFileSystem();
    const dest = fs.createCacheFile(cacheName);
    try {
      await local.copyTo(dest);
      const bytes = await dest.bytes();
      return { bytes, file: dest };
    } catch {
      throw unreadableError(error);
    }
  }
}

export async function createUploadFile(asset: PickerAssetLike): Promise<ExpoFetchUploadFile> {
  const origin = logOrigin(asset);
  const uri = asset.uri?.trim();
  if (!uri) {
    logFileReadError({
      origin,
      uriScheme: 'unknown',
      errorName: 'UploadFileError',
      errorMessage: 'No hay una imagen para adjuntar.',
      reader: 'expo-file-system',
    });
    throw new UploadFileError('No hay una imagen para adjuntar.', 'MISSING_URI');
  }

  const protocol = detectUriProtocol(uri);
  const uriScheme = logScheme(protocol);
  const declaredMime = normalizeImageMime(asset.mimeType ?? inferMimeFromFileName(asset.fileName));
  const cacheName = safeCacheFileName(asset.fileName, declaredMime);

  try {
    if (typeof asset.fileSize === 'number' && asset.fileSize > UPLOAD_MAX_BYTES) {
      throw new UploadFileError('La imagen supera el límite de 10 MB', 'FILE_TOO_LARGE');
    }

    const resolved = await resolveReadableFile(uri, cacheName);

    if (resolved.file.size > UPLOAD_MAX_BYTES) {
      throw new UploadFileError('La imagen supera el límite de 10 MB', 'FILE_TOO_LARGE');
    }

    const { bytes } = await readFileBytes(resolved.file, protocol, cacheName);

    if (bytes.byteLength === 0) {
      throw new UploadFileError('No se pudo leer la imagen seleccionada', 'UNREADABLE');
    }
    if (bytes.byteLength > UPLOAD_MAX_BYTES) {
      throw new UploadFileError('La imagen supera el límite de 10 MB', 'FILE_TOO_LARGE');
    }

    const detectedMime = detectMediaMime(bytes);
    const type =
      detectedMime ??
      (declaredMime === 'image/heic' || declaredMime === 'image/heif' ? declaredMime : null);
    if (!type || !isAllowedUploadMime(type)) {
      throw new UploadFileError('Tipo de archivo no permitido', 'UNSUPPORTED_MIME');
    }

    const name = normalizeImageFileName(asset.fileName, type);
    const copy = bytes.slice();
    const result: ExpoFetchUploadFile = {
      name,
      type,
      size: copy.byteLength,
      uriProtocol: protocol,
      async bytes() {
        return copy;
      },
      async arrayBuffer() {
        return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
      },
    };

    logFileRead({
      origin,
      uriScheme,
      mimeType: type,
      fileName: name,
      pickerFileSize: asset.fileSize ?? null,
      filesystemExists: true,
      filesystemSize: copy.byteLength,
      reader: 'expo-file-system',
      resultType: 'ExpoFetchUploadFile',
    });

    return result;
  } catch (error) {
    const mapped = error instanceof UploadFileError ? error : unreadableError(error);
    logFileReadError({
      origin,
      uriScheme,
      errorName: mapped.name,
      errorMessage: mapped.message,
      reader: 'expo-file-system',
    });
    throw mapped;
  }
}

export async function appendUploadFile(
  formData: FormData,
  field: string,
  asset: PickerAssetLike,
): Promise<ExpoFetchUploadFile> {
  const file = await createUploadFile(asset);
  (formData as unknown as FormDataWithFilePart).append(field, file);
  return file;
}
