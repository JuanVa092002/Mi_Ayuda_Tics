import { useState, useEffect, useMemo, type ReactNode, type FormEvent, type ChangeEvent } from 'react'
import type { TipoSolucion, CaseForResolution } from '@/shared/types'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'

export interface ResolutionModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSubmit: (data: {
    solucion: string
    tipoSolucion: TipoSolucion
    observaciones: string
    file?: File
  }) => Promise<void> | void
  caso?: CaseForResolution | null
  // Propiedades opcionales legacy para compatibilidad
  solutionDescription?: string
  setSolutionDescription?: (value: string) => void
  caseType?: string
  setCaseType?: (value: string) => void
  solutionType?: TipoSolucion | ''
  setSolutionType?: (value: TipoSolucion) => void
  caseTypes?: unknown[]
}

export default function ResolutionModal({
  isOpen,
  onRequestClose,
  onSubmit,
  caso,
  solutionDescription = '',
}: ResolutionModalProps): ReactNode {
  const [descripcion, setDescripcion] = useState(solutionDescription)
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string | null>(null)
  const [tipoSol, setTipoSol] = useState<TipoSolucion>('finalizado')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resetear estados al abrir o cambiar de caso
  useEffect(() => {
    if (isOpen) {
      setDescripcion(solutionDescription || '')
      setSelectedPresetLabel(null)
      setSelectedFile(null)
      setSelectedImage(null)
      setTipoSol('finalizado')
    }
  }, [isOpen, solutionDescription, caso])

  // Deducción inteligente del síntoma del caso actual
  const detectedSymptom = useMemo(() => {
    if (!caso) return null
    const ctx = parseEnrichedDescription(caso.descripcion)
    return detectVisualSymptom(ctx, caso.descripcion)
  }, [caso])

  // P3: Plantillas Dinámicas alineadas 1:1 con el síntoma radicado
  const dynamicPresets = useMemo(() => {
    const symId = detectedSymptom?.id || 'otro_soporte'

    switch (symId) {
      case 'pantalla_proyector':
        return [
          { label: 'Reemplazo Cable HDMI / Patchcord', desc: 'Se sustituyó cable de video defectuoso por uno institucional funcional y se probó duplicación de pantalla.' },
          { label: 'Configuración Pantalla / Windows (Win+P)', desc: 'Se reajustó resolución a 1080p y modo duplicar pantalla; proyector emite video sin distorsión.' },
          { label: 'Limpieza Filtro & Enfriamiento Videobeam', desc: 'Mantenimiento express a unidad óptica; disipación normalizada sin alertas de sobrecalentamiento.' },
          { label: 'Conmutación Entrada Fuente (HDMI 1/2)', desc: 'Se reprogramó canal de entrada del videobeam y se probó audio integrado con el instructor.' },
        ]
      case 'red_internet':
        return [
          { label: 'Reinicio de Boca de Red / Patchcord', desc: 'Se reconectó y testeó punto de red en canaleta; enlace gigabit restablecido con éxito.' },
          { label: 'Renovación IP / Flush DNS en Host', desc: 'Se ejecutó liberación de concesión DHCP institucional y renovación de tablas de nombres.' },
          { label: 'Reasociación Wi-Fi Institucional', desc: 'Se reconfiguró perfil de red inalámbrica con credenciales válidas y cobertura óptima.' },
          { label: 'Reinicio & Conmutación Switch/AP', desc: 'Se validó conmutación de switch de piso; tráfico y latencia estabilizados en el ambiente.' },
        ]
      case 'software_cuenta':
        return [
          { label: 'Activación Licencia Office 365 / Windows', desc: 'Se autenticó cuenta institucional válida; suite ofimática operativa sin bloqueos.' },
          { label: 'Desbloqueo de Credenciales & Acceso', desc: 'Se asistió en validación de acceso y recuperación de sesión en portal institucional.' },
          { label: 'Instalación / Reparación de Software Formativo', desc: 'Se desplegó paquete de software requerido con permisos de administrador.' },
          { label: 'Limpieza de Caché y Perfil de Usuario', desc: 'Se regeneró perfil temporal con errores de inicio; carga ágil y sin advertencias.' },
        ]
      case 'impresora_periferico':
        return [
          { label: 'Desatasco de Papel & Limpieza de Rodillos', desc: 'Se extrajo papel obstruido en bandeja de paso y se limpiaron rodillos de tracción.' },
          { label: 'Reemplazo / Agitado de Cartucho de Tóner', desc: 'Se sustituyó insumo de impresión agotado; páginas de prueba nítidas y legibles.' },
          { label: 'Reinstalación de Controlador (Spooler)', desc: 'Se reinició cola de impresión de Windows y se reinstaló driver de red.' },
          { label: 'Reconexión de Periférico / Puerto USB', desc: 'Se verificó reconocimiento de hardware en Administrador de Dispositivos.' },
        ]
      case 'pc_equipo':
        return [
          { label: 'Reconexión de Poder / Fuente Eléctrica', desc: 'Se ajustó cable de energía en regulador/UPS; el computador encendió de inmediato.' },
          { label: 'Prueba de Memoria RAM & Reinicio Seguro', desc: 'Se reasentaron módulos de memoria RAM; sistema operativo arrancó sin pantalla azul.' },
          { label: 'Sustitución de Teclado o Mouse Dañado', desc: 'Se reemplazó periférico averiado por repuesto operativo y se comprobó respuesta.' },
          { label: 'Limpieza Preventiva & Verificación de Arranque', desc: 'Se liberó espacio en disco y se verificó tiempo de carga óptimo del sistema.' },
        ]
      default:
        return [
          { label: 'Mantenimiento Correctivo en Sitio', desc: 'Intervención técnica presencial exitosa; pruebas de funcionamiento aprobadas con el usuario.' },
          { label: 'Ajuste de Cableado & Conexiones', desc: 'Se aseguraron conectores de poder y datos; servicios TIC estabilizados.' },
          { label: 'Asistencia y Capacitación Rápida', desc: 'Se orientó al funcionario en la correcta operación del recurso TIC.' },
          { label: 'Traslado a Taller TIC para Diagnóstico', desc: 'Equipo retirado con acta para intervención especializada en banco de pruebas.' },
        ]
    }
  }, [detectedSymptom])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setDescripcion('')
      setTipoSol('finalizado')
      setSelectedFile(null)
      setSelectedImage(null)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSelectedImage(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!descripcion.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        solucion: descripcion.trim(),
        tipoSolucion: tipoSol,
        observaciones: descripcion.trim(),
        file: selectedFile || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolucion-modal-title"
    >
      {/* Backdrop de cristal */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => !isSubmitting && onRequestClose()}
        aria-hidden="true"
      />

      {/* Ventana Modal Flotante */}
      <div className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 my-auto z-10 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/60 border-b border-emerald-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined !text-[22px]">task_alt</span>
            </div>
            <div>
              <h2 id="resolucion-modal-title" className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Formalizar Solución de Soporte
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {caso ? `Caso #${caso.codigoCaso || caso._id.slice(-6)} · ${caso.descripcion}` : 'Registra el informe técnico para cerrar la atención.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestClose}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* OPP-4 / P3: Plantillas de Cierre Rápido Guiado Dinámicas (1-Tap Checklist Institucional) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wider">
                <span className="material-symbols-outlined !text-[16px] text-emerald-600">playlist_add_check</span>
                <span>Plantillas de Cierre: {detectedSymptom?.titulo || 'Soporte TIC'}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">1-Toque para rellenar</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {dynamicPresets.map((preset) => {
                const isSelected = selectedPresetLabel === preset.label
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPresetLabel(null)
                        if (descripcion.trim() === preset.desc.trim()) {
                          setDescripcion('')
                        }
                        return
                      }

                      setSelectedPresetLabel(preset.label)
                      setDescripcion(preset.desc)
                      setTipoSol('finalizado')
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-100/90 text-emerald-950 font-bold ring-2 ring-emerald-600/30'
                        : 'border-emerald-200 bg-white hover:bg-emerald-100/70 text-slate-700'
                    }`}
                  >
                    <p className={`text-[11px] leading-tight ${isSelected ? 'font-black text-emerald-950' : 'font-bold text-slate-900'}`}>
                      {preset.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Diagnóstico y Labores Realizadas <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla qué falla se identificó, qué componentes se configuraron o reemplazaron y las pruebas de funcionamiento realizadas..."
              required
              className="w-full rounded-2xl border border-slate-300/80 p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 transition-all outline-none resize-none shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tipo de Cierre Operativo
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTipoSol('finalizado')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tipoSol === 'finalizado'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs font-black'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[17px] text-emerald-600">verified</span>
                  <span className="text-xs font-bold">Solución Total</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Servicio TIC 100% operativo en ambiente</p>
              </button>

              <button
                type="button"
                onClick={() => setTipoSol('pendiente')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  tipoSol === 'pendiente'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20 shadow-2xs font-black'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[17px] text-amber-600">pending</span>
                  <span className="text-xs font-bold">Cierre Parcial</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Requiere repuesto o seguimiento posterior</p>
              </button>
            </div>
          </div>

          {/* Adjuntar foto de evidencia del trabajo terminado */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fotografía de Validación / Equipo Operativo (Opcional)
            </label>
            {selectedImage ? (
              <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedImage}
                    alt="Evidencia solución"
                    className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Foto de soporte adjunta</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Lista para el expediente</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setSelectedImage(null)
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Quitar foto"
                >
                  <span className="material-symbols-outlined !text-[18px]">delete</span>
                </button>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-3.5 flex items-center justify-center gap-2 bg-slate-50/40 transition-colors text-slate-600">
                <span className="material-symbols-outlined !text-[20px] text-azul-sena">add_a_photo</span>
                <span className="text-xs font-bold">Adjuntar foto de equipo funcionando</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onRequestClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!descripcion.trim() || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-verde-sena to-[#2e8800] hover:from-[#329600] hover:to-[#277400] text-white text-xs font-black shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Formalizando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined !text-[18px]">check_circle</span>
                  <span>Formalizar Solución</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
