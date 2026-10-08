import { useEffect, type ReactNode } from 'react'

interface SlideOverDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  width?: 'md' | 'lg' | 'xl'
}

export function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
}: SlideOverDrawerProps): ReactNode {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slide-over-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div
          className={`w-full ${widthClasses[width]} transform transition duration-300 ease-out`}
        >
          <div className="flex h-full flex-col bg-surface shadow-2xl border-l" style={{ borderColor: 'var(--border-c)' }}>
            {/* Header */}
            <div
              className="px-6 py-5 border-b flex items-start justify-between"
              style={{ borderColor: 'var(--border-c)', background: 'var(--surface-1)' }}
            >
              <div>
                <h2 id="slide-over-title" className="text-base font-bold" style={{ color: 'var(--ink-1)' }}>
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar panel"
                className="rounded-lg p-1.5 transition-colors text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-sena focus-visible:ring-offset-1"
              >
                <span className="material-symbols-outlined !text-[20px]" aria-hidden="true">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="relative flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {children}
            </div>

            {/* Footer */}
            {footer ? (
              <div
                className="px-6 py-4 border-t flex items-center justify-end gap-3"
                style={{ borderColor: 'var(--border-c)', background: 'var(--surface-1)' }}
              >
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
