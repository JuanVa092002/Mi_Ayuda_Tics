import { useState } from 'react'
import {
  useExperience,
  FUNCIONARIO_VARIANTS,
  TECNICO_VARIANTS,
  type FuncionarioVariant,
  type TecnicoVariant,
} from './ExperienceContext'

export default function ExperienceLabSelector() {
  const {
    activeRole,
    funcionarioVariant,
    tecnicoVariant,
    setFuncionarioVariant,
    setTecnicoVariant,
    resetToBaseline,
    currentVariantInfo,
  } = useExperience()

  const [openDetails, setOpenDetails] = useState(false)

  const isFuncionario = activeRole === 'funcionario'
  const isTecnico = activeRole === 'tecnico'
  const isLider = activeRole === 'lider'

  const roleLabel = isFuncionario ? 'Funcionario' : isTecnico ? 'Técnico' : 'Líder TIC'

  return (
    <div className="border-b border-slate-200 bg-slate-900 text-white px-3 py-1.5 shadow-sm text-xs font-sans transition-all z-30">
      <div className="mx-auto max-w-[1520px] flex flex-wrap items-center justify-between gap-2">
        {/* Etiqueta y rol activo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black tracking-wider uppercase text-[10px] border border-emerald-500/30">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Product Lab v2
          </div>
          <span className="hidden sm:inline text-slate-400 font-medium">Rol:</span>
          <span className="font-bold text-white tracking-tight">{roleLabel}</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-emerald-400 font-black">{currentVariantInfo.code}</span>
          <span className="text-slate-300 font-bold hidden md:inline">{currentVariantInfo.name.split('—')[1] || currentVariantInfo.name}</span>
          <button
            type="button"
            onClick={() => setOpenDetails(!openDetails)}
            className="text-[11px] text-slate-400 hover:text-white underline ml-1 cursor-pointer"
          >
            {openDetails ? 'Ocultar norte' : 'Ver norte'}
          </button>
        </div>

        {/* Botonera de variantes específicas por rol */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 overflow-x-auto">
            {isFuncionario &&
              (Object.keys(FUNCIONARIO_VARIANTS) as FuncionarioVariant[]).map((vKey) => {
                const info = FUNCIONARIO_VARIANTS[vKey]
                const active = funcionarioVariant === vKey
                return (
                  <button
                    key={vKey}
                    type="button"
                    onClick={() => setFuncionarioVariant(vKey)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs ring-1 ring-white/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title={`${info.name}: ${info.thesis}`}
                  >
                    {info.shortLabel}
                  </button>
                )
              })}

            {isTecnico &&
              (Object.keys(TECNICO_VARIANTS) as TecnicoVariant[]).map((vKey) => {
                const info = TECNICO_VARIANTS[vKey]
                const active = tecnicoVariant === vKey
                return (
                  <button
                    key={vKey}
                    type="button"
                    onClick={() => setTecnicoVariant(vKey)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-white/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title={`${info.name}: ${info.thesis}`}
                  >
                    {info.shortLabel}
                  </button>
                )
              })}

            {isLider ? (
              <span className="px-2.5 py-1 text-[11px] font-bold text-white whitespace-nowrap">
                Cola de nuevos
              </span>
            ) : null}
          </div>

          {/* Botón Volver a Baseline */}
          <button
            type="button"
            onClick={resetToBaseline}
            className="text-[11px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Restablecer al Baseline V1 Journey del rol"
          >
            Reset V1
          </button>
        </div>
      </div>

      {/* Panel expandible de hipótesis y norte de producto */}
      {openDetails ? (
        <div className="mx-auto max-w-[1520px] mt-2 pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-[11px]">
          <div>
            <span className="font-bold text-slate-200">Norte de Producto: </span>
            {currentVariantInfo.norte}
          </div>
          <div>
            <span className="font-bold text-slate-200">Tesis: </span>
            {currentVariantInfo.thesis}
          </div>
          <div>
            <span className="font-bold text-slate-200">CTA Principal: </span>
            <span className="font-mono text-emerald-400 font-bold">{currentVariantInfo.cta}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
