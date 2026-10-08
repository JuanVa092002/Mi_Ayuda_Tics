import type { ReactNode } from 'react'
import { SemanticIcon, type SemanticIconName } from './SemanticIcon'

export type StatusTone = 'inbox' | 'assigned' | 'progress' | 'done' | 'cancelled' | 'neutral'

const TONE_CSS_CLASS: Record<StatusTone, string> = {
  inbox:     'badge-inbox',
  assigned:  'badge-assigned',
  progress:  'badge-progress',
  done:      'badge-done',
  cancelled: 'badge-cancelled',
  neutral:   'badge-neutral',
}

const TONE_ICON_MAP: Record<StatusTone, SemanticIconName> = {
  inbox: 'radicado',
  assigned: 'asignado',
  progress: 'atencion',
  done: 'solucionado',
  cancelled: 'cancelar',
  neutral: 'status',
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

export function formatStatusLabel(estado: string | undefined, role?: string): string {
  if (!estado) return 'Desconocido'
  const clean = estado.toLowerCase().trim()
  if (clean === 'esperando_usuario') {
    return role === 'tecnico' || role === 'lider' ? 'Espera de usuario' : 'En espera de ti'
  }
  const map: Record<string, string> = {
    solicitado:        'Solicitado',
    en_espera:         'En espera',
    asignado:          'Asignado',
    en_proceso:        'En proceso',
    en_atencion:       'En atención',
    en_progreso:       'En progreso',
    por_iniciar:       'Por iniciar',
    pendiente:         'Pendiente',
    finalizado:        'Resuelto',
    resuelto:          'Resuelto',
    cerrado:           'Cerrado',
    cancelado:         'Cancelado',
    activo:            'Activo',
    inactivo:          'Inactivo',
  }
  return map[clean] || estado.replace(/_/g, ' ')
}

export interface StatusBadgeProps {
  status?: string | undefined
  estado?: string | undefined
  role?: string | undefined
  label?: string
  tone?: StatusTone
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export default function StatusBadge({
  status,
  estado,
  role,
  label,
  tone,
  size = 'sm',
  showIcon = true,
  className = '',
}: StatusBadgeProps): ReactNode {
  const rawStatus = status ?? estado
  const resolvedTone = tone || resolveStatusTone(rawStatus)
  const displayLabel = label || formatStatusLabel(rawStatus, role)
  const css = TONE_CSS_CLASS[resolvedTone]
  const sizeClass = size === 'md' ? 'text-xs px-3 py-1' : ''
  const iconName = TONE_ICON_MAP[resolvedTone]

  return (
    <span className={`badge ${css} ${sizeClass} inline-flex items-center gap-1.5 ${className}`}>
      {showIcon ? <SemanticIcon name={iconName} size="xs" /> : null}
      <span>{displayLabel}</span>
    </span>
  )
}

