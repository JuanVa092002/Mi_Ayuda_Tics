import type { ReactNode } from 'react'

export interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon: string
  tone?: 'navy' | 'green' | 'amber' | 'muted'
  className?: string
}

const TONE_CLASSES = {
  navy: 'bg-[#E8EEF2] text-azul-sena',
  green: 'bg-[#E8F5E0] text-verde-sena',
  amber: 'bg-[#FFF8E6] text-[#B8860B]',
  muted: 'bg-slate-100 text-slate-500',
}

export default function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'navy',
  className = '',
}: KpiCardProps): ReactNode {
  return (
    <article
      className={`rounded-2xl border hairline-border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(4,50,77,0.04)] transition-all hover:translate-y-[-2px] hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-azul-sena">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p> : null}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONE_CLASSES[tone]}`}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined !text-[22px]">{icon}</span>
        </div>
      </div>
    </article>
  )
}
