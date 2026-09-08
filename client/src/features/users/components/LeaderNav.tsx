import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export const LEADER_NAV_ITEMS = [
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

interface LeaderNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export default function LeaderNav({ collapsed = false, onNavigate }: LeaderNavProps): ReactNode {
  const location = useLocation()

  return (
    <nav aria-label="Navegación líder" className="flex flex-col gap-1 px-3">
      {LEADER_NAV_ITEMS.map((item) => {
        const active = item.match.some((path) => location.pathname === path)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={item.label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'bg-azul-sena text-white'
                : 'text-slate-500 hover:bg-[#E8EEF2] hover:text-azul-sena'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined !text-[20px]" aria-hidden="true">{item.icon}</span>
            {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}
