import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, logout as logoutService } from '@/features/auth'
import { useNotificaciones } from '@/features/notifications'
import { getRoleHome } from '@/app/router/roleHome'
import { resolveUserPhotoUrl, userInitials } from '@/shared/media/user-photo'

export default function NavApp(): ReactNode {
  const { user, setUser, setIsAuthenticated, isAuthenticated } = useAuth()
  const { notificaciones, noLeidas, marcarLeida, marcarTodas } = useNotificaciones(isAuthenticated)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setShowNotifications(false)
    setShowProfileMenu(false)
  }, [location])

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutService()
      setUser(null)
      setIsAuthenticated(false)
      navigate('/loginMain')
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al cerrar sesión', error)
      }
    }
  }

  const getRoleBadgeStyles = (rol: string | undefined): string => {
    const r = rol?.toUpperCase()
    if (r === 'LÍDER' || r === 'LIDER' || r === 'ADMINISTRADOR') return 'bg-[#F5F3FF] text-[#5B21B6]'
    if (r === 'TÉCNICO' || r === 'TECNICO') return 'bg-[#EFF6FF] text-[#1D4ED8]'
    return 'bg-[#F0FDF4] text-[#166534]'
  }

  const getInitials = (name: string | undefined): string => {
    return userInitials(name)
  }

  const formatRelativeTime = (dateString: string | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'hace un momento'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    return date.toLocaleDateString()
  }

  const fotoUrl = resolveUserPhotoUrl(user?.foto)

  return (
    <header className="w-full bg-white border-b hairline-border border-slate-200 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-8 h-20 max-w-[1800px] mx-auto">
        <Link
          to={getRoleHome(user?.rol)}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity group"
        >
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-container/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined !text-[24px]">bolt</span>
          </div>
          <span className="text-xl font-black text-primary-container tracking-tight">AyudaTIC</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-1 relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`group w-10 h-10 rounded-full transition-all flex items-center justify-center relative ${showNotifications ? 'bg-primary-container text-white shadow-md' : 'text-on-surface-variant hover:bg-primary-container/5'}`}
            >
              <span className="material-symbols-outlined !text-[22px] transition-all group-hover:font-variation-['FILL'_1]">
                notifications
              </span>
              {noLeidas > 0 && (
                <span className="absolute top-2.5 right-2.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[8px] font-black rounded-full ring-2 ring-white flex items-center justify-center">
                  {noLeidas}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[12px] shadow-[0_8px_24px_rgba(27,42,74,0.12)] border border-[#E8ECF2] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                <div className="p-4 border-b border-[#E8ECF2] flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-[13px] font-bold text-[#1B2A4A] tracking-tight">Notificaciones</h4>
                  {noLeidas > 0 && (
                    <button
                      onClick={() => void marcarTodas()}
                      className="text-[10px] font-bold text-primary-container uppercase tracking-wider hover:underline"
                    >
                      Leer todas
                    </button>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {notificaciones.length > 0 ? (
                    notificaciones.map(notif => (
                      <div
                        key={notif._id}
                        onClick={() => void marcarLeida(notif._id)}
                        className="p-4 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-colors group/notif"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary-container mt-1.5 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-[13px] font-medium text-[#1B2A4A] leading-snug mb-1">
                              {notif.mensaje}
                            </p>
                            <span className="text-[10px] font-bold text-[#A0AABF] uppercase tracking-wide">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-12 px-6">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                        <span className="material-symbols-outlined !text-[28px] font-variation-['wght'_300]">
                          notifications_off
                        </span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#A0AABF] text-center">
                        Sin notificaciones nuevas
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl transition-all cursor-pointer group ml-2 ${showProfileMenu ? 'bg-slate-100 shadow-inner' : 'hover:bg-slate-50'}`}
            >
              <div className="flex flex-col items-end hidden sm:flex text-right">
                <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary-container transition-colors line-clamp-1">
                  {user?.nombre || 'Usuario'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-40 leading-tight">
                  {user?.rol || 'Funcionario'}
                </span>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 ring-transparent group-hover:ring-primary-container/10 transition-all bg-[#EEF0F5] overflow-hidden">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[#1B2A4A]">{getInitials(user?.nombre)}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-verde-sena border-2 border-white rounded-full shadow-sm" />
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 min-w-[220px] bg-white rounded-[12px] shadow-[0_8px_24px_rgba(27,42,74,0.12)] border border-[#E8ECF2] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 z-[60]">
                <div className="p-4 border-b border-[#E8ECF2] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EEF0F5] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#1B2A4A]">{getInitials(user?.nombre)}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-semibold text-[#1B2A4A] leading-tight truncate">
                      {user?.nombre || 'Usuario'}
                    </span>
                    <span className="text-[12px] text-[#A0AABF] leading-tight truncate mt-0.5">
                      {user?.correo || 'correo@ejemplo.com'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-2 w-fit ${getRoleBadgeStyles(user?.rol)}`}
                    >
                      {user?.rol || 'Funcionario'}
                    </span>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => navigate('/perfil')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[8px] hover:bg-[#F8FAFC] transition-all duration-120 group/item"
                  >
                    <span className="material-symbols-outlined !text-[18px] text-[#6B7A99] group-hover/item:text-[#1B2A4A]">
                      person
                    </span>
                    <span className="text-[14px] font-medium text-[#1B2A4A]">Mi Perfil</span>
                  </button>
                </div>

                <div className="p-2 border-t border-[#E8ECF2]">
                  <button
                    onClick={() => void handleLogout()}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[8px] hover:bg-[#F8FAFC] transition-all duration-120 group/item"
                  >
                    <span className="material-symbols-outlined !text-[18px] text-[#6B7A99] group-hover/item:text-[#DC2626]">
                      logout
                    </span>
                    <span className="text-[14px] font-medium text-[#1B2A4A] group-hover/item:text-[#DC2626]">
                      Cerrar sesión
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
