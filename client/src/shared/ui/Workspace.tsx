import type { ReactNode } from 'react'

export function WorkCanvas({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 px-4 py-5 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}

export function Metric({
  label,
  value,
  tone = 'ink',
}: {
  label: string
  value: number | string
  tone?: 'ink' | 'warn' | 'ok'
}): ReactNode {
  return (
    <div className="min-w-[72px]">
      <p className="text-[22px] font-bold leading-none tracking-tight" style={{ color: tone === 'warn' ? 'var(--warn)' : tone === 'ok' ? 'var(--accent)' : 'var(--ink-1)' }}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium" style={{ color: 'var(--ink-3)' }}>{label}</p>
    </div>
  )
}

export function CommandBar({
  metrics,
  children,
}: {
  metrics: ReactNode
  children?: ReactNode
}): ReactNode {
  return (
    <section
      className="mb-2 flex flex-col gap-4 rounded-xl border bg-surface px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
      style={{ borderColor: 'var(--border-c)', boxShadow: 'var(--sh-xs)' }}
    >
      <div className="flex flex-wrap items-end gap-7">
        {metrics}
      </div>
      {children ? (
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center lg:w-auto">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export function SplitWorkspace({ queue, detail }: { queue: ReactNode; detail: ReactNode }): ReactNode {
  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
      {queue}
      {detail}
    </div>
  )
}

export function Pane({
  title,
  meta,
  children,
  footer,
}: {
  title: string
  meta?: string
  children: ReactNode
  footer?: ReactNode
}): ReactNode {
  return (
    <section
      className="overflow-hidden rounded-xl border bg-surface"
      style={{ borderColor: 'var(--border-c)', boxShadow: 'var(--sh-xs)' }}
    >
      <header
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--border-c)', background: 'var(--surface-1)' }}
      >
        <h2 className="text-[13px] font-semibold" style={{ color: 'var(--ink-1)' }}>{title}</h2>
        {meta ? (
          <p className="text-[11px] font-medium" style={{ color: 'var(--ink-3)' }}>{meta}</p>
        ) : null}
      </header>
      {children}
      {footer ? (
        <footer
          className="border-t"
          style={{ borderColor: 'var(--border-c)' }}
        >
          {footer}
        </footer>
      ) : null}
    </section>
  )
}

