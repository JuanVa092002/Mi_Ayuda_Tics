import { useState, useEffect, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/shared/ui'
import type { AmbienteFormacion, TipoCaso } from '@/shared/types'
import { buildEnrichedDescription, getJornadaActual } from '@/shared/utils/ticketContext'

export interface RadicarModalFormValues {
  ambiente: string
  tipoCaso: string
  descripcion: string
  telefono: string
  foto: FileList | null
  tipoUbicacion: 'academico' | 'administrativo'
  ficha?: string
  puesto?: string
  jornada?: string
  impactoServicio?: 'atencion_publico' | 'operativo_interno'
  modoExpress?: boolean
  equipoFalla?: string
}

interface RadicarSolicitudModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: RadicarModalFormValues) => Promise<void>
  isSubmitting: boolean
  ambientes: AmbienteFormacion[]
  tiposCaso: TipoCaso[]
  userPhone?: string
}

// Síntomas visuales humanos (MVP Nivel Mundial: auto-clasificación sin tecnicismos)
interface VisualSymptom {
  id: string
  titulo: string
  subtitulo: string
  icono: string
  categoriaMatch: string
  plantillaTexto: string
  pills: string[]
  equipo?: string
}

const SINTOMAS_VISUALES: VisualSymptom[] = [
  {
    id: 'pantalla_proyector',
    titulo: 'Pantalla o Proyector',
    subtitulo: 'Sin señal, parpadea o apagado',
    icono: 'videocam',
    categoriaMatch: 'hardware',
    plantillaTexto: 'El proyector / monitor no da señal de video.',
    pills: ['Cable HDMI suelto', 'Luz roja parpadea', 'Sin audio en clase', 'Pantalla en negro'],
    equipo: 'videobeam',
  },
  {
    id: 'red_internet',
    titulo: 'Red e Internet',
    subtitulo: 'Wi-Fi desconectado o sin acceso',
    icono: 'wifi_off',
    categoriaMatch: 'internet',
    plantillaTexto: 'Falla de conexión a internet institucional.',
    pills: ['Todo el ambiente sin red', 'Solo mi equipo', 'Wi-Fi no conecta', 'Cable de red dañado'],
    equipo: 'red_ambiente',
  },
  {
    id: 'pc_equipo',
    titulo: 'Computador / CPU',
    subtitulo: 'No enciende, lento o bloqueado',
    icono: 'desktop_windows',
    categoriaMatch: 'hardware',
    plantillaTexto: 'El computador no inicia o se reinicia solo.',
    pills: ['Pantalla azul', 'No enciende la CPU', 'Teclado/Mouse no responden', 'Muy lento'],
    equipo: 'pc_puesto',
  },
  {
    id: 'impresora_periferico',
    titulo: 'Impresora / Escáner',
    subtitulo: 'Atasco, tóner o sin respuesta',
    icono: 'print',
    categoriaMatch: 'hardware',
    plantillaTexto: 'La impresora no procesa trabajos de impresión.',
    pills: ['Atasco de papel', 'Sin tóner / tinta', 'No aparece en la red', 'Lector/Escáner'],
    equipo: 'impresora',
  },
  {
    id: 'software_cuenta',
    titulo: 'Software o Licencia',
    subtitulo: 'Office, Windows o credenciales',
    icono: 'key',
    categoriaMatch: 'licencias',
    plantillaTexto: 'Problema con licencia o acceso a software institucional.',
    pills: ['Office 365 sin licencia', 'Windows sin activar', 'Cuenta bloqueada', 'Software formativo'],
    equipo: 'software',
  },
  {
    id: 'otro_soporte',
    titulo: 'Otra Asistencia',
    subtitulo: 'Requerimiento técnico específico',
    icono: 'support',
    categoriaMatch: 'software',
    plantillaTexto: 'Requiero asistencia técnica en el ambiente.',
    pills: ['Mantenimiento preventivo', 'Punto eléctrico / red', 'Instalación de programa'],
    equipo: 'general',
  },
]

const LAST_AMBIENTES_KEY = 'miayuda_recent_ambientes'

export function RadicarSolicitudModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  ambientes,
  tiposCaso,
  userPhone = '',
}: RadicarSolicitudModalProps): ReactNode {
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  
  // Estados para selector predictivo de ambiente
  const [ambienteSearch, setAmbienteSearch] = useState('')
  const [isAmbienteDropdownOpen, setIsAmbienteDropdownOpen] = useState(false)
  const [recentAmbientes, setRecentAmbientes] = useState<string[]>([])

  // Estado para síntoma visual activo y píldoras
  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RadicarModalFormValues>({
    defaultValues: {
      ambiente: '',
      tipoCaso: '',
      descripcion: '',
      telefono: userPhone || '',
      foto: null,
      tipoUbicacion: 'academico',
      ficha: '',
      puesto: '',
      jornada: getJornadaActual(),
      impactoServicio: 'operativo_interno',
      modoExpress: false,
      equipoFalla: '',
    },
  })

  const watchAmbiente = watch('ambiente')
  const watchFoto = watch('foto')
  const watchTipoUbicacion = watch('tipoUbicacion')
  const watchImpactoServicio = watch('impactoServicio')
  const watchModoExpress = watch('modoExpress')
  const watchDescripcion = watch('descripcion')



  // Cargar ambientes recientes de localStorage
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setValue('jornada', getJornadaActual())
      if (userPhone) setValue('telefono', userPhone)
      
      try {
        const stored = localStorage.getItem(LAST_AMBIENTES_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as string[]
          if (Array.isArray(parsed)) {
            setRecentAmbientes(parsed.slice(0, 3))
            // Si no hay ambiente seleccionado, pre-seleccionar el más reciente
            if (parsed[0] && ambientes.some((a) => a._id === parsed[0] || a.nombre === parsed[0])) {
              setValue('ambiente', parsed[0])
            }
          }
        }
      } catch {
        // Silencioso
      }
      if (tiposCaso[0]?._id) {
        setValue('tipoCaso', tiposCaso[0]._id)
      }
    } else {
      document.body.style.overflow = ''
      setSelectedFilePreview(null)
      setSelectedSymptomId(null)
      setAmbienteSearch('')
      setIsAmbienteDropdownOpen(false)
      reset({
        ambiente: '',
        tipoCaso: tiposCaso[0]?._id || '',
        descripcion: '',
        telefono: userPhone || '',
        foto: null,
        tipoUbicacion: 'academico',
        ficha: '',
        puesto: '',
        jornada: getJornadaActual(),
        impactoServicio: 'operativo_interno',
        modoExpress: false,
        equipoFalla: '',
      })
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, userPhone, reset, setValue, ambientes])

  useEffect(() => {
    if (watchFoto && watchFoto.length > 0) {
      const file = watchFoto[0]
      const url = URL.createObjectURL(file)
      setSelectedFilePreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
    setSelectedFilePreview(null)
    return undefined
  }, [watchFoto])

  // Si los tipos de caso cargan de forma diferida y el campo aún no está seleccionado, asegurar valor por defecto
  useEffect(() => {
    if (isOpen && tiposCaso && tiposCaso.length > 0 && !watch('tipoCaso')) {
      setValue('tipoCaso', tiposCaso[0]._id, { shouldValidate: true })
    }
  }, [isOpen, tiposCaso, setValue, watch])

  if (!isOpen) return null

  // Determinar nombre del ambiente seleccionado
  const selectedAmbienteObj = ambientes.find(
    (a) => a._id === watchAmbiente || a.nombre === watchAmbiente
  )
  const ambienteNombre = selectedAmbienteObj?.nombre || watchAmbiente || ''

  // Filtrado de ambientes en tiempo real por búsqueda
  const filteredAmbientes = ambientes.filter((a) =>
    a.nombre.toLowerCase().includes(ambienteSearch.toLowerCase().trim())
  )

  // Manejador de selección de síntoma visual (Soporta cambiar entre síntomas libremente y deseleccionar con segundo toque)
  const handleSelectSymptom = (symptom: VisualSymptom) => {
    // Si vuelve a presionar el mismo síntoma, lo deselecciona y permite limpiar
    if (selectedSymptomId === symptom.id) {
      setSelectedSymptomId(null)
      setValue('equipoFalla', '')
      // Si la descripción actual era exactamente la plantilla de este síntoma, limpiarla
      if (watchDescripcion === symptom.plantillaTexto) {
        setValue('descripcion', '')
      }
      return
    }

    const prevSymptom = SINTOMAS_VISUALES.find((s) => s.id === selectedSymptomId)
    setSelectedSymptomId(symptom.id)
    setValue('equipoFalla', symptom.equipo || '')

    // Si la descripción está vacía, o si coincide con la plantilla del síntoma previo, actualizarla con la nueva
    const currentDesc = watchDescripcion?.trim() || ''
    if (!currentDesc || currentDesc.length < 5 || (prevSymptom && currentDesc === prevSymptom.plantillaTexto)) {
      setValue('descripcion', symptom.plantillaTexto)
    }

    // Auto-emparejar tipo de caso en el backend
    const matchedType = tiposCaso.find((tc) =>
      tc.nombre.toLowerCase().includes(symptom.categoriaMatch)
    ) || tiposCaso[0]

    if (matchedType) {
      setValue('tipoCaso', matchedType._id, { shouldValidate: true })
    }
  }

  // Manejador de micro-pills para enriquecer descripción sin escribir (Toggle inteligente)
  const handleAddPillToDescription = (pillText: string) => {
    const current = watchDescripcion?.trim() || ''
    if (current.includes(pillText)) {
      // Remover si ya está presente
      const cleaned = current
        .replace(` · ${pillText}`, '')
        .replace(`${pillText} · `, '')
        .replace(pillText, '')
        .trim()
      setValue('descripcion', cleaned)
    } else {
      const updated = current ? `${current} · ${pillText}` : pillText
      setValue('descripcion', updated)
    }
  }

  // Guardar ambiente reciente en localStorage
  const saveRecentAmbiente = (ambId: string) => {
    try {
      const next = [ambId, ...recentAmbientes.filter((id) => id !== ambId)].slice(0, 3)
      setRecentAmbientes(next)
      localStorage.setItem(LAST_AMBIENTES_KEY, JSON.stringify(next))
    } catch {
      // Silencioso
    }
  }

  const handleFormSubmit = async (values: RadicarModalFormValues) => {
    const isAdministrativo = values.tipoUbicacion === 'administrativo'

    // Asegurar que tipoCaso nunca sea vacío o nulo para cumplir el contrato con el backend
    const resolvedTipoCaso = values.tipoCaso || tiposCaso[0]?._id || ''
    const resolvedAmbiente = values.ambiente || (ambientes.length === 1 ? ambientes[0]._id : '')

    if (resolvedAmbiente) {
      saveRecentAmbiente(resolvedAmbiente)
    }

    const enrichedDescription = buildEnrichedDescription({
      tipoUbicacion: values.tipoUbicacion,
      ficha: isAdministrativo ? undefined : values.ficha,
      puesto: values.puesto,
      oficina: isAdministrativo ? ambienteNombre : undefined,
      jornada: isAdministrativo ? undefined : values.jornada,
      impactoServicio: isAdministrativo ? values.impactoServicio : undefined,
      modoExpress: values.modoExpress,
      equipoFalla: values.equipoFalla,
      descripcion: values.descripcion,
    })

    await onSubmit({
      ...values,
      ambiente: resolvedAmbiente,
      tipoCaso: resolvedTipoCaso,
      descripcion: enrichedDescription,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="radicar-modal-title"
    >
      {/* Backdrop con desenfoque de cristal (Glassmorphism) */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Ventana Modal Flotante */}
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 my-auto z-10 flex flex-col max-h-[96vh]">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-verde-sena to-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">support_agent</span>
            </div>
            <div>
              <h2 id="radicar-modal-title" className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Radicar Solicitud de Soporte TIC
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500">
                Reporta la falla para despachar asistencia técnica a tu ambiente en sitio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
            aria-label="Cerrar ventana"
          >
            <span className="material-symbols-outlined !text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto px-5 sm:px-7 py-3 sm:py-4 space-y-3 sm:space-y-3.5">
          
          {/* SECCIÓN 1: UBICACIÓN INTELIGENTE (BÚSQUEDA INSTANTÁNEA + RECIENTES) */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50/50 via-slate-50 to-emerald-50/30 border border-slate-200/90 shadow-2xs space-y-2.5">
            
            {/* Header Ubicación y Rol */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined !text-[18px] text-azul-sena">place</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    ¿Dónde te encuentras?
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ambiente pedagógico, taller u oficina de la sede
                  </p>
                </div>
              </div>

              {/* Selector de Rol Compacto */}
              <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 text-[11px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setValue('tipoUbicacion', 'academico')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    watchTipoUbicacion === 'academico'
                      ? 'bg-white text-azul-sena shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clase / Aula
                </button>
                <button
                  type="button"
                  onClick={() => setValue('tipoUbicacion', 'administrativo')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    watchTipoUbicacion === 'administrativo'
                      ? 'bg-white text-emerald-800 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Oficina
                </button>
              </div>
            </div>

            {/* Accesos Rápidos: Ambientes Recientes (1 Clic) */}
            {recentAmbientes.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                  <span className="material-symbols-outlined !text-[12px]">history</span>
                  <span>Frecuentes:</span>
                </span>
                {recentAmbientes.map((ambId) => {
                  const ambObj = ambientes.find((a) => a._id === ambId || a.nombre === ambId)
                  if (!ambObj) return null
                  const isSelected = watchAmbiente === ambObj._id || watchAmbiente === ambObj.nombre
                  return (
                    <button
                      key={ambObj._id}
                      type="button"
                      onClick={() => {
                        setValue('ambiente', ambObj._id)
                        setAmbienteSearch('')
                        setIsAmbienteDropdownOpen(false)
                      }}
                      className={`px-2 py-0.5 rounded-lg border font-bold transition-all cursor-pointer shrink-0 truncate max-w-[130px] ${
                        isSelected
                          ? 'border-azul-sena bg-blue-50 text-azul-sena shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ambObj.nombre}
                    </button>
                  )
                })}
              </div>
            )}

              {/* Input con Búsqueda Predictiva Integrada (En 2 teclas) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {watchTipoUbicacion === 'administrativo' ? 'Oficina o Dependencia *' : 'Ambiente o Aula de Formación *'}
              </label>

              <Controller
                name="ambiente"
                control={control}
                rules={{ required: 'Selecciona el ambiente donde se encuentra la falla' }}
                render={({ field }) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined !text-[18px]">search</span>
                    </div>
                    <input
                      type="text"
                      value={isAmbienteDropdownOpen ? ambienteSearch : (ambienteNombre || ambienteSearch)}
                      onFocus={() => {
                        setIsAmbienteDropdownOpen(true)
                        setAmbienteSearch('')
                      }}
                      onChange={(e) => {
                        setAmbienteSearch(e.target.value)
                        setIsAmbienteDropdownOpen(true)
                      }}
                      placeholder={
                        watchTipoUbicacion === 'administrativo'
                          ? 'Escribe para buscar oficina (ej: Matrículas, Rectoría, Almacén)...'
                          : 'Escribe para buscar aula (ej: 204, Software, Redes, Taller)...'
                      }
                      className={`w-full rounded-xl border pl-9 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 transition-all outline-none bg-white shadow-2xs ${
                        errors.ambiente ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-300'
                      }`}
                    />
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange('')
                          setAmbienteSearch('')
                          setIsAmbienteDropdownOpen(true)
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Limpiar ambiente"
                      >
                        <span className="material-symbols-outlined !text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                )}
              />

              {/* Dropdown flotante con resultados filtrados al instante */}
              {isAmbienteDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredAmbientes.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No se encontró ningún ambiente con ese nombre.
                    </div>
                  ) : (
                    filteredAmbientes.map((amb) => {
                      const isSelected = watchAmbiente === amb._id || watchAmbiente === amb.nombre
                      return (
                        <button
                          key={amb._id}
                          type="button"
                          onClick={() => {
                            setValue('ambiente', amb._id, { shouldValidate: true })
                            setAmbienteSearch('')
                            setIsAmbienteDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-azul-sena font-black'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{amb.nombre}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined !text-[15px] text-azul-sena">check</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              )}

              {errors.ambiente && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined !text-[14px]">error</span>
                  <span>Selecciona el ambiente donde se encuentra la falla</span>
                </p>
              )}
            </div>

            {/* Micro-datos contextuales (Ficha o Puesto) */}
            {watchTipoUbicacion === 'administrativo' ? (
              <div className="space-y-2 animate-fade-in pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Puesto / Equipo Específico (Opcional)
                    </label>
                    <Controller
                      name="puesto"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Ej: Ventanilla 2, Impresora de Carnets..."
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white shadow-2xs"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* 1-Tap Switch Administrativo: Ventanilla / Atención al Público */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined !text-[18px] ${
                      watchImpactoServicio === 'atencion_publico' ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {watchImpactoServicio === 'atencion_publico' ? 'emergency' : 'shield'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        ¿Atención a aprendices o público detenida?
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {watchImpactoServicio === 'atencion_publico'
                          ? 'Prioridad alta activada para despacho técnico'
                          : 'Operación interna estándar'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'impactoServicio',
                        watchImpactoServicio === 'atencion_publico' ? 'operativo_interno' : 'atencion_publico'
                      )
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                      watchImpactoServicio === 'atencion_publico'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {watchImpactoServicio === 'atencion_publico' ? '🚨 SÍ, CRÍTICO' : 'NO'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 animate-fade-in pt-0.5">
                {/* 1-Tap Toggle Limpio de Urgencia en Aula (Compacto, elegante, sin cajas gigantes apiladas) */}
                <div
                  className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs ${
                    watchModoExpress
                      ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400/30'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`material-symbols-outlined !text-[18px] shrink-0 ${
                        watchModoExpress ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {watchModoExpress ? 'bolt' : 'school'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <span>¿Clase con aprendices detenida ahora mismo?</span>
                        {watchModoExpress && (
                          <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                            Urgente
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {watchModoExpress
                          ? 'Prioridad alta: alerta inmediata de desplazamiento al técnico de turno'
                          : 'Operación formativa regular'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setValue('modoExpress', !watchModoExpress)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                      watchModoExpress
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {watchModoExpress ? "🚨 SÍ, URGENTE" : "NO"}
                  </button>
                </div>

                {/* Datos contextuales limpios: Puesto/Equipo y Jornada (Total libertad de entrada para el usuario) */}
                {/* Datos contextuales limpios: Puesto/Equipo y Jornada (Total libertad de entrada para el usuario) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                      Puesto, Equipo o Alcance (Opcional)
                    </label>
                    <Controller
                      name="puesto"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Ej: Toda el aula, Proyector techo, PC 14..."
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 outline-none bg-white shadow-2xs"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
                      Jornada
                    </label>
                    <Controller
                      name="jornada"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 outline-none bg-white shadow-2xs"
                        >
                          <option value="Mañana">Mañana</option>
                          <option value="Tarde">Tarde</option>
                          <option value="Noche">Noche</option>
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* SECCIÓN 2: REJILLA VISUAL DE SÍNTOMAS (EXPERIENCIA LINEAR / 1-TAP) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                ¿Qué problema presenta el equipo o servicio? <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Selecciona con 1 toque</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SINTOMAS_VISUALES.map((sym) => {
                const isSelected = selectedSymptomId === sym.id
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => handleSelectSymptom(sym)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-azul-sena bg-blue-50/90 ring-2 ring-azul-sena/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-azul-sena text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined !text-[16px]">{sym.icono}</span>
                      </div>
                      <span className={`text-xs font-black leading-tight truncate ${
                        isSelected ? 'text-azul-sena' : 'text-slate-800'
                      }`}>
                        {sym.titulo}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                      {sym.subtitulo}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Micro-Pills Contextuales: Con flex-wrap fluido y sin scrollbar horizontal rota */}
            {selectedSymptomId && (() => {
              const currentSym = SINTOMAS_VISUALES.find((s) => s.id === selectedSymptomId)
              if (!currentSym || currentSym.pills.length === 0) return null
              return (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center gap-1.5 animate-fade-in text-[11px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                    <span className="material-symbols-outlined !text-[12px] text-azul-sena">add_circle</span>
                    <span>Detalle rápido:</span>
                  </span>
                  {currentSym.pills.map((pill) => {
                    const isAdded = watchDescripcion?.includes(pill)
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => handleAddPillToDescription(pill)}
                        className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-blue-100/80 border-blue-300 text-azul-sena font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-azul-sena hover:text-azul-sena shadow-2xs'
                        }`}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {pill}
                      </button>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* SECCIÓN 3: DESCRIPCIÓN CONSOLIDADA (PRE-LLENADA Y EDITABLE) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detalle del Requerimiento <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Prellenado automáticamente</span>
            </div>
            <Controller
              name="descripcion"
              control={control}
              rules={{
                required: 'Ingresa o selecciona los detalles del problema',
                minLength: { value: 8, message: 'Ingresa al menos 8 caracteres' },
              }}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={2}
                  placeholder="Detalla qué ocurre o qué mensaje muestra la pantalla..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 transition-all outline-none resize-none bg-white shadow-2xs"
                />
              )}
            />
            {errors.descripcion && (
              <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined !text-[14px]">error</span>
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* SECCIÓN 4: TELÉFONO Y EVIDENCIA FOTOGRÁFICA COMPACTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Teléfono */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Celular de Contacto (Opcional)
              </label>
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined !text-[16px]">call</span>
                    </div>
                    <input
                      {...field}
                      type="tel"
                      placeholder="Ej: 310 123 4567"
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 outline-none bg-white shadow-2xs"
                    />
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        aria-label="Limpiar celular"
                        title="Borrar celular"
                      >
                        <span className="material-symbols-outlined !text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Evidencia Fotográfica en 1 Clic */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Foto o Placa SENA (Opcional)
              </label>
              <Controller
                name="foto"
                control={control}
                render={({ field: { onChange } }) => (
                  <div>
                    {selectedFilePreview ? (
                      <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={selectedFilePreview}
                            alt="Vista previa"
                            className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="text-[11px] font-bold text-emerald-800">Foto adjunta</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onChange(null)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <span className="material-symbols-outlined !text-[16px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-slate-300 hover:border-azul-sena bg-slate-50/50 hover:bg-blue-50/30 text-slate-600 hover:text-azul-sena cursor-pointer transition-all">
                        <span className="material-symbols-outlined !text-[16px]">photo_camera</span>
                        <span className="text-xs font-bold">Tomar foto o captura</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Modal Footer Integrado */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              variant="secondary"
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl px-5 text-xs sm:text-sm font-semibold"
            >
              Cancelar
            </Button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-verde-sena to-[#2e8800] hover:from-[#329600] hover:to-[#277400] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Radicando solicitud...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined !text-[18px]">send</span>
                  <span>Confirmar y Radicar</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
