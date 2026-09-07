export type ApiRuntimeHostKind = 'local' | 'remote';

export type ApiRuntimeHostInfo = {
  scheme: string;
  hostname: string;
  port: string;
  kind: ApiRuntimeHostKind;
};

export const DEFAULT_RENDER_API_ORIGIN = 'https://miayudatics-v1-0.onrender.com';

let didLogApiHost = false;

function canLogDev(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function isLocalApiHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '10.0.2.2' ||
    host === '[::1]' ||
    host === '::1' ||
    host.endsWith('.local')
  );
}

export function describeApiRuntimeHost(rawUrl: string): ApiRuntimeHostInfo {
  const parsed = new URL(rawUrl);
  const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
  return {
    scheme: parsed.protocol.replace(':', ''),
    hostname: parsed.hostname,
    port,
    kind: isLocalApiHostname(parsed.hostname) ? 'local' : 'remote',
  };
}

export function isLocalApiExplicitlyAllowed(): boolean {
  return process.env.EXPO_PUBLIC_ALLOW_LOCAL_API === '1';
}

/** Fail closed: daily mobile is Render HTTPS. Loopback requires an explicit opt-in. */
export function resolvePublicApiOrigin(rawUrl: string | undefined): string {
  const url = rawUrl?.trim();
  if (!url) {
    throw new Error(
      `EXPO_PUBLIC_API_URL no está configurada. El backend diario del mobile es ${DEFAULT_RENDER_API_ORIGIN}.`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL no es una URL válida.');
  }

  if (!parsed.hostname) {
    throw new Error('EXPO_PUBLIC_API_URL no tiene hostname.');
  }

  const local = isLocalApiHostname(parsed.hostname);

  if (local) {
    if (!isLocalApiExplicitlyAllowed()) {
      throw new Error(
        'EXPO_PUBLIC_API_URL apunta a un host local (127.0.0.1 / 10.0.2.2 / localhost). ' +
          `El mobile diario usa ${DEFAULT_RENDER_API_ORIGIN}. ` +
          'Loopback está bloqueado salvo EXPO_PUBLIC_ALLOW_LOCAL_API=1, y ese modo no es el loop diario.',
      );
    }
  } else if (parsed.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_API_URL remoto debe usar HTTPS.');
  }

  return url.replace(/\/$/, '');
}

function logApiRuntimeHostOnce(rawUrl: string): void {
  if (!canLogDev() || didLogApiHost) {
    return;
  }
  didLogApiHost = true;
  try {
    const info = describeApiRuntimeHost(rawUrl);
    console.info('[api-host]', {
      scheme: info.scheme,
      hostname: info.hostname,
      port: info.port,
      kind: info.kind,
    });
  } catch {
    console.info('[api-host]', { kind: 'invalid' });
  }
}

export function getApiBaseUrl(): string {
  const origin = resolvePublicApiOrigin(process.env.EXPO_PUBLIC_API_URL);
  logApiRuntimeHostOnce(origin);
  return `${origin}/api`;
}

export const API_REQUEST_TIMEOUT_MS = 30_000;

/** Multipart uploads (foto de solicitud/registro) en redes móviles. */
export const API_UPLOAD_TIMEOUT_MS = 90_000;

/** Bootstrap / verify-token — evita bloquear la UI durante cold start de Render. */
export const SESSION_VERIFY_TIMEOUT_MS = 10_000;
