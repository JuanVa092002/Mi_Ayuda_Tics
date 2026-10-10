import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const IS_MOBILE = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const DESKTOP_NUDGE_KEY = 'pwa-desktop-nudge-dismissed-v1'

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const nav = navigator as NavigatorWithStandalone
    if (nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) return
    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setInstallPrompt(null)
    } catch { /* ignore */ }
  }

  return { canInstall: installPrompt !== null, isInstalled, triggerInstall }
}

// ─── Role content map ───────────────────────────────────────────────────────

const ROLE_CONTENT = {
  funcionario: {
    emoji: '📋',
    headline: 'Reportá solicitudes al instante',
    sub: 'Un problema en el ambiente no espera. Con MiAyudaTic en tu celular, radicás una solicitud en segundos desde donde estés.',
    benefits: [
      { icon: '⚡', text: 'Solicitud radicada en menos de 30 segundos' },
      { icon: '📍', text: 'Desde cualquier ambiente, sin ir al escritorio' },
      { icon: '🔔', text: 'Seguí el estado de tu caso en tiempo real' },
    ],
    cta: 'Instalar en mi celular',
  },
  tecnico: {
    emoji: '🛠️',
    headline: 'Tu tablero de casos, donde estés',
    sub: 'Los casos no esperan en el escritorio. MiAyudaTic mobile te lleva las asignaciones al campo y te deja cerrar casos sin volver al centro.',
    benefits: [
      { icon: '🔔', text: 'Recibís asignaciones al instante en campo' },
      { icon: '✅', text: 'Cerrás y documentás casos desde el lugar' },
      { icon: '📱', text: 'Sin ir al centro: todo desde el celular' },
    ],
    cta: 'Instalar ahora',
  },
} as const

type TargetRole = keyof typeof ROLE_CONTENT

// ─── Mobile install prompt (unchanged) ──────────────────────────────────────

function MobileInstallBanner({
  canInstall,
  triggerInstall,
  onDismiss,
}: {
  canInstall: boolean
  triggerInstall: () => void
  onDismiss: () => void
}) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-verde-sena to-verde-sena/90 text-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Instalar MiAyudaTic en tu dispositivo</h3>
            <p className="text-xs opacity-90 mb-3">
              {IS_IOS
                ? 'En Safari: tocá Compartir → Añadir a pantalla de inicio'
                : canInstall
                  ? 'Accedé como app nativa con un solo toque'
                  : 'En Chrome: menú (⋮) → Añadir a pantalla de inicio'}
            </p>
            <div className="flex gap-2">
              {canInstall && (
                <button
                  onClick={triggerInstall}
                  className="bg-white text-verde-sena text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-50 transition"
                >
                  Instalar
                </button>
              )}
              <button
                onClick={onDismiss}
                className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button onClick={onDismiss} className="flex-shrink-0 text-xl leading-none hover:opacity-80 transition" aria-label="Cerrar">✕</button>
        </div>
      </div>
    </div>
  )
}

// ─── Desktop nudge for field roles ──────────────────────────────────────────

function DesktopFieldNudge({
  role,
  onDismiss,
}: {
  role: TargetRole
  onDismiss: () => void
}) {
  const content = ROLE_CONTENT[role]

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-azul-sena px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{content.emoji}</span>
            <span className="text-white font-bold text-sm">{content.headline}</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white text-lg leading-none transition ml-2"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="bg-white px-4 py-3">
          <p className="text-gray-600 text-xs leading-relaxed mb-3">{content.sub}</p>

          {/* Benefits */}
          <ul className="space-y-1.5 mb-4">
            {content.benefits.map((b) => (
              <li key={b.text} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-base leading-none mt-px">{b.icon}</span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3 border border-gray-100">
            <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wide">Cómo instalarlo</p>
            <p className="text-xs text-gray-600">
              Abrí <span className="font-semibold text-azul-sena">miayudatics.web.app</span> en Chrome desde tu celular
              → menú <span className="font-mono text-gray-800">⋮</span> → <em>Añadir a pantalla de inicio</em>
            </p>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2">
            <a
              href="https://miayudatics.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-verde-sena text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-verde-sena/90 transition text-center"
            >
              {content.cta} →
            </a>
            <button
              onClick={onDismiss}
              className="text-gray-400 text-xs px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              No mostrar más
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt()
  const { user } = useAuth()

  const [mobileDismissed, setMobileDismissed] = useState(false)
  const [desktopDismissed, setDesktopDismissed] = useState(() => {
    try { return localStorage.getItem(DESKTOP_NUDGE_KEY) === 'true' } catch { return false }
  })

  const handleDesktopDismiss = () => {
    try { localStorage.setItem(DESKTOP_NUDGE_KEY, 'true') } catch { /* ignore */ }
    setDesktopDismissed(true)
  }

  // Already installed → nothing
  if (isInstalled) return null

  // ── MOBILE: keep existing install prompt ──
  if (IS_MOBILE) {
    if (mobileDismissed) return null
    return (
      <MobileInstallBanner
        canInstall={canInstall}
        triggerInstall={triggerInstall}
        onDismiss={() => setMobileDismissed(true)}
      />
    )
  }

  // ── DESKTOP: field-role nudge only ──
  const role = user?.rol as TargetRole | undefined
  const isFieldRole = role === 'funcionario' || role === 'tecnico'

  if (!isFieldRole || desktopDismissed) return null

  return <DesktopFieldNudge role={role} onDismiss={handleDesktopDismiss} />
}
