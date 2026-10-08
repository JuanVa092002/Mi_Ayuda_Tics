import type { ExpoFetchUploadFile } from '@/shared/media/create-upload-file';

type UploadLogPayload = Record<string, unknown>;

function canLog(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

/** Multipart POST only. GET/catalog noise belongs off this logger. */

function redactError(error: unknown): UploadLogPayload {
  if (!(error instanceof Error)) {
    return { kind: typeof error };
  }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 8).join('\n'),
  };
}

function inspectPart(value: unknown): UploadLogPayload {
  if (value == null) return { exists: false };
  if (typeof value === 'string') return { exists: true, objectKind: 'string', length: value.length };
  if (typeof value !== 'object') return { exists: true, objectKind: typeof value };

  const record = value as Record<string, unknown>;
  const uri = typeof record.uri === 'string' ? record.uri : undefined;
  const protocol = uri?.split(':')[0];

  return {
    exists: true,
    objectKind:
      typeof record.bytes === 'function'
        ? 'ExpoFetchUploadFile'
        : value instanceof Blob
          ? 'Blob'
          : uri
            ? 'uri-descriptor'
            : value.constructor?.name ?? 'object',
    name: typeof record.name === 'string' ? record.name : undefined,
    mime: typeof record.type === 'string' ? record.type : undefined,
    size: typeof record.size === 'number' ? record.size : undefined,
    uriProtocol: protocol,
    hasBytes: typeof record.bytes === 'function',
  };
}

export function logUploadRequest(info: {
  method: string;
  path: string;
  bodyKind: 'json' | 'formdata' | 'empty';
  hasAuthorization: boolean;
  formKeys?: string[];
  photo?: ExpoFetchUploadFile | null;
  formInspect?: UploadLogPayload;
}): void {
  if (!canLog()) return;
  if (info.bodyKind !== 'formdata') return;
  console.info('[upload]', {
    method: info.method,
    path: info.path,
    bodyKind: info.bodyKind,
    hasAuthorization: info.hasAuthorization,
    formKeys: info.formKeys,
    photo: info.photo
      ? {
          exists: true,
          name: info.photo.name,
          mime: info.photo.type,
          size: info.photo.size,
          uriProtocol: info.photo.uriProtocol,
          objectKind: 'ExpoFetchUploadFile',
        }
      : (info.formInspect?.photo ??
        (info.formKeys?.includes('foto') || info.formKeys?.includes('evidencia')
          ? { exists: true, objectKind: 'unknown-part' }
          : { exists: false })),
  });
}

export function logUploadError(path: string, error: unknown): void {
  if (!canLog()) return;
  console.info('[upload:error]', { path, ...redactError(error) });
}

export function logFileRead(info: {
  origin: 'camera' | 'gallery' | 'unknown';
  uriScheme: string;
  mimeType?: string | null;
  fileName?: string | null;
  pickerFileSize?: number | null;
  filesystemExists: boolean;
  filesystemSize: number | null;
  reader: 'expo-file-system' | 'fallback';
  resultType: string;
}): void {
  if (!canLog()) return;
  console.info('[upload:file-read]', {
    origin: info.origin,
    uriScheme: info.uriScheme,
    mimeType: info.mimeType ?? undefined,
    fileName: info.fileName ?? undefined,
    pickerFileSize: info.pickerFileSize ?? null,
    filesystemExists: info.filesystemExists,
    filesystemSize: info.filesystemSize,
    reader: info.reader,
    resultType: info.resultType,
  });
}

export function logFileReadError(info: {
  origin: 'camera' | 'gallery' | 'unknown';
  uriScheme: string;
  errorName: string;
  errorMessage: string;
  reader: 'expo-file-system' | 'fallback';
}): void {
  if (!canLog()) return;
  console.info('[upload:file-read-error]', {
    origin: info.origin,
    uriScheme: info.uriScheme,
    errorName: info.errorName,
    errorMessage: info.errorMessage,
    reader: info.reader,
  });
}

export function inspectFormDataPhoto(formData: FormData, field = 'foto'): UploadLogPayload {
  const keys: string[] = [];
  let photo: unknown;
  formData.forEach((value, key) => {
    keys.push(key);
    if (key === field) photo = value;
  });
  return { formKeys: keys, photo: inspectPart(photo) };
}
