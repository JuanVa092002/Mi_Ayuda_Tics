import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: string
  iconTrailing?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconTrailing,
  className = '',
  disabled,
  ...props
}: ButtonProps): ReactNode {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'

  const sizeStyles = {
    sm: 'h-9 px-3.5 rounded-lg text-xs gap-1.5 min-h-[36px]',
    md: 'h-10 px-4 rounded-xl text-sm gap-2 min-h-[40px]',
    lg: 'h-11 px-5 rounded-xl text-sm gap-2.5 min-h-[44px]',
  }[size]

  const variantStyles = {
    primary:
      'bg-brand-deep text-white shadow-xs hover:bg-[#032539] focus-visible:ring-brand-deep/30 active:bg-[#021824]',
    secondary:
      'bg-white text-ink border border-border-subtle shadow-2xs hover:bg-surface-subtle hover:border-border-strong focus-visible:ring-brand-deep/20',
    tertiary:
      'bg-transparent text-ink-muted hover:bg-black/5 hover:text-ink focus-visible:ring-brand-deep/20',
    destructive:
      'bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500/30 active:bg-red-800',
    success:
      'bg-brand-green text-white shadow-xs hover:bg-[#329600] focus-visible:ring-brand-green/30 active:bg-[#2b8000]',
  }[variant]

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="material-symbols-outlined !text-[18px] shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
      {!loading && iconTrailing ? (
        <span className="material-symbols-outlined !text-[18px] shrink-0" aria-hidden="true">
          {iconTrailing}
        </span>
      ) : null}
    </button>
  )
}
