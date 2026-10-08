import { useState, useEffect, type FormEvent } from 'react'
import type { Solicitud } from '@/shared/types'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'

export type InterventionTab = 'bitacora' | 'consulta'

interface InterventionActionModalProps {
  isOpen: boolean
  initialTab?: InterventionTab
  solicitud: Solicitud | null
  onClose: () => void
  onSaveBitacora: (mensaje: string) => Promise<void>
  onRequestInfo: (mensaje: string) => Promise<void>
}

// Chips predefinidos por pestaña y contexto
const BITACORA_PRESETS = [
  '🔧 Diagnóstico de hardware y pruebas de encendido concluidas.',
  '🧹 Mantenimiento físico preventivo y limpieza de componentes realizada.',
  '🔌 Reemplazo de patch cord y pruebas de continuidad de red.',
  '💻 Actualización de controladores y reinicio del sistema operativo.',
  '🖨️ Desatasco de papel, limpieza de cabezales y prueba de impresión exitosa.',
  '📡 Comprobación de señal de red inalámbrica y cambio de punto de acceso.',
]

const CONSULTA_PRESETS = [
  '📍 ¿Te encuentras en la oficina/aula para darnos acceso físico al equipo?',
  '🔄 ¿El fallo persiste tras reiniciar el equipo o desconectar el cable de corriente?',
  '🔑 Requerimos que inicies sesión en tu perfil de usuario para validar el aplicativo.',
  '🖥️ ¿Podrías confirmar si el indicador LED del monitor enciende o parpadea?',
  '⚡ ¿Hay más equipos en tu área que presenten el mismo corte o falla?',
]

export function InterventionActionModal({
  isOpen,
  initialTab = 'bitacora',
  solicitud,
  onClose,
  onSaveBitacora,
  onRequestInfo,
}: InterventionActionModalProps) {
  const [activeTab, setActiveTab] = useState<InterventionTab>(initialTab)
  const [bitacoraText, setBitacoraText] = useState('')
  const [consultaText, setConsultaText] = useState('')
  const [selectedBitacoraPreset, setSelectedBitacoraPreset] = useState<string | null>(null)
  const [selectedConsultaPreset, setSelectedConsultaPreset] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar tab inicial cuando cambia y resetear selección al abrir
  useEffect(() => {
    const isEsperando =
      solicitud?.estado === 'esperando_usuario' || solicitud?.estado === 'requiere_informacion'
    setActiveTab(isEsperando ? 'bitacora' : initialTab)
    if (!isOpen) {
      setBitacoraText('')
      setConsultaText('')
      setSelectedBitacoraPreset(null)
      setSelectedConsultaPreset(null)
    }
  }, [initialTab, isOpen, solicitud?.estado])

  if (!isOpen || !solicitud) return null

  const parsedJob = parseEnrichedDescription(solicitud.descripcion)
  const symptom = detectVisualSymptom(parsedJob, solicitud.descripcion)
  const codigo = solicitud.codigoCaso || solicitud._id.slice(-6)
  const nombreAmbiente = solicitud.ambiente?.nombre || 'General'

  // Último intercambio o nota técnica previa del historial
  const lastNote = solicitud.historial && solicitud.historial.length > 0
    ? [...solicitud.historial].reverse().find((h) =>
        h.type === 'waiting_for_requester' ||
        h.type === 'requester_reply' ||
        h.type === 'note_added' ||
        h.type === 'diagnostic_updated'
      )
    : null

  const handleApplyPreset = (preset: string) => {
    if (activeTab === 'bitacora') {
      // Si vuelve a tocar el mismo preset, lo deselecciona y limpia el texto si coincide
      if (selectedBitacoraPreset === preset) {
        setSelectedBitacoraPreset(null)
        if (bitacoraText.trim() === preset.trim()) {
          setBitacoraText('')
        }
        return
      }

      // Reemplaza el texto si estaba vacío o si contenía el preset anterior
      const prev = selectedBitacoraPreset
      setSelectedBitacoraPreset(preset)
      const current = bitacoraText.trim()
      if (!current || (prev && current === prev.trim())) {
        setBitacoraText(preset)
      } else {
        setBitacoraText(preset)
      }
    } else {
      // Si vuelve a tocar el mismo preset en consulta, lo deselecciona
      if (selectedConsultaPreset === preset) {
        setSelectedConsultaPreset(null)
        if (consultaText.trim() === preset.trim()) {
          setConsultaText('')
        }
        return
      }

      // Reemplaza el texto con el nuevo preset
      const prev = selectedConsultaPreset
      setSelectedConsultaPreset(preset)
      const current = consultaText.trim()
      if (!current || (prev && current === prev.trim())) {
        setConsultaText(preset)
      } else {
        setConsultaText(preset)
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (activeTab === 'bitacora') {
        const text = bitacoraText.trim()
        if (!text) return
        await onSaveBitacora(text)
        setBitacoraText('')
      } else {
        const text = consultaText.trim()
        if (!text) return
        await onRequestInfo(text)
        setConsultaText('')
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentText = activeTab === 'bitacora' ? bitacoraText : consultaText
  const isBitacora = activeTab === 'bitacora'
  const isEsperandoUsuario =
    solicitud.estado === 'esperando_usuario' || solicitud.estado === 'requiere_informacion'

  // Navegación por Tabs
  const canSwitchToConsulta = !isEsperandoUsuario

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh]">
        
        {/* Header con Contexto de Caso */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-azul-sena shadow-2xs">
                #{codigo}
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span className="material-symbols-outlined !text-[15px] text-emerald-600">apartment</span>
                {nombreAmbiente}
              </span>
              {symptom.titulo && (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 hidden sm:inline-flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[13px] text-azul-sena">{symptom.icono}</span>
                  {symptom.titulo}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Centro de Intervención en Sitio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comunícate con el expediente o solicita acceso/datos al funcionario.
          </p>

          {/* Navegación por Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('bitacora')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isBitacora
                  ? 'bg-white text-azul-sena shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className={`material-symbols-outlined !text-[18px] ${isBitacora ? 'text-azul-sena' : 'text-slate-400'}`}>
                edit_note
              </span>
              <span>1. Bitácora de Campo</span>
            </button>

            <button
              type="button"
              disabled={!canSwitchToConsulta}
              onClick={() => canSwitchToConsulta && setActiveTab('consulta')}
              title={
                !canSwitchToConsulta
                  ? 'El caso ya se encuentra en espera de la respuesta del funcionario.'
                  : 'Enviar una pregunta o consulta de acceso al funcionario'
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                !canSwitchToConsulta
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : !isBitacora
                  ? 'bg-white text-amber-900 shadow-xs font-black cursor-pointer'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer'
              }`}
            >
              <span className={`material-symbols-outlined !text-[18px] ${!isBitacora ? 'text-amber-600' : 'text-slate-400'}`}>
                help_outline
              </span>
              <span>2. Consultar al Funcionario</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Banner de Impacto Semántico */}
          {isEsperandoUsuario ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950">
              <span className="material-symbols-outlined !text-[18px] text-amber-700 shrink-0 mt-0.5">hourglass_top</span>
              <div>
                <p className="font-bold">El caso está esperando respuesta del funcionario:</p>
                <p className="text-slate-700 mt-0.5">
                  Ya has enviado una consulta al funcionario solicitante. Cuando él responda en su portal, el caso regresará automáticamente a <span className="font-bold text-azul-sena">En Atención</span>. Mientras tanto, puedes dejar notas de avance técnico en la bitácora.
                </p>
              </div>
            </div>
          ) : isBitacora ? (
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-azul-sena">
              <span className="material-symbols-outlined !text-[18px] text-blue-600 shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-bold">Registro de Avance en el Expediente:</p>
                <p className="text-slate-700 mt-0.5">
                  El caso se mantiene <span className="font-bold text-blue-900">En Atención Activa</span>. El funcionario y el líder podrán ver tus pruebas y componentes revisados en su historial sincronizado.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950">
              <span className="material-symbols-outlined !text-[18px] text-amber-700 shrink-0 mt-0.5">schedule</span>
              <div>
                <p className="font-bold">Intervención en Espera de Respuesta:</p>
                <p className="text-slate-700 mt-0.5">
                  El caso pasará a estado <span className="font-bold text-amber-900">Esperando al Funcionario</span>. Se le alertará en su portal para que proporcione acceso, credenciales o confirmación.
                </p>
              </div>
            </div>
          )}

          {/* Chips Rápidos de 1 toque */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Atajos de 1 toque ({isBitacora ? 'Pruebas habituales' : 'Preguntas frecuentes'}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(isBitacora ? BITACORA_PRESETS : CONSULTA_PRESETS).map((preset, idx) => {
                const isSelected = isBitacora
                  ? selectedBitacoraPreset === preset
                  : selectedConsultaPreset === preset
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`text-[11px] text-left px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium active:scale-95 ${
                      isSelected
                        ? isBitacora
                          ? 'border-azul-sena bg-azul-sena/10 text-azul-sena font-bold ring-2 ring-azul-sena/30 shadow-2xs'
                          : 'border-amber-600 bg-amber-100 text-amber-950 font-bold ring-2 ring-amber-600/30 shadow-2xs'
                        : isBitacora
                          ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-slate-800'
                          : 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-slate-800'
                    }`}
                  >
                    {preset}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Área de Texto Principal */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isBitacora ? 'Detalle de la labor o prueba en sitio' : 'Mensaje o requerimiento para el funcionario'} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={currentText}
              onChange={(e) => {
                if (isBitacora) setBitacoraText(e.target.value)
                else setConsultaText(e.target.value)
              }}
              placeholder={
                isBitacora
                  ? 'Describe qué componentes verificaste, configuraciones o mediciones realizadas...'
                  : 'Indica claramente qué requieres para continuar (ej: estar en la oficina, validar encendido)...'
              }
              required
              className={`w-full rounded-xl border p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                isBitacora
                  ? 'border-slate-300 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20'
                  : 'border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
              }`}
            />
          </div>

          {/* Micro-historial de la última novedad */}
          {lastNote && (() => {
            const isRequesterNote =
              lastNote.type === 'requester_reply' ||
              lastNote.author?.rol === 'funcionario' ||
              (typeof solicitud.usuario === 'object' &&
                solicitud.usuario !== null &&
                '_id' in solicitud.usuario &&
                (lastNote.author as any)?._id &&
                (lastNote.author as any)._id === (solicitud.usuario as any)._id)

            const authorLabel = isRequesterNote
              ? `${lastNote.author?.nombre || (typeof solicitud.usuario === 'object' ? solicitud.usuario?.nombre : 'Funcionario')} (Solicitante)`
              : `${lastNote.author?.nombre || 'Técnico'} (Soporte TIC)`

            return (
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isRequesterNote
                  ? 'bg-indigo-50/60 border-indigo-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="material-symbols-outlined !text-[15px] text-azul-sena">
                      {isRequesterNote ? 'reply' : 'history'}
                    </span>
                    <span>{isRequesterNote ? 'Última respuesta del funcionario:' : 'Última consulta o nota técnica:'}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isRequesterNote
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {authorLabel}
                  </span>
                </div>
                <p className="text-slate-800 font-medium italic pl-1 leading-relaxed">
                  "{lastNote.message}"
                </p>
              </div>
            )
          })()}

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!currentText.trim() || isSubmitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95 ${
                isBitacora
                  ? 'bg-azul-sena hover:bg-blue-800'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : isBitacora ? (
                <>
                  <span className="material-symbols-outlined !text-[18px]">save</span>
                  <span>Registrar en Bitácora</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined !text-[18px]">send</span>
                  <span>Enviar y Poner en Espera</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
