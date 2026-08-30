export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new Error('EXPO_PUBLIC_API_URL no está configurada');
  }
  return `${url.replace(/\/$/, '')}/api`;
}

export const API_REQUEST_TIMEOUT_MS = 30_000;

/** Multipart uploads (foto de solicitud/registro) en redes móviles. */
export const API_UPLOAD_TIMEOUT_MS = 90_000;

/** Bootstrap / verify-token — evita bloquear la UI durante cold start de Render. */
export const SESSION_VERIFY_TIMEOUT_MS = 10_000;
