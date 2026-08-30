import { ApiError } from '@/shared/api/errors';
import { UploadFileError } from '@/shared/media/create-upload-file';

export function mapUnknownFetchError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof UploadFileError) {
    return new ApiError(error.message, 'VALIDATION_ERROR', 0);
  }

  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : '';

  if (name === 'AbortError' || /aborted/i.test(message)) {
    return new ApiError(
      'El servidor está tardando en responder. Intenta de nuevo en unos segundos.',
      'TIMEOUT',
      408,
    );
  }

  if (/Unsupported FormDataPart/i.test(message)) {
    return new ApiError(
      'No se pudo adjuntar la foto. Vuelve a tomarla o elígela de la galería.',
      'VALIDATION_ERROR',
      0,
    );
  }

  if (/No se pudo leer la imagen/i.test(message)) {
    return new ApiError(message, 'VALIDATION_ERROR', 0);
  }

  return new ApiError(
    'No hay conexión con el servidor. Verifica tu internet.',
    'NETWORK_ERROR',
    0,
  );
}
