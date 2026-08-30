type PopulatedNameDto = { _id?: string; nombre?: string };
type MediaDto = { url?: string; optimizedUrl?: string; filename?: string };
type SolucionDto = { descripcionSolucion?: string; evidencia?: MediaDto };

export type SolicitudListItemDto = {
  _id: string;
  codigoCaso?: string;
  descripcion?: string;
  estado: string;
  fecha?: string;
  telefono?: string;
  usuario?: PopulatedNameDto | string;
  tecnico?: PopulatedNameDto | string;
  ambiente?: PopulatedNameDto;
  tipoCaso?: PopulatedNameDto | string;
  foto?: MediaDto;
  solucion?: SolucionDto | string;
};

export type SolicitudDetailDto = {
  descripcion?: string;
  fecha?: string;
  estado: string;
  telefono?: string;
  codigoCaso?: string;
  usuario?: PopulatedNameDto | string;
  tecnico?: PopulatedNameDto | string;
  ambiente?: PopulatedNameDto & { activo?: boolean };
  tipoCaso?: PopulatedNameDto | string;
  foto?: MediaDto;
  solucion?: SolucionDto | string;
};

export type HistorialResponseDto = {
  solicitudesFinalizadas: SolicitudListItemDto[];
};

export type SolicitudDetailResponseDto = {
  data: SolicitudDetailDto;
};

export type CreateSolicitudResponseDto = {
  message: string;
  solicitud: SolicitudListItemDto & { _id: string };
};

export type SolicitudStatus = 'solicitado' | 'asignado' | 'pendiente' | 'finalizado';

export type MediaAsset = {
  url: string;
  optimizedUrl?: string;
};

export type SolicitudSolution = {
  description: string;
  evidenceUrl?: string;
};

export type SolicitudSummary = {
  id: string;
  caseCode: string;
  description: string;
  status: SolicitudStatus;
  createdAtRaw: string;
  phone?: string;
  requesterName?: string;
  technicianName?: string;
  environmentName?: string;
  caseTypeId?: string;
  caseTypeName?: string;
  photo?: MediaAsset;
  solution?: SolicitudSolution;
};

export type TimelineStepState = 'completed' | 'current' | 'upcoming';

export type TimelineStep = {
  status: SolicitudStatus;
  label: string;
  state: TimelineStepState;
};

export type SolicitudDetail = SolicitudSummary & {
  environmentIsActive?: boolean;
};

export type SolicitudStats = {
  total: number;
  pending: number;
  resolved: number;
};

const PENDING_STATUSES: SolicitudStatus[] = ['solicitado', 'asignado', 'pendiente'];

function resolvePopulatedName(value: PopulatedNameDto | string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return undefined;
  return value.nombre;
}

function resolvePopulatedId(value: PopulatedNameDto | string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value._id;
}

function mapMedia(dto?: MediaDto): MediaAsset | undefined {
  if (!dto?.url) return undefined;
  return {
    url: dto.url,
    optimizedUrl: dto.optimizedUrl,
  };
}

function normalizeStatus(raw: string): SolicitudStatus {
  if (
    raw === 'solicitado' ||
    raw === 'asignado' ||
    raw === 'pendiente' ||
    raw === 'finalizado'
  ) {
    return raw;
  }
  return 'solicitado';
}

function mapSolution(dto: SolucionDto | string | undefined): SolicitudSolution | undefined {
  if (!dto || typeof dto === 'string') return undefined;
  if (!dto.descripcionSolucion) return undefined;
  return {
    description: dto.descripcionSolucion,
    evidenceUrl: dto.evidencia?.url,
  };
}

const STATUS_ORDER: SolicitudStatus[] = ['solicitado', 'asignado', 'pendiente', 'finalizado'];

function parseBackendDate(raw: string): Date | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (match) {
    const [, day, month, year, hour = '00', minute = '00'] = match;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

export function formatSolicitudDate(createdAtRaw: string): string {
  if (!createdAtRaw?.trim()) return '—';

  const date = parseBackendDate(createdAtRaw);
  if (!date) return createdAtRaw;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function buildSolicitudTimeline(
  detail: Pick<SolicitudDetail, 'status'>,
): TimelineStep[] {
  const currentIndex = STATUS_ORDER.indexOf(detail.status);

  return STATUS_ORDER.map((status, index) => {
    let state: TimelineStepState = 'upcoming';
    if (index < currentIndex) state = 'completed';
    else if (index === currentIndex) state = 'current';

    return {
      status,
      label: getStatusLabel(status),
      state,
    };
  });
}

export function filterSolicitudesByQuery(
  items: SolicitudSummary[],
  query: string,
): SolicitudSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) => {
    const haystack = [
      item.caseCode,
      item.description,
      item.environmentName,
      item.caseTypeName,
      item.technicianName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export type HistorialChip =
  | 'Todas'
  | 'Pendientes de asignación'
  | 'En proceso'
  | 'Resueltas';

export const HISTORIAL_FILTER_CHIPS: HistorialChip[] = [
  'Todas',
  'Pendientes de asignación',
  'En proceso',
  'Resueltas',
];

export function filterSolicitudesByHistorialChip(
  items: SolicitudSummary[],
  chip: HistorialChip,
): SolicitudSummary[] {
  switch (chip) {
    case 'Pendientes de asignación':
      return items.filter((item) => item.status === 'solicitado');
    case 'En proceso':
      return items.filter((item) => item.status === 'asignado' || item.status === 'pendiente');
    case 'Resueltas':
      return items.filter((item) => item.status === 'finalizado');
    default:
      return items;
  }
}

export function getStatusLabel(status: SolicitudStatus): string {
  switch (status) {
    case 'solicitado':
      return 'Pendiente de asignación';
    case 'asignado':
      return 'Asignado';
    case 'pendiente':
      return 'Requiere información';
    case 'finalizado':
      return 'Resuelta';
    default:
      return status;
  }
}

export function isPendingStatus(status: SolicitudStatus): boolean {
  return PENDING_STATUSES.includes(status);
}

export function hasEvidence(solution?: SolicitudSolution): boolean {
  return Boolean(solution?.evidenceUrl);
}

export function mapSolicitudSummary(dto: SolicitudListItemDto): SolicitudSummary {
  return {
    id: dto._id,
    caseCode: dto.codigoCaso ?? '',
    description: dto.descripcion ?? '',
    status: normalizeStatus(dto.estado),
    createdAtRaw: dto.fecha ?? '',
    phone: dto.telefono,
    requesterName: resolvePopulatedName(dto.usuario),
    technicianName: resolvePopulatedName(dto.tecnico),
    environmentName: resolvePopulatedName(dto.ambiente),
    caseTypeId: resolvePopulatedId(dto.tipoCaso),
    caseTypeName: resolvePopulatedName(
      typeof dto.tipoCaso === 'object' ? dto.tipoCaso : undefined,
    ),
    photo: mapMedia(dto.foto),
    solution: mapSolution(dto.solucion),
  };
}

export function mapSolicitudDetail(dto: SolicitudDetailDto, id: string): SolicitudDetail {
  return {
    id,
    caseCode: dto.codigoCaso ?? '',
    description: dto.descripcion ?? '',
    status: normalizeStatus(dto.estado),
    createdAtRaw: dto.fecha ?? '',
    phone: dto.telefono,
    requesterName: resolvePopulatedName(dto.usuario),
    technicianName: resolvePopulatedName(dto.tecnico),
    environmentName: resolvePopulatedName(dto.ambiente),
    environmentIsActive: dto.ambiente?.activo,
    caseTypeId: resolvePopulatedId(dto.tipoCaso),
    caseTypeName: resolvePopulatedName(
      typeof dto.tipoCaso === 'object' ? dto.tipoCaso : undefined,
    ),
    photo: mapMedia(dto.foto),
    solution: mapSolution(dto.solucion),
  };
}

export function mapHistorialResponse(dto: HistorialResponseDto): SolicitudSummary[] {
  return (dto.solicitudesFinalizadas ?? []).map(mapSolicitudSummary);
}

export function computeSolicitudStats(items: SolicitudSummary[]): SolicitudStats {
  return {
    total: items.length,
    pending: items.filter((item) => isPendingStatus(item.status)).length,
    resolved: items.filter((item) => item.status === 'finalizado').length,
  };
}
