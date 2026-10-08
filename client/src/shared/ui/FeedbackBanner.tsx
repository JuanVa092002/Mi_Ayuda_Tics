import type { ReactNode } from 'react'
import { SemanticIcon, type SemanticIconName } from './SemanticIcon'

export type FeedbackTone = 'info' | 'success' | 'warning' | 'danger'

export interface InlineAlertProps {
  tone?: FeedbackTone
  title?: string
  children: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function InlineAlert({
  tone = 'info',
  title,
  children,
  action,
  className = '',
}: InlineAlertProps): ReactNode {
  const toneConfigs: Record<
    FeedbackTone,
    { bg: string; border: string; text: string; icon: SemanticIconName; iconColor: string }
  > = {
    info: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200',
      text: 'text-sky-900',
      icon: 'info',
      iconColor: 'text-sky-600',
    },
    success: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      text: 'text-emerald-950',
      icon: 'exito',
      iconColor: 'text-verde-sena',
    },
    warning: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      text: 'text-amber-950',
      icon: 'advertencia',
      iconColor: 'text-amber-600',
    },
    danger: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200',
      text: 'text-rose-950',
      icon: 'error',
      iconColor: 'text-rose-600',
    },
  }

  const cfg = toneConfigs[tone]

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      className={`rounded-xl border p-4 flex items-start gap-3 transition-all ${cfg.bg} ${cfg.border} ${cfg.text} ${className}`}
    >
      <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
        <SemanticIcon name={cfg.icon} size="md" />
      </div>
      <div className="flex-1 text-xs">
        {title ? <h4 className="font-bold mb-0.5">{title}</h4> : null}
        <div className="font-medium leading-relaxed opacity-90">{children}</div>
      </div>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="text-xs font-bold underline hover:opacity-80 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-azul-sena rounded px-1.5 py-0.5"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}

export interface FeedbackBannerProps {
  tone?: FeedbackTone
  variant?: FeedbackTone
  message?: string
  title?: string
  subMessage?: string
  description?: string
  affectedCaseId?: string
  actor?: string
  nextStep?: string
  onClose?: () => void
  onDismiss?: () => void
}

export function FeedbackBanner({
  tone,
  variant,
  message,
  title,
  subMessage,
  description,
  affectedCaseId,
  actor,
  nextStep,
  onClose,
  onDismiss,
}: FeedbackBannerProps): ReactNode {
  const effectiveTone: FeedbackTone = tone ?? variant ?? 'info'
  const effectiveTitle = title ?? message ?? 'Notificación'
  const effectiveDesc = description ?? subMessage
  const handleClose = onDismiss ?? onClose

  return (
    <div
      className="p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200"
      style={{
        background:
          effectiveTone === 'success'
            ? 'var(--success-bg)'
            : effectiveTone === 'warning'
            ? 'var(--warn-bg)'
            : effectiveTone === 'danger'
            ? 'var(--danger-bg)'
            : 'var(--info-bg)',
        borderColor:
          effectiveTone === 'success'
            ? 'var(--success-border)'
            : effectiveTone === 'warning'
            ? 'var(--warn-border)'
            : effectiveTone === 'danger'
            ? 'var(--danger-border)'
            : 'var(--info-border)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <SemanticIcon
          name={
            effectiveTone === 'success'
              ? 'exito'
              : effectiveTone === 'warning'
              ? 'advertencia'
              : effectiveTone === 'danger'
              ? 'error'
              : 'info'
          }
          size="md"
        />
        <div className="text-xs">
          <p className="font-bold text-azul-sena">{effectiveTitle}</p>
          {effectiveDesc ? <p className="text-slate-600 font-medium mt-0.5">{effectiveDesc}</p> : null}
          {(affectedCaseId || actor || nextStep) && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {affectedCaseId && <span>Caso: <strong className="text-azul-sena font-semibold">{affectedCaseId.slice(0, 8)}</strong></span>}
              {actor && <span>· Responsable: <strong className="text-azul-sena font-semibold">{actor}</strong></span>}
              {nextStep && <span className="text-verde-sena font-medium">· Siguiente: {nextStep}</span>}
            </div>
          )}
        </div>
      </div>
      {handleClose ? (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar notificación"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-sena shrink-0"
        >
          <SemanticIcon name="close" size="sm" />
        </button>
      ) : null}
    </div>
  )
}
