import type { ReactNode } from 'react'

export type StatusTone = 'inbox' | 'assigned' | 'progress' | 'done' | 'cancelled' | 'neutral'

const TONE_CLASSES: Record<StatusTone, string> = {
  inbox: 'bg-[#E8F5E0] text-[#166534] border-[#bbf7d0]',
  assigned: 'bg-[#E8EEF2] text-azul-sena border-[#cbd5e1]',
  progress: 'bg-[#FFF8E6] text-[#B8860B] border-[#fef08a]',
  done: 'bg-[#E8F5E0] text-[#15803d] border-[#86efac]',
  cancelled: 'bg-[#FDECEA] text-[#b91c1c] border-[#fecaca]',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function resolveStatusTone(estado: string | undefined): StatusTone {
  const s = (estado || '').toLowerCase().trim()
  if (['solicitado', 'en_espera', 'nuevo', 'abierto', 'activa', 'activo'].includes(s)) return 'inbox'
  if (['asignado', 'en_revision', 'aprobado'].includes(s)) return 'assigned'
  if (['pendiente', 'en_proceso', 'en_atencion', 'en_progreso', 'por_iniciar'].includes(s)) return 'progress'
  if (['finalizado', 'resuelto', 'cerrado', 'completado'].includes(s)) return 'done'
  if (['cancelado', 'rechazado', 'inactiva', 'inactivo', 'denegado'].includes(s)) return 'cancelled'
  return 'neutral'
}

export function formatStatusLabel(estado: string | undefined): string {
  if (!estado) return 'Desconocido'
  const map: Record<string, string> = {
    solicitado: 'Solicitado',
    en_espera: 'En Espera',
    asignado: 'Asignado',
    en_proceso: 'En Proceso',
    en_atencion: 'En Atención',
    pendiente: 'Pendiente',
    finalizado: 'Resuelto',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
    cancelado: 'Cancelado',
    activo: 'Activo',
    inactivo: 'Inactivo',
  }
  const clean = estado.toLowerCase().trim()
  return map[clean] || estado.replace(/_/g, ' ')
}

export interface StatusBadgeProps {
  status: string | undefined
  label?: string
  tone?: StatusTone
  size?: 'sm' | 'md'
  className?: string
}

export default function StatusBadge({
  status,
  label,
  tone,
  size = 'sm',
  className = '',
}: StatusBadgeProps): ReactNode {
  const resolvedTone = tone || resolveStatusTone(status)
  const displayLabel = label || formatStatusLabel(status)

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-[0.08em] rounded-full border hairline-border ${sizeClass} ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      {displayLabel}
    </span>
  )
}
