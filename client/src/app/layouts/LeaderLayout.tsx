import type { ReactNode } from 'react'
import AppShell from '@/shared/ui/AppShell'

interface LeaderLayoutProps {
  children: ReactNode
}

export default function LeaderLayout({ children }: LeaderLayoutProps): ReactNode {
  return <AppShell subtitleContext="Mesa de servicios">{children}</AppShell>
}
