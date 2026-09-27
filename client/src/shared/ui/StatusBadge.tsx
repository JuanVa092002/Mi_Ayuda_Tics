import type { ReactNode } from 'react'

export type StatusTone = 'inbox' | 'assigned' | 'progress' | 'done' | 'cancelled' | 'neutral'

const TONE_CSS_CLASS: Record<StatusTone, string> = {
  inbox:     'badge-inbox',
  assigned:  'badge-assigned',
  progress:  'badge-progress',
  done:      'badge-done',
  cancelled: 'badge-cancelled',
  neutral:   'badge-neutral',
}

export function resolveStatusTone(estado: string | undefined): StatusTone {
  const s = (estado || '').toLowerCase().trim()
  if (['solicitado', 'en_espera', 'nuevo', 'abierto', 'activa', 'activo'].includes(s)) return 'inbox'
  if (['asignado', 'en_revision', 'aprobado'].includes(s)) return 'assigned'
  if (['pendiente', 'en_proceso', 'en_atencion', 'en_progreso', 'por_iniciar', 'esperando_usuario'].includes(s)) return 'progress'
  if (['finalizado', 'resuelto', 'cerrado', 'completado'].includes(s)) return 'done'
  if (['cancelado', 'rechazado', 'inactiva', 'inactivo', 'denegado'].includes(s)) return 'cancelled'
  return 'neutral'
}

export function formatStatusLabel(estado: string | undefined): string {
  if (!estado) return 'Desconocido'
  const map: Record<string, string> = {
    solicitado:        'Solicitado',
    en_espera:         'En espera',
    asignado:          'Asignado',
    en_proceso:        'En proceso',
    en_atencion:       'En atención',
    en_progreso:       'En progreso',
    esperando_usuario: 'En espera de ti',
    por_iniciar:       'Por iniciar',
    pendiente:         'Pendiente',
    finalizado:        'Resuelto',
    resuelto:          'Resuelto',
    cerrado:           'Cerrado',
    cancelado:         'Cancelado',
    activo:            'Activo',
    inactivo:          'Inactivo',
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
  const css = TONE_CSS_CLASS[resolvedTone]
  const sizeClass = size === 'md' ? 'text-xs px-3 py-1' : ''

  return (
    <span className={`badge ${css} ${sizeClass} ${className}`}>
      {displayLabel}
    </span>
  )
}

