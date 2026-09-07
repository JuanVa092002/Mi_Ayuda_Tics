import { useEffect, useState } from 'react'
import {
  classifyWorkflowMutationFailure,
  fingerprintWorkflowPayload,
  getWorkflowManualRetryView,
} from '@/features/tickets/api/workflow-retry-policy'

export function WorkflowManualRetryNotice({
  error,
  lastPayload,
  currentPayload,
  pending = false,
  onRetry,
}: {
  error: unknown
  lastPayload?: unknown
  currentPayload?: unknown
  pending?: boolean
  onRetry: () => void
}) {
  const [now, setNow] = useState(Date.now())
  const failure = error ? classifyWorkflowMutationFailure(error, now) : null
  const view = getWorkflowManualRetryView(failure, {
    now,
    payloadUnchanged:
      fingerprintWorkflowPayload(currentPayload) === fingerprintWorkflowPayload(lastPayload),
  })
  const waiting = Boolean(view.waitSecondsRemaining)

  useEffect(() => {
    if (!waiting) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [waiting])

  if (!view.showCta && !failure?.message) return null
  if (!failure) return null

  return (
    <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-3">
      <p className="text-sm font-medium text-amber-900">{view.message || failure.message}</p>
      {view.showCta ? (
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-bold uppercase disabled:opacity-40"
          disabled={!view.ctaEnabled || pending}
          onClick={onRetry}
        >
          {view.ctaLabel}
        </button>
      ) : null}
    </div>
  )
}
