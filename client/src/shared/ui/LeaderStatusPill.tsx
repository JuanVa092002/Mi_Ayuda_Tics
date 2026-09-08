import type { ReactNode } from 'react'
import { leaderStatusTone } from '@/features/tickets/leader-inbox'

const TONE_CLASS: Record<string, string> = {
  inbox: 'bg-[#E8F5E0] text-[#226d00]',
  assigned: 'bg-[#E8EEF2] text-azul-sena',
  progress: 'bg-[#FFF8E6] text-[#B8860B]',
  done: 'bg-[#E8F5E0] text-[#226d00]',
  cancelled: 'bg-[#FDECEA] text-[#D32F2F]',
  other: 'bg-slate-100 text-slate-500',
}

interface LeaderStatusPillProps {
  estado: string
  label?: string
}

export default function LeaderStatusPill({ estado, label }: LeaderStatusPillProps): ReactNode {
  const tone = leaderStatusTone(estado)
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold capitalize ${TONE_CLASS[tone]}`}
    >
      {label || estado.replace(/_/g, ' ')}
    </span>
  )
}
