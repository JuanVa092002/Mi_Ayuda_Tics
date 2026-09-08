import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/adminTecnicos', label: 'Por aprobar' },
  { to: '/tecnicosActivos', label: 'Activos' },
  { to: '/tecnicosInactivos', label: 'Inactivos' },
] as const

export default function NavTecnicos(): ReactNode {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
              isActive ? 'bg-azul-sena text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:text-azul-sena'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
