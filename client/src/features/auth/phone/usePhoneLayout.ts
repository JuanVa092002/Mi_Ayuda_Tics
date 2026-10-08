import { useEffect, useState } from 'react'
import type { UserRole } from '@/shared/types'

/**
 * Detecta si debe mostrarse el layout móvil/PWA.
 * 
 * Lógica de negocio:
 * - Líder TIC → SIEMPRE Desktop (más espacio para dashboards)
 * - Funcionario/Técnico en móvil (< 768px) → PWA móvil
 * - Funcionario/Técnico en Desktop → puede usar Desktop también
 * - En páginas de auth (sin usuario): detectar por dispositivo + modo PWA
 * 
 * También detecta si la app está instalada como PWA (standalone mode)
 */
const QUERY = '(max-width: 767px)'

/**
 * Hook principal para determinar layout móvil/Desktop
 * @param userRole - Rol del usuario (null si no está autenticado)
 */
export function usePhoneLayout(userRole?: UserRole | null): boolean {
  const [phone, setPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar si es PWA instalada
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const media = window.matchMedia(QUERY)
    const sync = () => setPhone(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  // Si es Líder TIC, siempre mostrar Desktop (más espacio para gestión)
  if (userRole === 'lider') {
    return false
  }

  // Si es Funcionario o Técnico Y está en modo PWA instalado, forzar móvil
  if (isStandalone && (userRole === 'funcionario' || userRole === 'tecnico')) {
    return true
  }

  // Default: detectar por ancho de pantalla
  return phone
}

/**
 * Hook para verificar si la app está运行 como PWA instalada
 */
export function useIsPWA(): boolean {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const media = window.matchMedia('(display-mode: standalone)')
    const sync = () => setIsStandalone(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return isStandalone
}

/**
 * Hook específico para páginas de autenticación (login, register, forgot password)
 * En estas páginas no hay usuario logueado, así que usamos detección por dispositivo/PWA
 */
export function useAuthPhoneLayout(): boolean {
  const [phone, setPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    const media = window.matchMedia(QUERY)
    const sync = () => setPhone(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  // Si está instalado como PWA, mostrar layout móvil
  if (isStandalone) {
    return true
  }

  // Default: detectar por ancho de pantalla
  return phone
}
