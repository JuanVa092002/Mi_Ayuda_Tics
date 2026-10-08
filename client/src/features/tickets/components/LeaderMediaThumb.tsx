import { useEffect, useState } from 'react'
import type { MediaFile } from '@/shared/types'
import {
  fetchAuthenticatedTicketPhoto,
  resolveTicketPhotoSource,
} from '@/shared/media/ticket-photo'

function sourceKey(foto?: MediaFile | string | null): string {
  const source = resolveTicketPhotoSource(foto)
  if (source.kind === 'public') return `p:${source.url}`
  if (source.kind === 'authenticated') return `a:${source.path}`
  return 'none'
}

function useTicketPhotoUrl(foto?: MediaFile | string | null): { url?: string; loading: boolean } {
  const key = sourceKey(foto)
  const [state, setState] = useState<{ url?: string; loading: boolean }>(() => {
    const source = resolveTicketPhotoSource(foto)
    if (source.kind === 'public') return { url: source.url, loading: false }
    if (source.kind === 'authenticated') return { url: undefined, loading: true }
    return { url: undefined, loading: false }
  })

  useEffect(() => {
    const source = resolveTicketPhotoSource(foto)
    if (source.kind === 'none') {
      setState({ url: undefined, loading: false })
      return
    }
    if (source.kind === 'public') {
      setState({ url: source.url, loading: false })
      return
    }

    let objectUrl: string | undefined
    let cancelled = false
    setState({ url: undefined, loading: true })

    void fetchAuthenticatedTicketPhoto(source.path)
      .then((blobUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(blobUrl)
          return
        }
        objectUrl = blobUrl
        setState({ url: blobUrl, loading: false })
      })
      .catch(() => {
        if (!cancelled) setState({ url: undefined, loading: false })
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [foto, key])

  return state
}

function EmptyThumb({ box, compact }: { box: string; compact: boolean }) {
  return (
    <div
      className={`mx-auto flex shrink-0 items-center justify-center border border-dashed border-slate-200 bg-slate-50 ${box}`}
      aria-label="Sin evidencia"
    >
      <span className={`material-symbols-outlined text-slate-300 ${compact ? 'text-[16px]' : 'text-[22px]'}`}>image_not_supported</span>
    </div>
  )
}

export default function LeaderMediaThumb({
  foto,
  alt = 'Evidencia del caso',
  size = 'md',
}: {
  foto?: MediaFile | string | null
  alt?: string
  size?: 'md' | 'compact' | 'row'
}) {
  const box =
    size === 'compact'
      ? 'h-8 w-8 rounded-lg'
      : size === 'row'
        ? 'h-14 w-14 rounded-xl'
        : 'h-[4.5rem] w-[4.5rem] rounded-2xl'
  const compact = size === 'compact' || size === 'row'
  const { url, loading } = useTicketPhotoUrl(foto)
  const [broken, setBroken] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [url])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (loading) {
    return (
      <div
        className={`mx-auto shrink-0 animate-pulse bg-slate-100 ${box}`}
        aria-label="Cargando evidencia"
      />
    )
  }

  if (!url || broken) {
    return <EmptyThumb box={box} compact={compact} />
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/thumb relative block shrink-0 overflow-hidden border border-slate-200 bg-slate-100 shadow-sm transition hover:border-verde-sena hover:shadow-md ${box}`}
        aria-label="Ver evidencia"
      >
        <img
          src={url}
          alt={alt}
          className="h-full w-full object-cover transition duration-200 group-hover/thumb:scale-105"
          onError={() => setBroken(true)}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-[#04324D]/45 opacity-0 transition-opacity group-hover/thumb:opacity-100">
          <span className="material-symbols-outlined text-white !text-[20px]">zoom_in</span>
        </span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-6 backdrop-blur-sm"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Evidencia del caso"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Cerrar evidencia"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow"
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
            <img src={url} alt={alt} className="max-h-[85vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  )
}
