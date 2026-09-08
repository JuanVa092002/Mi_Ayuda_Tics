import type { ReactNode } from 'react'

interface LeaderKpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon: string
  tone?: 'navy' | 'green' | 'muted'
}

const toneClass = {
  navy: 'bg-[#E8EEF2] text-azul-sena',
  green: 'bg-[#E8F5E0] text-verde-sena',
  muted: 'bg-slate-100 text-slate-500',
}

export default function LeaderKpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'navy',
}: LeaderKpiCardProps): ReactNode {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(4,50,77,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-azul-sena">{value}</p>
          {hint ? <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${toneClass[tone]}`}>
          <span className="material-symbols-outlined !text-[22px]">{icon}</span>
        </div>
      </div>
    </article>
  )
}
