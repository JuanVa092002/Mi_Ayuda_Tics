import { ApiError, API_ERROR_COPY } from '@/shared/api/errors';
import { UploadFileError } from '@/shared/media/create-upload-file';

function collectErrorText(error: unknown): { name: string; message: string } {
  const name = error instanceof Error ? error.name : '';
  const parts: string[] = [];
  if (error instanceof Error) {
    parts.push(error.message);
    if (error.cause instanceof Error) {
      parts.push(error.cause.message);
    } else if (typeof error.cause === 'string') {
      parts.push(error.cause);
    }
  } else {
    parts.push(String(error));
  }
  return { name, message: parts.join(' ') };
}

export function isClientAbortError(error: unknown): boolean {
  const { name, message } = collectErrorText(error);
  if (name === 'AbortError' || name === 'TimeoutError') {
    return true;
  }
  return (
    /aborted/i.test(message) ||
    /cancell?ed/i.test(message) ||
    /Fetch request has been canceled/i.test(message)
  );
}

function isConfirmedOfflineError(message: string): boolean {
  return (
    /\boffline\b/i.test(message) ||
    /network is unreachable/i.test(message) ||
    /internet is unreachable/i.test(message) ||
    /ENETUNREACH/i.test(message) ||
    /ENETDOWN/i.test(message)
  );
}

function isConnectionErrorMessage(message: string): boolean {
  return (
    /ECONNREFUSED/i.test(message) ||
    /ECONNRESET/i.test(message) ||
    /ENOTFOUND/i.test(message) ||
    /EAI_AGAIN/i.test(message) ||
    /EHOSTUNREACH/i.test(message) ||
    /EPIPE/i.test(message) ||
    /failed to connect/i.test(message) ||
    /connection refused/i.test(message) ||
    /could not connect/i.test(message) ||
    /unable to resolve host/i.test(message) ||
    /unknownhost/i.test(message) ||
    /getaddrinfo/i.test(message) ||
    /nodename nor servname/i.test(message) ||
    /CLEARTEXT/i.test(message) ||
    /\bSSL\b/i.test(message) ||
    /\bTLS\b/i.test(message) ||
    /certificat/i.test(message) ||
    /ERR_CONNECTION/i.test(message) ||
    /Network request failed/i.test(message)
  );
}

export function mapUnknownFetchError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof UploadFileError) {
    return new ApiError(error.message, 'VALIDATION_ERROR', 0);
  }

  const { message } = collectErrorText(error);

  if (isClientAbortError(error)) {
    return new ApiError(API_ERROR_COPY.TIMEOUT, 'TIMEOUT', 408);
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

  if (isConfirmedOfflineError(message)) {
    return new ApiError(API_ERROR_COPY.OFFLINE, 'OFFLINE', 0);
  }

  if (isConnectionErrorMessage(message)) {
    return new ApiError(API_ERROR_COPY.CONNECTION_ERROR, 'CONNECTION_ERROR', 0);
  }

  return new ApiError(API_ERROR_COPY.CONNECTION_ERROR, 'CONNECTION_ERROR', 0);
}
