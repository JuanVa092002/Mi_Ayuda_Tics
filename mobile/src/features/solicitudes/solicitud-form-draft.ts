import type { FieldErrors } from 'react-hook-form';
import type { CreateSolicitudFormValues } from '@/features/solicitudes/schemas';

export type SolicitudFormPhoto = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  origin?: 'camera' | 'gallery';
};

export type SolicitudFormFieldErrors = Partial<
  Record<'environmentId' | 'caseTypeId' | 'description' | 'phone', string>
>;

export type SolicitudFormDraft = {
  environmentId: string;
  caseTypeId: string;
  description: string;
  phone: string;
  photo?: SolicitudFormPhoto;
  errors?: SolicitudFormFieldErrors;
};

type DraftListener = () => void;

let draft: SolicitudFormDraft | null = null;
const listeners = new Set<DraftListener>();

function emitDraft(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function emptySolicitudFormDraft(phone = ''): SolicitudFormDraft {
  return {
    environmentId: '',
    caseTypeId: '',
    description: '',
    phone,
  };
}

export function getSolicitudFormDraft(): SolicitudFormDraft | null {
  return draft;
}

export function writeSolicitudFormDraft(
  next: SolicitudFormDraft,
  options?: { emit?: boolean },
): void {
  draft = {
    environmentId: next.environmentId,
    caseTypeId: next.caseTypeId,
    description: next.description,
    phone: next.phone,
    photo: next.photo,
    errors: next.errors,
  };
  if (options?.emit) {
    emitDraft();
  }
}

export function clearSolicitudFormDraft(): void {
  draft = null;
  emitDraft();
}

export function subscribeSolicitudFormDraft(listener: DraftListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function snapshotSolicitudFormErrors(
  errors: FieldErrors<CreateSolicitudFormValues>,
): SolicitudFormFieldErrors | undefined {
  const next: SolicitudFormFieldErrors = {};
  if (typeof errors.environmentId?.message === 'string') {
    next.environmentId = errors.environmentId.message;
  }
  if (typeof errors.caseTypeId?.message === 'string') {
    next.caseTypeId = errors.caseTypeId.message;
  }
  if (typeof errors.description?.message === 'string') {
    next.description = errors.description.message;
  }
  if (typeof errors.phone?.message === 'string') {
    next.phone = errors.phone.message;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

export function buildSolicitudFormDefaultValues(
  stored: SolicitudFormDraft | null,
  defaultPhone: string,
): CreateSolicitudFormValues {
  return {
    environmentId: stored?.environmentId ?? '',
    caseTypeId: stored?.caseTypeId ?? '',
    description: stored?.description ?? '',
    phone: stored?.phone || defaultPhone,
  };
}

/** Restore errors only when the field value is still the one that failed. */
export function errorsToRestore(
  stored: SolicitudFormDraft | null,
  currentValues: CreateSolicitudFormValues,
): SolicitudFormFieldErrors | undefined {
  if (!stored?.errors) return undefined;
  const next: SolicitudFormFieldErrors = {};
  (['environmentId', 'caseTypeId', 'description', 'phone'] as const).forEach((name) => {
    const message = stored.errors?.[name];
    if (!message) return;
    if ((currentValues[name] ?? '') === (stored[name] ?? '')) {
      next[name] = message;
    }
  });
  return Object.keys(next).length > 0 ? next : undefined;
}
