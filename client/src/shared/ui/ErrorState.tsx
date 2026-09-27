import type { ReactNode } from 'react'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorState({
  title = 'No se pudo cargar la información',
  message,
  onRetry,
  className = '',
}: ErrorStateProps): ReactNode {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4 border hairline-border border-red-100">
        <span className="material-symbols-outlined !text-[32px]">error</span>
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-red-600 font-medium">
        {message}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border hairline-border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-azul-sena/20 transition-all"
        >
          <span className="material-symbols-outlined !text-[16px]">refresh</span>
          Reintentar
        </button>
      ) : null}
    </div>
  )
}
