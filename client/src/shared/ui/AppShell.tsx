import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, logout as logoutService } from '@/features/auth'
import { useNotificaciones } from '@/features/notifications'
import { resolveUserPhotoUrl, userInitials } from '@/shared/media/user-photo'
import BrandWordmark from '@/shared/ui/BrandWordmark'
import RoleNavigation from '@/shared/ui/RoleNavigation'

export interface AppShellProps {
  children: ReactNode
  subtitleContext?: string
}

function formatRoleLabel(role: string | undefined): { title: string; subtitle: string; homeLink: string } {
  const r = (role || '').toLowerCase()
  if (r === 'lider' || r === 'líder' || r === 'administrador') {
    return { title: 'Líder TIC', subtitle: 'CTPI · Líder TIC', homeLink: '/adminSolicitud' }
  }
  if (r === 'tecnico' || r === 'técnico') {
    return { title: 'Técnico', subtitle: 'CTPI · Técnico', homeLink: '/casos-por-resolver' }
  }
  return { title: 'Funcionario', subtitle: 'CTPI · Funcionario', homeLink: '/funcionario' }
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

export default function AppShell({ children, subtitleContext = 'Mesa de servicios' }: AppShellProps): ReactNode {
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

  const roleInfo = formatRoleLabel(user?.rol)
  const firstName = (user?.nombre || roleInfo.title).split(' ')[0]

  useEffect(() => {
    setMobileOpen(false)
    setShowNotifications(false)
    setShowProfileMenu(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setShowNotifications(false)
        setShowProfileMenu(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
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
        <Link to={roleInfo.homeLink} className="min-w-0">
          <BrandWordmark
            size={collapsed ? 'sm' : 'md'}
            stacked={collapsed}
            subtitle={collapsed ? undefined : roleInfo.subtitle}
          />
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
        <RoleNavigation
          role={user?.rol}
          collapsed={collapsed}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className={`border-t border-slate-100 p-3 ${collapsed ? 'px-2' : ''}`}>
        <Link
          to="/perfil"
          className={`flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Ver mi perfil"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#E8EEF2]">
            {fotoUrl ? (
              <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-azul-sena">
                {userInitials(user?.nombre)}
              </span>
            )}
          </div>
          {collapsed ? null : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-azul-sena">{user?.nombre || roleInfo.title}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-verde-sena">{roleInfo.title}</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#eef2f4] text-slate-800">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-[#dbe4e8] bg-white lg:block transition-all duration-200 ${
          collapsed ? 'w-[88px]' : 'w-[272px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#04324D]/40 backdrop-blur-sm transition-opacity"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-[81] h-full w-[272px] bg-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-[#dbe4e8] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-azul-sena hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-verde-sena">{subtitleContext}</p>
              <h1 className="truncate text-xl font-black text-azul-sena sm:text-2xl">Hola, {firstName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications Popover */}
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
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-verde-sena px-1 text-[9px] font-black text-white">
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
                        className="text-[11px] font-bold text-verde-sena hover:underline"
                      >
                        Marcar todas leídas
                      </button>
                    ) : null}
                  </div>
                  <div className="max-h-72 overflow-y-auto hairline-scrollbar">
                    {notificaciones.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No tienes notificaciones</div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.leida) void marcarLeida(n._id)
                          }}
                          className={`flex cursor-pointer items-start gap-3 border-b border-slate-50 p-3.5 transition-colors hover:bg-slate-50 ${
                            !n.leida ? 'bg-[#E8F5E0]/30' : ''
                          }`}
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8EEF2] text-azul-sena">
                            <span className="material-symbols-outlined !text-[16px]">info</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-700">{n.mensaje}</p>
                            <span className="mt-1 block text-[10px] text-slate-400">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          {!n.leida ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-verde-sena" /> : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Profile Popover */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((value) => !value)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-50"
                aria-label="Menú de usuario"
              >
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#E8EEF2] text-xs font-bold text-azul-sena ring-2 ring-transparent transition-all hover:ring-azul-sena/20">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    userInitials(user?.nombre)
                  )}
                </div>
              </button>

              {showProfileMenu ? (
                <div className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_12px_32px_rgba(4,50,77,0.12)]">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-xs font-bold text-azul-sena">{user?.nombre || roleInfo.title}</p>
                    <p className="truncate text-[11px] text-slate-400">{user?.correo || ''}</p>
                    <span className="mt-1 inline-block rounded-full bg-[#E8F5E0] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-verde-sena">
                      {roleInfo.title}
                    </span>
                  </div>
                  <Link
                    to="/perfil"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-[#E8EEF2] hover:text-azul-sena"
                  >
                    <span className="material-symbols-outlined !text-[18px]">person</span>
                    Mi perfil
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined !text-[18px]">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Content Container with Natural Scroll Flow */}
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
