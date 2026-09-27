import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export interface NavItem {
  to: string
  label: string
  icon: string
  match: readonly string[]
}

export const LEADER_NAV_ITEMS: readonly NavItem[] = [
  { to: '/adminSolicitud', label: 'Cola de nuevos', icon: 'inbox', match: ['/adminSolicitud'] },
  { to: '/seguimiento', label: 'Seguimiento', icon: 'timeline', match: ['/seguimiento'] },
  {
    to: '/adminTecnicos',
    label: 'Técnicos',
    icon: 'engineering',
    match: ['/adminTecnicos', '/tecnicosActivos', '/tecnicosInactivos'],
  },
  { to: '/adminEstadisticas', label: 'Estadísticas', icon: 'monitoring', match: ['/adminEstadisticas'] },
  { to: '/adminAmbientes', label: 'Ambientes', icon: 'apartment', match: ['/adminAmbientes'] },
  { to: '/adminCasos', label: 'Tipo de soporte', icon: 'category', match: ['/adminCasos'] },
] as const

export const FUNCIONARIO_NAV_ITEMS: readonly NavItem[] = [
  { to: '/funcionario', label: 'Mis Solicitudes', icon: 'assignment', match: ['/funcionario'] },
  { to: '/perfil', label: 'Mi Perfil', icon: 'account_circle', match: ['/perfil'] },
] as const

export const TECNICO_NAV_ITEMS: readonly NavItem[] = [
  { to: '/casos-por-resolver', label: 'Por resolver', icon: 'pending_actions', match: ['/casos-por-resolver'] },
  { to: '/mis-casos', label: 'Mis casos', icon: 'assignment_ind', match: ['/mis-casos'] },
  { to: '/casos-resueltos', label: 'Casos resueltos', icon: 'task_alt', match: ['/casos-resueltos'] },
  { to: '/perfil', label: 'Mi Perfil', icon: 'account_circle', match: ['/perfil'] },
] as const

export function getNavItemsForRole(role: string | undefined): { items: readonly NavItem[]; ariaLabel: string } {
  const r = (role || '').toLowerCase()
  if (r === 'lider' || r === 'líder' || r === 'administrador') {
    return { items: LEADER_NAV_ITEMS, ariaLabel: 'Navegación líder' }
  }
  if (r === 'tecnico' || r === 'técnico') {
    return { items: TECNICO_NAV_ITEMS, ariaLabel: 'Navegación técnico' }
  }
  return { items: FUNCIONARIO_NAV_ITEMS, ariaLabel: 'Navegación funcionario' }
}

interface RoleNavigationProps {
  role?: string
  collapsed?: boolean
  onNavigate?: () => void
}

export default function RoleNavigation({
  role,
  collapsed = false,
  onNavigate,
}: RoleNavigationProps): ReactNode {
  const location = useLocation()
  const { items, ariaLabel } = getNavItemsForRole(role)

  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active = item.match.some((path) => location.pathname === path)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={item.label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'bg-azul-sena text-white shadow-sm'
                : 'text-slate-600 hover:bg-[#E8EEF2] hover:text-azul-sena'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined !text-[20px]" aria-hidden="true">
              {item.icon}
            </span>
            {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}
