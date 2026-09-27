import type { ReactNode } from 'react'
import AppShell from '@/shared/ui/AppShell'
import { useAuth } from '@/features/auth'
import { resolveUserPhotoUrl, userInitials } from '@/shared/media/user-photo'

export default function Perfil(): ReactNode {
  const { user } = useAuth()

  const getRoleBadgeStyles = (rol: string | undefined): string => {
    const r = rol?.toUpperCase()
    if (r === 'LÍDER' || r === 'LIDER' || r === 'ADMINISTRADOR') return 'bg-[#E8EEF2] text-azul-sena border border-[#cbd5e1]'
    if (r === 'TÉCNICO' || r === 'TECNICO') return 'bg-[#E8F5E0] text-[#166534] border border-[#bbf7d0]'
    return 'bg-[#E8F5E0] text-[#166534] border border-[#bbf7d0]'
  }

  const getInitials = (name: string | undefined): string => {
    return userInitials(name)
  }

  const fotoUrl = resolveUserPhotoUrl(user?.foto)

  return (
    <AppShell subtitleContext="Mi Perfil">
      <main className="p-4 sm:p-8 animate-in fade-in duration-300 flex justify-center">
        <div className="w-full max-w-[520px]">
          <div className="premium-card rounded-3xl p-8 sm:p-10 shadow-xl bg-white flex flex-col items-center">
            {/* Header section with avatar */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-[#E8EEF2] flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                {fotoUrl ? (
                  <img src={fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-azul-sena">{getInitials(user?.nombre)}</span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-verde-sena border-4 border-white rounded-full shadow-sm" />
            </div>

            <div className="text-center w-full">
              <h1 className="text-2xl font-black text-azul-sena tracking-tight mb-1">
                {user?.nombre || 'Usuario'}
              </h1>
              <p className="text-sm font-medium text-slate-500 mb-4">
                {user?.correo || 'correo@ejemplo.com'}
              </p>

              <div className="flex justify-center mb-8">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-sm ${getRoleBadgeStyles(
                    user?.rol,
                  )}`}
                >
                  {user?.rol || 'Funcionario'}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-4 w-full text-left">
                <div className="p-5 rounded-2xl bg-slate-50/60 border hairline-border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-white border hairline-border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-azul-sena transition-colors">
                    <span className="material-symbols-outlined !text-[20px]">badge</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Identificación
                    </p>
                    <p className="text-sm font-bold text-slate-800">{user?._id || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/60 border hairline-border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-white border hairline-border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-azul-sena transition-colors">
                    <span className="material-symbols-outlined !text-[20px]">alternate_email</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Estado de cuenta
                    </p>
                    <p className="text-sm font-bold text-slate-800">Activo y Verificado</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-[11px] text-slate-400 font-bold uppercase tracking-[0.14em] text-center">
                MIAYUDATICS · CTPI
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
