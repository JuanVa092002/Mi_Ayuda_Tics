import type { HistorialChip } from '@/shared/contracts/solicitud';

let queuedChip: HistorialChip | null = null;

export function queueHistorialChip(chip: HistorialChip) {
  queuedChip = chip;
}

export function takeQueuedHistorialChip(): HistorialChip | null {
  const next = queuedChip;
  queuedChip = null;
  return next;
}
