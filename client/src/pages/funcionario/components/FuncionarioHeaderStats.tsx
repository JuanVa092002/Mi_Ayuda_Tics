import type { ReactNode } from 'react'

interface FuncionarioHeaderStatsProps {
  totalSolicitudes: number
  enAtencionCount: number
  esperandoUsuarioCount: number
  resueltasCount: number
  onOpenRadicar: () => void
}

export function FuncionarioHeaderStats({
  totalSolicitudes,
  enAtencionCount,
  esperandoUsuarioCount,
  resueltasCount,
  onOpenRadicar,
}: FuncionarioHeaderStatsProps): ReactNode {
  return (
    <header className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm border-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
              Mis Solicitudes de Soporte TIC
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Centro de Acompañamiento, Seguimiento y Certeza Operativa · Sede Central CTPI
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Métricas del Funcionario: Grid en móviles, flex en tablets/desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-200/80 transition-all shadow-2xs hover:shadow-xs">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">inbox</span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Radicadas</p>
                <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">{totalSolicitudes}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-blue-50/60 hover:bg-blue-50 px-3 py-2 sm:px-4 sm:py-2.5 border border-blue-200/80 transition-all shadow-2xs hover:shadow-xs">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-100/80 flex items-center justify-center text-azul-sena shrink-0">
                <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">handyman</span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-azul-sena uppercase tracking-wider truncate">En Atención</p>
                <p className="text-sm sm:text-base font-black text-slate-900 leading-none mt-0.5">{enAtencionCount}</p>
              </div>
            </div>

            {esperandoUsuarioCount > 0 ? (
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-amber-50 hover:bg-amber-100/70 px-3 py-2 sm:px-4 sm:py-2.5 border border-amber-300 transition-all shadow-2xs hover:shadow-xs animate-pulse">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">contact_support</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">Requieren Respuesta</p>
                  <p className="text-sm sm:text-base font-black text-amber-950 leading-none mt-0.5">{esperandoUsuarioCount}</p>
                </div>
              </div>
            ) : (
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/60 px-3 py-2 sm:px-4 sm:py-2.5 border border-emerald-200 transition-all shadow-2xs hover:shadow-xs">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-800 shrink-0">
                  <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">verified</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider truncate">Solucionadas</p>
                  <p className="text-sm sm:text-base font-black text-emerald-950 leading-none mt-0.5">{resueltasCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Botón Principal para Radicar: full width en mobile, auto en desktop */}
          <button
            type="button"
            onClick={onOpenRadicar}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-verde-sena to-[#2e8800] hover:from-[#329600] hover:to-[#277400] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer select-none"
          >
            <span className="flex h-6 w-6 rounded-lg bg-white/20 items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-90">
              <span className="material-symbols-outlined !text-[16px] text-white">add</span>
            </span>
            <span className="tracking-tight">Radicar solicitud</span>
          </button>
        </div>
      </div>
    </header>
  )
}
