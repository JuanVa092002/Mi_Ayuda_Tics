import type { ReactNode } from 'react'
import AppLayout from '@/app/layouts/AppLayout'
import AdminLayout from '@/app/layouts/AdminLayout'
import { useAuth } from '@/features/auth'
import { resolveUserPhotoUrl, userInitials } from '@/shared/media/user-photo'

export default function Perfil(): ReactNode {
  const { user } = useAuth()

  const getRoleBadgeStyles = (rol: string | undefined): string => {
    const r = rol?.toUpperCase()
    if (r === 'LÍDER' || r === 'LIDER' || r === 'ADMINISTRADOR') return 'bg-[#F5F3FF] text-[#5B21B6]'
    if (r === 'TÉCNICO' || r === 'TECNICO') return 'bg-[#EFF6FF] text-[#1D4ED8]'
    return 'bg-[#F0FDF4] text-[#166534]'
  }

  const getInitials = (name: string | undefined): string => {
    return userInitials(name)
  }

  // Determine which layout to wrap with based on role
  const isLider = user?.rol?.toLowerCase() === 'administrador' || user?.rol?.toLowerCase() === 'lider' || user?.rol?.toLowerCase() === 'líder'

  const Content = (
    <main className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex justify-center">
      <div className="w-full max-w-[480px]">
        <div className="premium-card rounded-3xl p-8 sm:p-10 shadow-xl bg-white flex flex-col items-center">
          
          {/* Header section with avatar */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-[#EEF0F5] flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              {resolveUserPhotoUrl(user?.foto) ? (
                <img src={resolveUserPhotoUrl(user?.foto)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-[#1B2A4A]">{getInitials(user?.nombre)}</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-verde-sena border-4 border-white rounded-full shadow-sm"></div>
          </div>

          <div className="text-center w-full">
            <h1 className="text-2xl font-black text-[#1B2A4A] tracking-tight mb-1">{user?.nombre || 'Usuario'}</h1>
            <p className="text-sm font-medium text-[#6B7A99] mb-4">{user?.correo || 'correo@ejemplo.com'}</p>
            
            <div className="flex justify-center mb-10">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-sm ${getRoleBadgeStyles(user?.rol)}`}>
                {user?.rol || 'Funcionario'}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-4 w-full text-left">
              <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-md group">
                <div className="w-10 h-10 rounded-xl bg-white border hairline-border border-slate-200 flex items-center justify-center text-[#6B7A99] group-hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">badge</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0AABF] uppercase tracking-widest mb-0.5">Identificación</p>
                  <p className="text-sm font-bold text-[#1B2A4A]">{user?._id || 'N/A'}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-md group">
                <div className="w-10 h-10 rounded-xl bg-white border hairline-border border-slate-200 flex items-center justify-center text-[#6B7A99] group-hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">alternate_email</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0AABF] uppercase tracking-widest mb-0.5">Estado de cuenta</p>
                  <p className="text-sm font-bold text-[#1B2A4A]">Activo y Verificado</p>
                </div>
              </div>
            </div>

            <p className="mt-10 text-[11px] text-[#A0AABF] font-bold uppercase tracking-[0.1em] text-center">
              Información corporativa AyudaTIC © 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  )

  return (
    <AppLayout>
      {isLider ? (
        <AdminLayout>{Content}</AdminLayout>
      ) : (
        Content
      )}
    </AppLayout>
  )
}
