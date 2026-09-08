import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/adminSolicitud', label: 'Cola de nuevos' },
  { to: '/seguimiento', label: 'Seguimiento' },
] as const

export default function NavSolicitud(): ReactNode {
  return (
    <div className="pl-8 pt-8">
      <ul className="flex text-lg gap-8">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-verde-sena text-verde-sena'
                    : 'border-transparent text-slate-500 hover:text-azul-sena hover:border-azul-sena'
                }`
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
