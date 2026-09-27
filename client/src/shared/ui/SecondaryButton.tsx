import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  icon?: string
}

export default function SecondaryButton({
  children,
  icon,
  className = '',
  disabled,
  ...props
}: SecondaryButtonProps): ReactNode {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border hairline-border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {icon ? <span className="material-symbols-outlined !text-[18px] text-slate-500">{icon}</span> : null}
      {children}
    </button>
  )
}
