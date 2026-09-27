import type { ReactNode } from 'react'

export interface PageHeaderProps {
  category?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export default function PageHeader({
  category,
  title,
  description,
  actions,
  className = '',
}: PageHeaderProps): ReactNode {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b hairline-border border-slate-100 bg-white p-6 sm:p-8 ${className}`}
    >
      <div className="min-w-0">
        {category ? (
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-verde-sena mb-1">
            {category}
          </p>
        ) : null}
        <h1 className="truncate text-xl sm:text-2xl font-black tracking-tight text-azul-sena">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
