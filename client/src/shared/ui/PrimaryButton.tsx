import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  loading?: boolean
  icon?: string
}

export default function PrimaryButton({
  children,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps): ReactNode {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-azul-sena px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-azul-sena/90 hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-azul-sena ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : icon ? (
        <span className="material-symbols-outlined !text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
