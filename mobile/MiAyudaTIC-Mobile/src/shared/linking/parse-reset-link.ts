/** 64-char hex token from crypto.randomBytes(32).toString('hex') */
const RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

const RESET_PATH_SEGMENTS = new Set(['restablecerpassword', 'reset-password']);

export function isValidResetTokenFormat(token: string | null | undefined): token is string {
  return typeof token === 'string' && RESET_TOKEN_PATTERN.test(token);
}

function normalizeToken(raw: string): string | null {
  const token = decodeURIComponent(raw.trim()).replace(/\/+$/, '');
  if (!isValidResetTokenFormat(token)) {
    return null;
  }
  return token;
}

function tokenFromPathSegments(segments: string[]): string | null {
  const idx = segments.findIndex((segment) =>
    RESET_PATH_SEGMENTS.has(segment.toLowerCase()),
  );
  if (idx === -1 || idx >= segments.length - 1) {
    return null;
  }
  return normalizeToken(segments[idx + 1] ?? '');
}

/**
 * Resolves a route param into a trusted reset token or null.
 */
export function resolveResetTokenFromRouteParam(
  param: string | string[] | undefined,
): string | null {
  if (Array.isArray(param)) {
    for (const value of param) {
      if (isValidResetTokenFormat(value)) {
        return value;
      }
    }
    return null;
  }
  if (typeof param === 'string' && param.length > 0) {
    return isValidResetTokenFormat(param) ? param : null;
  }
  return null;
}

/**
 * Extracts a password-reset token from HTTPS App Links, custom scheme URLs,
 * or raw path strings routed by the OS / Expo Router.
 */
export function extractResetTokenFromUrl(input: string): string | null {
  const raw = input?.trim();
  if (!raw) {
    return null;
  }

  try {
    if (raw.includes('://')) {
      const url = new URL(raw);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const fromPath = tokenFromPathSegments(pathSegments);
      if (fromPath) {
        return fromPath;
      }

      // miayudatics://restablecerPassword/<token> — host may be the path segment
      if (RESET_PATH_SEGMENTS.has(url.hostname.toLowerCase())) {
        const fromHost = normalizeToken(url.pathname.replace(/^\//, ''));
        if (fromHost) {
          return fromHost;
        }
      }

      return null;
    }
  } catch {
    // Fall through to path parsing
  }

  const pathOnly = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('?')[0] ?? '';
  const segments = pathOnly.split('/').filter(Boolean);
  return tokenFromPathSegments(segments);
}
