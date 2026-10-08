import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useIsPWA } from '@/features/auth/phone/usePhoneLayout'
import { Loaders } from '@/shared/ui'
import type { UserRole } from '@/shared/types'

/**
 * Componente que decide si mostrar layout móvil o Desktop según el rol del usuario.
 * 
 * Lógica:
 * - Líder TIC → SIEMPRE Desktop
 * - Funcionario/Técnico en PWA instalada → Móvil
 * - Funcionario/Técnico en navegador → Puede elegir (default: móvil si pantalla < 768px)
 */
export function RoleBasedLayout({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, loading, user } = useAuth()
  const isPWA = useIsPWA()

  const isMobileLayout = useMemo(() => {
    if (loading || !user) return false // En auth, se decide en las rutas públicas
    
    const role = user.rol.toLowerCase() as UserRole
    
    // Líder TIC siempre ve Desktop
    if (role === 'lider') {
      return false
    }
    
    // Funcionario/Técnico en PWA instalada → móvil forzado
    if (isPWA && (role === 'funcionario' || role === 'tecnico')) {
      return true
    }
    
    // En navegador: detectar por ancho de pantalla
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 767px)').matches
    }
    
    return false
  }, [user, loading, isPWA])

  // Mostrar loader mientras verifica auth
  if (loading) return <Loaders />

  // Redirigir a login si no autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/loginMain" replace state={{ from: location }} />
  }

  // Si es móvil, redirect a rutas de móvil
  if (isMobileLayout) {
    const currentPath = location.pathname
    // Ya está en ruta móvil, dejar pasar
    if (currentPath.startsWith('/funcionario') || currentPath.startsWith('/tecnico')) {
      return <Outlet />
    }
    
    // Redirigir a la ruta móvil correspondiente
    const role = user.rol.toLowerCase() as UserRole
    if (role === 'funcionario') {
      return <Navigate to="/funcionario" replace />
    }
    if (role === 'tecnico') {
      return <Navigate to="/tecnico" replace />
    }
    // Líder no debería llegar aquí, pero por seguridad:
    return <Navigate to="/lider" replace />
  }

  // Desktop layout
  if (children) return <>{children}</>
  return <Outlet />
}

/**
 * Componente para rutas públicas que decide layout móvil/Desktop en auth
 */
export function AuthLayoutWrapper({ children }: { children?: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  const isPWA = useIsPWA()
  
  // Ya autenticado: redirigir según rol
  if (isAuthenticated && user && !loading) {
    const role = user.rol.toLowerCase() as UserRole
    
    // Si es líder, siempre Desktop
    if (role === 'lider') {
      return <Navigate to="/lider" replace />
    }
    
    // Funcionario/Técnico en PWA → ruta móvil
    if (isPWA) {
      const targetPath = role === 'tecnico' ? '/tecnico' : '/funcionario'
      return <Navigate to={targetPath} replace />
    }
    
    // En navegador, decidir por pantalla
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      const targetPath = role === 'tecnico' ? '/tecnico' : '/funcionario'
      return <Navigate to={targetPath} replace />
    }
    
    // Desktop - función helper para obtener ruta por defecto según rol
    const getDefaultPath = (r: UserRole): string => {
      if (r === 'lider') return '/lider'
      if (r === 'tecnico') return '/tecnico'
      return '/funcionario'
    }
    
    return <Navigate to={getDefaultPath(role)} replace />
  }

  // No autenticado: mostrar las páginas de auth (que ya deciden por device)
  if (children) return <>{children}</>
  return <Outlet />
}