import { API_REQUEST_TIMEOUT_MS, API_UPLOAD_TIMEOUT_MS, getApiBaseUrl } from '@/shared/config/env';
import { ApiError, mapHttpStatusToCode } from '@/shared/api/errors';
import { mapUnknownFetchError } from '@/shared/api/fetch-error';
import { parseJsonBody, parseJsonMessage } from '@/shared/api/http';
import { inspectFormDataPhoto, logUploadError, logUploadRequest } from '@/shared/media/upload-log';

export { ApiError } from '@/shared/api/errors';

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  formData?: FormData;
  timeoutMs?: number;
  /** Si false, un 401 no dispara el handler global (ej. login). */
  notifyUnauthorized?: boolean;
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    formData,
    timeoutMs = formData ? API_UPLOAD_TIMEOUT_MS : API_REQUEST_TIMEOUT_MS,
    notifyUnauthorized = true,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const formKeys: string[] = [];
  if (formData) {
    formData.forEach((_value, key) => {
      formKeys.push(key);
    });
  }

  if (formData) {
    logUploadRequest({
      method,
      path,
      bodyKind: 'formdata',
      hasAuthorization: Boolean(token),
      formKeys,
      formInspect: inspectFormDataPhoto(
        formData,
        formKeys.includes('evidencia') ? 'evidencia' : 'foto',
      ),
    });
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await parseJsonMessage(response);
      const code = mapHttpStatusToCode(response.status);

      if (response.status === 401 && notifyUnauthorized) {
        unauthorizedHandler?.();
      }

      throw new ApiError(message, code, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return parseJsonBody<T>(text);
  } catch (error) {
    if (formData || method !== 'GET') {
      logUploadError(path, error);
    }
    throw mapUnknownFetchError(error);
  } finally {
    clearTimeout(timer);
  }
}

/** Authenticated binary GET. Does not parse JSON, log bodies, or put the token in the URL. */
export async function apiFetchBinary(
  path: string,
  options: Pick<ApiFetchOptions, 'token' | 'timeoutMs' | 'notifyUnauthorized'> = {},
): Promise<Uint8Array> {
  const {
    token,
    timeoutMs = API_REQUEST_TIMEOUT_MS,
    notifyUnauthorized = true,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await parseJsonMessage(response);
      const code = mapHttpStatusToCode(response.status);

      if (response.status === 401 && notifyUnauthorized) {
        unauthorizedHandler?.();
      }

      throw new ApiError(message, code, response.status);
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    throw mapUnknownFetchError(error);
  } finally {
    clearTimeout(timer);
  }
}
