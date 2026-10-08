import type { ReactNode } from 'react'

export type SemanticIconName =
  | 'ticket'
  | 'create'
  | 'status'
  | 'radicado'
  | 'asignado'
  | 'atencion'
  | 'solucionado'
  | 'esperando'
  | 'ubicacion'
  | 'ambiente'
  | 'telefono'
  | 'correo'
  | 'evidencia'
  | 'bitacora'
  | 'historial'
  | 'buscar'
  | 'filtrar'
  | 'tecnico'
  | 'despachar'
  | 'cancelar'
  | 'info'
  | 'advertencia'
  | 'exito'
  | 'error'
  | 'siguiente'
  | 'check'
  | 'close'
  | 'refresh'
  | 'console'
  | 'command'
  | 'cola'
  | 'mando'
  | 'tecnicos'

const MATERIAL_MAP: Record<SemanticIconName, string> = {
  ticket: 'description',
  create: 'add_circle',
  status: 'radio_button_checked',
  radicado: 'mark_email_unread',
  asignado: 'person_pin_circle',
  atencion: 'build',
  solucionado: 'check_circle',
  esperando: 'pending',
  ubicacion: 'location_on',
  ambiente: 'apartment',
  telefono: 'phone_in_talk',
  correo: 'mail',
  evidencia: 'image',
  bitacora: 'edit_note',
  historial: 'history',
  buscar: 'search',
  filtrar: 'filter_alt',
  tecnico: 'support_agent',
  tecnicos: 'engineering',
  despachar: 'assignment_turned_in',
  cancelar: 'cancel',
  info: 'info',
  advertencia: 'warning',
  exito: 'task_alt',
  error: 'error',
  siguiente: 'arrow_forward',
  check: 'check',
  close: 'close',
  refresh: 'refresh',
  console: 'terminal',
  command: 'dashboard_customize',
  cola: 'view_list',
  mando: 'dashboard',
}

export interface SemanticIconProps {
  name: SemanticIconName
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ariaLabel?: string
  role?: string
}

export function SemanticIcon({
  name,
  className = '',
  size = 'md',
  ariaLabel,
  role = ariaLabel ? 'img' : 'presentation',
}: SemanticIconProps): ReactNode {
  const iconSymbol = MATERIAL_MAP[name] || 'help_outline'

  const sizeClasses = {
    xs: '!text-[14px]',
    sm: '!text-[16px]',
    md: '!text-[18px]',
    lg: '!text-[22px]',
    xl: '!text-[28px]',
  }[size]

  return (
    <span
      className={`material-symbols-outlined shrink-0 select-none align-middle ${sizeClasses} ${className}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      role={role}
    >
      {iconSymbol}
    </span>
  )
}

export default SemanticIcon
