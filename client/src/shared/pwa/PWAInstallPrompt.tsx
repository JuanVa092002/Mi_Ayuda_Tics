import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOS)
    console.log('[PWA] User Agent:', navigator.userAgent, '| isIOS:', isIOS)

    // Detectar si ya está instalada
    const nav = navigator as NavigatorWithStandalone
    if (nav.standalone === true) {
      setIsInstalled(true)
      console.log('[PWA] App already installed (standalone mode)')
    }

    // Capturar beforeinstallprompt (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      console.log('✓ [PWA] Install prompt available (Android)')
    }

    const handleAppInstalled = () => {
      console.log('[PWA] App installed!')
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Debug: Log if beforeinstallprompt will NOT fire
    const timer = setTimeout(() => {
      if (!installPrompt) {
        console.warn('[PWA] beforeinstallprompt did not fire after 2s - check manifest & SW')
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      console.log(`User chose: ${outcome}`)
      setInstallPrompt(null)
    } catch (error) {
      console.error('Install prompt failed:', error)
    }
  }

  return {
    canInstall: installPrompt !== null,
    isInstalled,
    isIOS,
    triggerInstall,
  }
}

export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, isIOS, triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  
  // Detectar si es mobile (cualquier dispositivo no-desktop)
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Show if:
  // 1. Not already installed AND
  // 2. Not dismissed AND
  // 3. Either (canInstall in desktop) OR (isMobile - always show instructions)
  if (isInstalled || dismissed) {
    return null
  }

  // Desktop sin install disponible: no mostrar nada
  if (!canInstall && !isMobile && !isIOS) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-verde-sena to-verde-sena/90 text-white rounded-2xl p-4 shadow-lg border border-verde-sena/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Instala MiAyudaTIC en tu dispositivo</h3>
            <p className="text-xs opacity-90 mb-3">
              {isIOS
                ? 'Abre en Safari y toca Compartir → Añadir a pantalla de inicio'
                : isMobile
                  ? 'Toca el menú → Instalar app'
                  : 'Accede como app nativa con un solo toque'}
            </p>
            <div className="flex gap-2">
              {canInstall && !isIOS && (
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
            className="flex-shrink-0 text-xl hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}