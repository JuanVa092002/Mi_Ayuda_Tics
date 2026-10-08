import { API_REQUEST_TIMEOUT_MS, API_UPLOAD_TIMEOUT_MS, getApiBaseUrl } from '@/shared/config/env';
import { ApiError, mapHttpStatusToCode, resolveErrorMessage } from '@/shared/api/errors';
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
  headers?: Record<string, string>;
  idempotencyKey?: string;
  /** Si false, un 401 no dispara el handler global (ej. login). */
  notifyUnauthorized?: boolean;
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

type ApiRouteClass = 'health' | 'login' | 'verify-token' | 'other';

function classifyApiRoute(path: string): ApiRouteClass {
  if (path === '/health') return 'health';
  if (path === '/auth/login') return 'login';
  if (path === '/auth/verify-token') return 'verify-token';
  return 'other';
}

function logApiTiming(info: {
  method: string;
  route: ApiRouteClass;
  status: number;
  durationMs: number;
  errorCode?: string;
}): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  console.info('[api-timing]', info);
}

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
    headers: extraHeaders,
    idempotencyKey,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
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

  const startedAt = Date.now();
  const route = classifyApiRoute(path);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });

    if (!response.ok) {
      const serverMessage = await parseJsonMessage(response);
      const code = mapHttpStatusToCode(response.status);
      const retryAfter = response.headers.get('Retry-After') ?? undefined;

      if (response.status === 401 && notifyUnauthorized) {
        unauthorizedHandler?.();
      }

      throw new ApiError(resolveErrorMessage(code, serverMessage), code, response.status, {
        retryAfter,
      });
    }

    logApiTiming({
      method,
      route,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });

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
    const mapped = mapUnknownFetchError(error);
    logApiTiming({
      method,
      route,
      status: mapped.status ?? 0,
      durationMs: Date.now() - startedAt,
      errorCode: mapped.code,
    });
    throw mapped;
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

  const startedAt = Date.now();

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const serverMessage = await parseJsonMessage(response);
      const code = mapHttpStatusToCode(response.status);

      if (response.status === 401 && notifyUnauthorized) {
        unauthorizedHandler?.();
      }

      throw new ApiError(resolveErrorMessage(code, serverMessage), code, response.status);
    }

    logApiTiming({
      method: 'GET',
      route: 'other',
      status: response.status,
      durationMs: Date.now() - startedAt,
    });

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    const mapped = mapUnknownFetchError(error);
    logApiTiming({
      method: 'GET',
      route: 'other',
      status: mapped.status ?? 0,
      durationMs: Date.now() - startedAt,
      errorCode: mapped.code,
    });
    throw mapped;
  } finally {
    clearTimeout(timer);
  }
}
