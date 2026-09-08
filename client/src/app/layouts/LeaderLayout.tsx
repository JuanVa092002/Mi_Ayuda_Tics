import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, logout as logoutService } from '@/features/auth'
import { useNotificaciones } from '@/features/notifications'
import { resolveUserPhotoUrl, userInitials } from '@/shared/media/user-photo'
import BrandWordmark from '@/shared/ui/BrandWordmark'
import LeaderNav from '@/features/users/components/LeaderNav'

interface LeaderLayoutProps {
  children: ReactNode
}

function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffInSeconds < 60) return 'hace un momento'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  return date.toLocaleDateString()
}

export default function LeaderLayout({ children }: LeaderLayoutProps): ReactNode {
  const { user, setUser, setIsAuthenticated, isAuthenticated } = useAuth()
  const { notificaciones, noLeidas, marcarLeida, marcarTodas } = useNotificaciones(isAuthenticated)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const fotoUrl = resolveUserPhotoUrl(user?.foto)
  const firstName = (user?.nombre ?? 'Líder').split(' ')[0]

  useEffect(() => {
    setMobileOpen(false)
    setShowNotifications(false)
    setShowProfileMenu(false)
  }, [location])

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

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-6' : 'justify-between px-5 py-6'}`}>
        <Link to="/adminSolicitud" className="min-w-0">
          <BrandWordmark size={collapsed ? 'sm' : 'md'} stacked={collapsed} subtitle={collapsed ? undefined : 'CTPI · Líder TIC'} />
        </Link>
        <button
          type="button"
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:flex"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="material-symbols-outlined !text-[18px]">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hairline-scrollbar pb-4">
        <LeaderNav collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className={`border-t border-slate-100 p-3 ${collapsed ? 'px-2' : ''}`}>
        <Link
          to="/perfil"
          className={`flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#E8EEF2]">
            {fotoUrl ? (
              <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-azul-sena">
                {userInitials(user?.nombre)}
              </span>
            )}
          </div>
          {collapsed ? null : (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-azul-sena">{user?.nombre || 'Líder TIC'}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-verde-sena">Líder TIC</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F4F7F8]">
      <aside
        className={`hidden shrink-0 border-r border-slate-100 bg-white lg:block ${
          collapsed ? 'w-[88px]' : 'w-[272px]'
        }`}
      >
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#04324D]/40"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-[81] h-full w-[272px] bg-white shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-azul-sena lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-verde-sena">Mesa de servicios</p>
              <h1 className="truncate text-xl font-black text-azul-sena sm:text-2xl">Hola, {firstName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((value) => !value)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  showNotifications ? 'bg-azul-sena text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
                aria-label="Notificaciones"
              >
                <span className="material-symbols-outlined !text-[22px]">notifications</span>
                {noLeidas > 0 ? (
                  <span className="absolute right-1.5 top-1.5 min-h-[14px] min-w-[14px] rounded-full bg-verde-sena px-1 text-[8px] font-black text-white">
                    {noLeidas}
                  </span>
                ) : null}
              </button>
              {showNotifications ? (
                <div className="absolute right-0 top-full z-[60] mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_32px_rgba(4,50,77,0.12)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <h4 className="text-[13px] font-bold text-azul-sena">Notificaciones</h4>
                    {noLeidas > 0 ? (
                      <button
                        type="button"
                        onClick={() => void marcarTodas()}
                        className="text-[10px] font-bold uppercase tracking-wider text-verde-sena"
                      >
                        Leer todas
                      </button>
                    ) : null}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notificaciones.length > 0 ? (
                      notificaciones.map((notif) => (
                        <button
                          type="button"
                          key={notif._id}
                          onClick={() => void marcarLeida(notif._id)}
                          className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50"
                        >
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-verde-sena" />
                          <span>
                            <span className="block text-[13px] font-medium text-azul-sena">{notif.mensaje}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-10 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Sin notificaciones nuevas
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((value) => !value)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50"
              >
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#E8EEF2]">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-azul-sena">
                      {userInitials(user?.nombre)}
                    </span>
                  )}
                </div>
                <span className="material-symbols-outlined hidden text-slate-400 sm:block">expand_more</span>
              </button>
              {showProfileMenu ? (
                <div className="absolute right-0 top-full z-[60] mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_32px_rgba(4,50,77,0.12)]">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-azul-sena">{user?.nombre}</p>
                    <p className="truncate text-xs text-slate-400">{user?.correo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/perfil')}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-azul-sena hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined !text-[18px]">person</span>
                    Mi perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined !text-[18px]">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
