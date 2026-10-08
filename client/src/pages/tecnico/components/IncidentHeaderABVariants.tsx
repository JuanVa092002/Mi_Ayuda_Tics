import type { Solicitud } from '@/shared/types'
import { StatusBadge } from '@/shared/ui'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'

export type HeaderVariantId = 'control' | 'variantA' | 'variantB' | 'variantC' | 'variantD' | 'variantE'

interface IncidentHeaderABVariantsProps {
  solicitud: Solicitud
  copiedCode: boolean
  onCopyCode: () => void
}

function formatHeaderDate(dateStr?: string): string {
  if (!dateStr) return 'Reciente'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function IncidentHeaderABVariants({
  solicitud,
  copiedCode,
  onCopyCode,
}: IncidentHeaderABVariantsProps) {
  const parsed = parseEnrichedDescription(solicitud.descripcion)
  const symptom = detectVisualSymptom(parsed, solicitud.descripcion)
  const codigo = solicitud.codigoCaso || solicitud._id.slice(-6)
  const formattedDate = formatHeaderDate(solicitud.fecha)

  // Desduplicación de ubicación (SENA CTPI)
  const baseAmbiente = solicitud.ambiente?.nombre?.trim() || ''
  const oficina = parsed.oficina?.trim() || ''
  const puesto = parsed.puesto?.trim() || ''
  const isOficinaSame = oficina && baseAmbiente.toLowerCase().includes(oficina.toLowerCase())
  const ubicacionPrincipal = isOficinaSame || !oficina ? (baseAmbiente || 'Sede CTPI') : `${baseAmbiente} · ${oficina}`

  const isAtencionPublico = parsed.impactoServicio === 'atencion_publico'
  const isExpress = parsed.modoExpress
  const rawTitle = parsed.rawDescription || solicitud.descripcion

  return (
    <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200 space-y-3.5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Tarjeta A: Título y Radicado (8 Cols) */}
        <div className="md:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopyCode}
                className="group flex items-center gap-1.5 font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-azul-sena shadow-2xs hover:border-azul-sena/40 hover:bg-blue-50/40 transition-all cursor-pointer active:scale-95"
              >
                <span>#{codigo}</span>
                <span className="material-symbols-outlined !text-[13px] text-slate-400 group-hover:text-azul-sena">
                  {copiedCode ? 'check' : 'content_copy'}
                </span>
              </button>
              <StatusBadge status={solicitud.estado} role="tecnico" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined !text-[13px]">schedule</span>
              {formattedDate}
            </span>
          </div>
          <h1 className="font-jakarta text-base sm:text-[19px] font-extrabold text-slate-900 tracking-[-0.02em] leading-snug break-words">
            {rawTitle}
          </h1>
        </div>

        {/* Tarjeta B: Diagnóstico Síntoma (4 Cols) */}
        <div className="md:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Síntoma Reportado
          </span>
          <div className="flex items-center gap-2.5 pt-2">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200 text-azul-sena flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined !text-[20px]">{symptom.icono}</span>
            </div>
            <div className="min-w-0">
              <p className="font-jakarta text-xs sm:text-sm font-bold text-slate-900 truncate">{symptom.titulo}</p>
              <p className="text-[11px] font-medium text-slate-400 truncate">{symptom.tag}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fila Inferior Bento: Ubicación + Prioridad (Sin badges rectangulares, tipografía y semántica directa) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined !text-[16px] text-emerald-600">apartment</span>
          <span className="font-bold text-slate-800">{ubicacionPrincipal}</span>
          {puesto && <span className="text-slate-400 font-medium">· {puesto}</span>}
        </div>

        {isAtencionPublico ? (
          <div className="inline-flex items-center gap-1.5 font-black text-amber-700">
            <span className="material-symbols-outlined !text-[16px] text-amber-600">emergency</span>
            <span>Atención al Público Crítica</span>
          </div>
        ) : isExpress ? (
          <div className="inline-flex items-center gap-1.5 font-black text-rose-700">
            <span className="material-symbols-outlined !text-[16px] text-rose-600">bolt</span>
            <span>Clase en Vivo</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">Soporte Estándar SENA</span>
        )}
      </div>
    </div>
  )
}
