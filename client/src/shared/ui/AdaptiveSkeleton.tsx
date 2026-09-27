import type { ReactNode } from 'react'

export function AdaptiveSkeletonList({ count = 5 }: { count?: number }): ReactNode {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border p-4 space-y-3 animate-pulse"
          style={{ borderColor: 'var(--border-c)', background: 'var(--surface)' }}
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-700/60" />
            <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700/60" />
          </div>
          <div className="h-4 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700/60" />
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700/60" />
            <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdaptiveSkeletonDetail(): ReactNode {
  return (
    <div className="p-6 space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando detalles">
      <div className="space-y-2">
        <div className="h-6 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700/60" />
        <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700/60" />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border p-4" style={{ borderColor: 'var(--border-c)' }}>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/60" />
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700/60" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/60" />
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700/60" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700/60" />
        <div className="h-20 w-full rounded-xl bg-slate-200 dark:bg-slate-700/60" />
      </div>
    </div>
  )
}
