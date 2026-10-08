export const WORKFLOW_V2_MUTATION_AUTO_RETRY = 0 as const;

export const WORKFLOW_V2_MUTATIONS = [
  'reasignarTecnico',
  'iniciarAtencion',
  'actualizacion',
  'solicitarInformacion',
  'solucionParcial',
  'solucionTotal',
  'responder',
  'confirmarSolucion',
  'reabrir',
  'cancelar',
  'asignarTecnico',
] as const;

export const WORKFLOW_MANUAL_RETRY_CTA = 'Reintentar acción';

export const WORKFLOW_INCONCLUSIVE_COPY =
  'No hubo respuesta concluyente. Puedes reintentar la misma acción.';

export const WORKFLOW_RATE_LIMIT_COPY =
  'Demasiados intentos. Espera un momento e inténtalo de nuevo.';

export type WorkflowFailureKind = 'inconclusive' | 'rate_limited' | 'terminal';

export type WorkflowMutationFailure = {
  kind: WorkflowFailureKind;
  status?: number;
  code?: string;
  message: string;
  keepAttempt: boolean;
  offersManualRetry: boolean;
  autoRetry: typeof WORKFLOW_V2_MUTATION_AUTO_RETRY;
  retryAfterSeconds?: number;
  retryAfterUntil?: number;
};

export type WorkflowManualRetryView = {
  showCta: boolean;
  ctaEnabled: boolean;
  ctaLabel: typeof WORKFLOW_MANUAL_RETRY_CTA;
  message: string;
  waitSecondsRemaining: number | null;
};

export function fingerprintWorkflowPayload(payload: unknown): string {
  if (payload === undefined || payload === null) return '';
  return JSON.stringify(normalizeForFingerprint(payload));
}

function normalizeForFingerprint(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForFingerprint);
  if (value && typeof value === 'object') {
    return Object.keys(value as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalizeForFingerprint((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function parseRetryAfterHeader(
  raw: string | number | undefined | null,
  now = Date.now(),
): { seconds: number; until: number } | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
    const seconds = Math.ceil(raw);
    return { seconds, until: now + seconds * 1000 };
  }
  const text = String(raw).trim();
  if (/^\d+$/.test(text)) {
    const seconds = Number(text);
    return { seconds, until: now + seconds * 1000 };
  }
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return undefined;
  const seconds = Math.max(0, Math.ceil((parsed - now) / 1000));
  return { seconds, until: parsed };
}

export function readRetryAfterHeader(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') return undefined;
  const record = headers as Record<string, unknown>;
  const raw = record['retry-after'] ?? record['Retry-After'];
  if (Array.isArray(raw)) return raw[0] !== undefined ? String(raw[0]) : undefined;
  if (raw === undefined || raw === null) return undefined;
  return String(raw);
}

export function snapshotWorkflowError(error: unknown): {
  status?: number;
  code?: string;
  retryAfterHeader?: string;
  message?: string;
} {
  if (!error || typeof error !== 'object') return {};
  const candidate = error as {
    status?: number;
    code?: string;
    message?: string;
    response?: { status?: number; headers?: unknown; data?: { message?: string } };
    details?: { retryAfter?: string };
  };
  const status = candidate.response?.status ?? candidate.status;
  return {
    status,
    code: candidate.code,
    retryAfterHeader: candidate.details?.retryAfter ?? readRetryAfterHeader(candidate.response?.headers),
    message: candidate.response?.data?.message ?? candidate.message,
  };
}

export function classifyWorkflowMutationFailure(
  error: unknown,
  now = Date.now(),
): WorkflowMutationFailure {
  const snapshot = snapshotWorkflowError(error);
  const retryAfter = parseRetryAfterHeader(snapshot.retryAfterHeader, now);
  const base = {
    status: snapshot.status,
    code: snapshot.code,
    autoRetry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
  } as const;

  if (snapshot.status === 429 || snapshot.code === 'RATE_LIMITED') {
    return {
      ...base,
      kind: 'rate_limited',
      message: snapshot.message?.trim() || WORKFLOW_RATE_LIMIT_COPY,
      keepAttempt: true,
      offersManualRetry: true,
      retryAfterSeconds: retryAfter?.seconds,
      retryAfterUntil: retryAfter?.until,
    };
  }

  const inconclusiveCode =
    snapshot.code === 'TIMEOUT' ||
    snapshot.code === 'NETWORK_ERROR' ||
    snapshot.code === 'CONNECTION_ERROR' ||
    snapshot.code === 'OFFLINE' ||
    snapshot.code === 'GATEWAY_RECOVERABLE' ||
    snapshot.code === 'SERVER_ERROR' ||
    snapshot.code === 'ECONNABORTED' ||
    snapshot.code === 'ERR_NETWORK';

  const inconclusiveStatus =
    snapshot.status === undefined ||
    snapshot.status === 0 ||
    snapshot.status === 408 ||
    snapshot.status >= 500;

  if (inconclusiveCode || inconclusiveStatus) {
    return {
      ...base,
      kind: 'inconclusive',
      message: snapshot.message?.trim() || WORKFLOW_INCONCLUSIVE_COPY,
      keepAttempt: true,
      offersManualRetry: true,
    };
  }

  return {
    ...base,
    kind: 'terminal',
    message: snapshot.message?.trim() || WORKFLOW_INCONCLUSIVE_COPY,
    keepAttempt: false,
    offersManualRetry: false,
  };
}

export function getWorkflowManualRetryView(
  failure: WorkflowMutationFailure | null,
  options: { payloadUnchanged?: boolean; now?: number } = {},
): WorkflowManualRetryView {
  const payloadUnchanged = options.payloadUnchanged !== false;
  const now = options.now ?? Date.now();
  if (!failure || !failure.offersManualRetry || !payloadUnchanged) {
    return {
      showCta: false,
      ctaEnabled: false,
      ctaLabel: WORKFLOW_MANUAL_RETRY_CTA,
      message: failure?.message ?? '',
      waitSecondsRemaining: null,
    };
  }

  if (failure.kind === 'rate_limited' && failure.retryAfterUntil && failure.retryAfterUntil > now) {
    const waitSecondsRemaining = Math.max(1, Math.ceil((failure.retryAfterUntil - now) / 1000));
    return {
      showCta: true,
      ctaEnabled: false,
      ctaLabel: WORKFLOW_MANUAL_RETRY_CTA,
      message: `Demasiados intentos. Espera ${waitSecondsRemaining} s antes de reintentar.`,
      waitSecondsRemaining,
    };
  }

  return {
    showCta: true,
    ctaEnabled: true,
    ctaLabel: WORKFLOW_MANUAL_RETRY_CTA,
    message:
      failure.kind === 'rate_limited'
        ? failure.message || WORKFLOW_RATE_LIMIT_COPY
        : failure.message || WORKFLOW_INCONCLUSIVE_COPY,
    waitSecondsRemaining: null,
  };
}

export async function executeWorkflowMutationOnce<T>(execute: () => Promise<T>): Promise<T> {
  return execute();
}
