import {
  canResolveCaso,
  filterCasosEnProgreso,
  filterCasosEsperandoConfirmacion,
  filterCasosEsperandoFuncionario,
  filterCasosPorResolver,
  sortCasosByMostRecent,
  type CasoSummary,
} from '@/shared/contracts/caso';

export type TecnicoQueueTab =
  | 'por_iniciar'
  | 'en_atencion'
  | 'esperando_funcionario'
  | 'esperando_confirmacion';

export const TECNICO_QUEUE_CHIPS: { id: TecnicoQueueTab; label: string }[] = [
  { id: 'por_iniciar', label: 'Por iniciar' },
  { id: 'en_atencion', label: 'En atención' },
  { id: 'esperando_funcionario', label: 'Esperando' },
  { id: 'esperando_confirmacion', label: 'Confirmar' },
];

export type TecnicoNextWork = {
  item: CasoSummary;
  queue: TecnicoQueueTab;
  title: string;
  detail: string;
  cta: string;
  startOnPress: boolean;
};

export type TecnicoInsight = {
  porIniciar: number;
  enAtencion: number;
  esperandoFuncionario: number;
  esperandoConfirmacion: number;
  terminados: number;
  openTotal: number;
  scanLine: string;
  next?: TecnicoNextWork;
};

export function casosForQueue(items: CasoSummary[], tab: TecnicoQueueTab): CasoSummary[] {
  if (tab === 'por_iniciar') return sortCasosByMostRecent(filterCasosPorResolver(items));
  if (tab === 'en_atencion') return sortCasosByMostRecent(filterCasosEnProgreso(items));
  if (tab === 'esperando_funcionario') {
    return sortCasosByMostRecent(filterCasosEsperandoFuncionario(items));
  }
  return sortCasosByMostRecent(filterCasosEsperandoConfirmacion(items));
}

function toNextWork(item: CasoSummary, queue: TecnicoQueueTab): TecnicoNextWork {
  const detail = item.caseCode || item.description;
  if (queue === 'por_iniciar') {
    return {
      item,
      queue,
      title: 'Siguiente caso',
      detail,
      cta: 'Iniciar atención',
      startOnPress: true,
    };
  }
  if (queue === 'en_atencion') {
    return {
      item,
      queue,
      title: 'Continúa este caso',
      detail,
      cta: 'Abrir',
      startOnPress: false,
    };
  }
  if (queue === 'esperando_funcionario') {
    return {
      item,
      queue,
      title: 'Espera respuesta',
      detail,
      cta: 'Ver caso',
      startOnPress: false,
    };
  }
  return {
    item,
    queue,
    title: 'Pendiente de confirmar',
    detail,
    cta: 'Ver caso',
    startOnPress: false,
  };
}

export function pickNextWork(items: CasoSummary[]): TecnicoNextWork | undefined {
  const porIniciar = casosForQueue(items, 'por_iniciar')[0];
  if (porIniciar) return toNextWork(porIniciar, 'por_iniciar');
  const enAtencion = casosForQueue(items, 'en_atencion')[0];
  if (enAtencion) return toNextWork(enAtencion, 'en_atencion');
  const waiting = casosForQueue(items, 'esperando_funcionario')[0];
  if (waiting) return toNextWork(waiting, 'esperando_funcionario');
  const confirm = casosForQueue(items, 'esperando_confirmacion')[0];
  if (confirm) return toNextWork(confirm, 'esperando_confirmacion');
  return undefined;
}

export function buildTecnicoInsight(assigned: CasoSummary[], closed: CasoSummary[] = []): TecnicoInsight {
  const porIniciar = filterCasosPorResolver(assigned).length;
  const enAtencion = filterCasosEnProgreso(assigned).length;
  const esperandoFuncionario = filterCasosEsperandoFuncionario(assigned).length;
  const esperandoConfirmacion = filterCasosEsperandoConfirmacion(assigned).length;
  const terminados = closed.length;
  const openTotal = porIniciar + enAtencion + esperandoFuncionario + esperandoConfirmacion;

  let scanLine = 'No hay casos en tu cola.';
  if (porIniciar === 1) scanLine = '1 caso por iniciar.';
  else if (porIniciar > 1) scanLine = `${porIniciar} casos por iniciar.`;
  else if (enAtencion === 1) scanLine = '1 caso en atención.';
  else if (enAtencion > 1) scanLine = `${enAtencion} casos en atención.`;
  else if (esperandoFuncionario === 1) scanLine = '1 caso espera al funcionario.';
  else if (esperandoFuncionario > 1) scanLine = `${esperandoFuncionario} casos esperan al funcionario.`;
  else if (esperandoConfirmacion === 1) scanLine = '1 caso espera confirmación.';
  else if (esperandoConfirmacion > 1) scanLine = `${esperandoConfirmacion} casos esperan confirmación.`;
  else if (terminados > 0) scanLine = 'Cola al día.';

  return {
    porIniciar,
    enAtencion,
    esperandoFuncionario,
    esperandoConfirmacion,
    terminados,
    openTotal,
    scanLine,
    next: pickNextWork(assigned),
  };
}

export type TecnicoMosaicKey = 'porHacer' | 'enCurso' | 'esperandole';

export type TecnicoCardCta = {
  label: string;
  action: 'start' | 'update' | 'view';
};

export function mosaicCount(insight: TecnicoInsight, key: TecnicoMosaicKey): number {
  if (key === 'porHacer') return insight.porIniciar;
  if (key === 'enCurso') return insight.enAtencion;
  return insight.esperandoFuncionario + insight.esperandoConfirmacion;
}

export function tabForMosaic(key: TecnicoMosaicKey): TecnicoQueueTab {
  if (key === 'porHacer') return 'por_iniciar';
  if (key === 'enCurso') return 'en_atencion';
  return 'esperando_funcionario';
}

export function ctaForQueue(tab: TecnicoQueueTab): TecnicoCardCta {
  if (tab === 'por_iniciar') return { label: 'Iniciar atención', action: 'start' };
  if (tab === 'en_atencion') return { label: 'Actualizar', action: 'update' };
  if (tab === 'esperando_funcionario') return { label: 'Ver respuesta', action: 'view' };
  return { label: 'Ver confirmación', action: 'view' };
}

/** Home card CTA. Workflow v1 cannot use v2 start/update endpoints. */
export function ctaForCaso(item: Pick<CasoSummary, 'status' | 'workflowVersion'>, tab: TecnicoQueueTab): TecnicoCardCta {
  if (item.workflowVersion === 2) return ctaForQueue(tab);
  if (canResolveCaso(item)) return { label: 'Resolver', action: 'view' };
  return { label: 'Ver caso', action: 'view' };
}

export function relativeWaitLabel(createdAtRaw: string, now = new Date()): string | undefined {
  const match = createdAtRaw.trim().match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  const date = match
    ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4] ?? '00'), Number(match[5] ?? '00'))
    : new Date(createdAtRaw);
  if (Number.isNaN(date.getTime())) return undefined;
  const minutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 60) return `Esperando desde hace ${Math.max(1, minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `Esperando desde hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `Esperando desde hace ${days} d`;
}

export function getTimeBasedGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function firstNameFrom(fullName: string): string {
  return fullName.trim().split(/\s+/).filter(Boolean)[0] || 'Técnico';
}

export function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export type TecnicoFocus = TecnicoMosaicKey | 'all';

export function queuesForFocus(focus: TecnicoFocus): TecnicoQueueTab[] {
  if (focus === 'porHacer') return ['por_iniciar'];
  if (focus === 'enCurso') return ['en_atencion'];
  if (focus === 'esperandole') return ['esperando_funcionario', 'esperando_confirmacion'];
  return ['por_iniciar', 'en_atencion', 'esperando_funcionario', 'esperando_confirmacion'];
}

export function sectionTitleForQueue(tab: TecnicoQueueTab, count: number): string {
  if (tab === 'por_iniciar') return `Por hacer (${count})`;
  if (tab === 'en_atencion') return `En curso (${count})`;
  if (tab === 'esperando_funcionario') return `Esperando al usuario (${count})`;
  return `Pendiente de confirmar (${count})`;
}

export function emptyCopyForQueue(tab: TecnicoQueueTab, searching: boolean): { title: string; description: string } {
  if (searching) {
    return { title: 'Sin coincidencias', description: 'Prueba con otro código, ambiente o solicitante.' };
  }
  if (tab === 'por_iniciar') {
    return { title: 'Nada por iniciar', description: 'Cuando te asignen un caso, aparece aquí para atenderlo en un tap.' };
  }
  if (tab === 'en_atencion') {
    return { title: 'Sin casos en atención', description: 'Los casos que ya iniciaste se listan en esta cola.' };
  }
  if (tab === 'esperando_funcionario') {
    return { title: 'Nada en espera', description: 'Aquí verás los casos en los que pediste información.' };
  }
  return { title: 'Nada por confirmar', description: 'Las soluciones enviadas esperan la confirmación del funcionario.' };
}
