import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const IS_MOBILE = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

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

// Solo aplica en mobile — en desktop el nudge está integrado en /loginMain
export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!IS_MOBILE || isInstalled || dismissed) return null

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
                onClick={() => setDismissed(true)}
                className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-xl leading-none hover:opacity-80 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
