import type { ReactNode } from 'react'
import { NavTecnicos } from '@/features/users'

interface AdminTecnicosLayoutProps {
  children: ReactNode
}

export default function AdminTecnicosLayout({ children }: AdminTecnicosLayoutProps): ReactNode {
  return (
    <div className="w-full">
      <div className="px-4 pt-6 sm:px-8">
        <NavTecnicos />
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}
