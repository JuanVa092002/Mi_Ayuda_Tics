import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/casos-por-resolver', label: 'Casos por resolver' },
  { to: '/casos-resueltos', label: 'Casos resueltos' },
]

export default function NavTecnico(): ReactNode {
  const location = useLocation()

  return (
    <nav className="w-full border-b border-azul-sena bg-white px-3 py-3 lg:max-w-[13%] lg:border-b-0 lg:border-r lg:py-8">
      <ol className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-4">
        {links.map(link => {
          const active = location.pathname === link.to
          return (
            <li key={link.to}>
              <Link
                className={`block rounded px-4 py-2 text-sm font-semibold transition-all lg:text-xl lg:py-3 ${
                  active
                    ? 'bg-azul-sena text-white'
                    : 'bg-white text-azul-sena hover:bg-azul-sena hover:text-white'
                }`}
                to={link.to}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
