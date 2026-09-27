import type { ReactNode } from 'react'

export interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon: string
  tone?: 'navy' | 'green' | 'amber' | 'muted' | 'red'
  className?: string
}

const TONE_ICON_STYLE: Record<string, { bg: string; color: string }> = {
  navy:  { bg: 'var(--brand-subtle)', color: 'var(--brand)' },
  green: { bg: 'var(--accent-subtle)', color: 'var(--accent)' },
  amber: { bg: 'var(--warn-bg)', color: 'var(--warn)' },
  red:   { bg: 'var(--danger-bg)', color: 'var(--danger)' },
  muted: { bg: 'var(--surface-1)', color: 'var(--ink-3)' },
}

export default function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'navy',
  className = '',
}: KpiCardProps): ReactNode {
  const iconStyle = TONE_ICON_STYLE[tone] ?? TONE_ICON_STYLE.navy

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-surface p-5 transition-all hover:-translate-y-0.5 ${className}`}
      style={{ borderColor: 'var(--border-c)', boxShadow: 'var(--sh-xs)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] truncate"
            style={{ color: 'var(--ink-3)' }}
          >
            {label}
          </p>
          <p
            className="mt-2 text-[28px] font-bold leading-none tracking-tight"
            style={{ color: 'var(--ink-1)' }}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-[11px] font-medium" style={{ color: 'var(--ink-3)' }}>
              {hint}
            </p>
          ) : null}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: iconStyle.bg }}
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined !text-[20px]"
            style={{ color: iconStyle.color }}
          >
            {icon}
          </span>
        </div>
      </div>
    </article>
  )
}

