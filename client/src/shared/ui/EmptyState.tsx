import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: string
  }
  className?: string
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps): ReactNode {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}
      role="status"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-4 border hairline-border border-slate-100">
        <span className="material-symbols-outlined !text-[32px]">{icon}</span>
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-700">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-slate-400 font-medium">
          {description}
        </p>
      ) : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-azul-sena px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-azul-sena/90 focus:outline-none focus:ring-2 focus:ring-azul-sena/20 transition-all"
        >
          {action.icon ? (
            <span className="material-symbols-outlined !text-[16px]">{action.icon}</span>
          ) : null}
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
