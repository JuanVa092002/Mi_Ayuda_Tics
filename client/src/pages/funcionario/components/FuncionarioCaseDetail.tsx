import { useState, useEffect, type ReactNode } from 'react'
import { StatusBadge } from '@/shared/ui'
import type { Solicitud, SolicitudHistorialEvent } from '@/shared/types'
import { FuncionarioTimeline } from './FuncionarioTimeline'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'
import { obtenerHistorialCaso } from '@/features/tickets'

interface FuncionarioCaseDetailProps {
  solicitud: Solicitud
  onOpenPreview: (url: string) => void
  onSendReply?: (solicitudId: string, mensaje: string) => Promise<void>
  onConfirmSolution?: (solicitudId: string) => Promise<void>
}

// Formateador amigable de fecha
function formatHumanDateTime(dateStr?: string): { formatted: string; relative: string } {
  if (!dateStr) return { formatted: 'Reciente', relative: 'hace poco' }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return { formatted: dateStr, relative: '' }

  const formatted = d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  let relative = 'hace unos momentos'
  if (diffDays > 0) relative = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  else if (diffHours > 0) relative = `hace ${diffHours} h`
  else if (diffMin > 0) relative = `hace ${diffMin} min`

  return { formatted, relative }
}

export function FuncionarioCaseDetail({
  solicitud,
  onOpenPreview,
  onSendReply,
  onConfirmSolution,
}: FuncionarioCaseDetailProps): ReactNode {
  const [replyMessage, setReplyMessage] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState(false)
  const [liveHistorial, setLiveHistorial] = useState<SolicitudHistorialEvent[] | null>(null)
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  // Carga y sincronización en tiempo real del historial inmutable
  const fetchLiveHistorial = async () => {
    if (!solicitud?._id) return
    setLoadingHistorial(true)
    try {
      const items = await obtenerHistorialCaso(solicitud._id)
      setLiveHistorial(items)
    } catch (err) {
      console.error('Error fetching case history:', err)
    } finally {
      setLoadingHistorial(false)
    }
  }

  useEffect(() => {
    if (isTimelineDrawerOpen && solicitud?._id) {
      void fetchLiveHistorial()
    }
  }, [isTimelineDrawerOpen, solicitud?._id])

  useEffect(() => {
    const handleTicketLiveUpdate = (ev: Event) => {
      const customEv = ev as CustomEvent
      if (
        isTimelineDrawerOpen &&
        solicitud?._id &&
        (!customEv.detail?.solicitudId || customEv.detail?.solicitudId === solicitud._id)
      ) {
        void fetchLiveHistorial()
      }
    }
    window.addEventListener('ticket:updated', handleTicketLiveUpdate)
    return () => {
      window.removeEventListener('ticket:updated', handleTicketLiveUpdate)
    }
  }, [isTimelineDrawerOpen, solicitud?._id])

  // Objeto de solicitud enriquecido con el historial real en vivo
  const enrichedSolicitud: Solicitud = {
    ...solicitud,
    historial: liveHistorial || solicitud.historial,
  }

  const estado = (solicitud.estado || '').toLowerCase().trim()
  const isEsperandoUsuario = estado === 'esperando_usuario' || estado === 'requiere_informacion'
  // En el ciclo de vida institucional:
  // 'resuelto' / 'finalizado' = El técnico terminó y espera visto bueno del funcionario
  // 'cerrado' = El funcionario ya dio visto bueno (o se formalizó el cierre)
  const isCerrado = estado === 'cerrado'
  const isResuelto = estado === 'resuelto' || estado === 'finalizado'
  const canConfirm = isResuelto && !isCerrado && (solicitud.capabilities?.canConfirm !== false)
  const isEnAtencion = estado === 'en_progreso' || estado === 'en_atencion'
  const isAsignado = estado === 'asignado'

  // Encontrar la descripción de solución real (desde historial de workflow v2 o solucion legacy)
  const resolvedEvent = solicitud.historial?.slice().reverse().find((h: any) => h.type === 'resolved' || h.type === 'closed')
  const partialEvent = solicitud.historial?.slice().reverse().find((h: any) => h.type === 'partial_solution')
  const solucionText = (solicitud.solucion && typeof solicitud.solucion === 'object' && (solicitud.solucion as any).descripcionSolucion)
    || resolvedEvent?.message
    || partialEvent?.message
    || ''

  const { formatted: formattedDate, relative: relativeTime } = formatHumanDateTime(solicitud.fecha)

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !onSendReply) return
    setIsSubmittingReply(true)
    try {
      await onSendReply(solicitud._id, replyMessage.trim())
      setReplyMessage('')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleConfirmSubmit = async () => {
    if (!onConfirmSolution) return
    setIsConfirming(true)
    try {
      await onConfirmSolution(solicitud._id)
    } finally {
      setIsConfirming(false)
    }
  }

  // Lógica de producto de 4 fases y su estado dinámico
  // Fase 1: Radicación (Recibido)
  // Fase 2: Asignación (Técnico asignado)
  // Fase 3: En Atención (Intervención técnica o espera de usuario)
  // Fase 4: Solucionado (Resuelto / Pendiente visto bueno / Cerrado con visto bueno)
  const getStepStatus = (stepNum: number): 'completed' | 'current' | 'waiting' => {
    if (isCerrado) {
      return 'completed' // En cerrado, todas las fases 1, 2, 3 y 4 fueron completadas
    }
    if (isResuelto) {
      if (stepNum < 4) return 'completed'
      if (stepNum === 4) return 'current' // Fase 4 activa: requiere visto bueno
      return 'waiting'
    }
    if (isEnAtencion || isEsperandoUsuario) {
      if (stepNum < 3) return 'completed'
      if (stepNum === 3) return 'current'
      return 'waiting'
    }
    if (isAsignado) {
      if (stepNum === 1) return 'completed'
      if (stepNum === 2) return 'current'
      return 'waiting'
    }
    // Estado inicial: solicitado / nuevo / pendiente
    if (stepNum === 1) return 'current'
    return 'waiting'
  }

  // Paleta armónica y de alto contraste por etapa del ciclo de vida:
  // 1: Radicación -> Azul Institucional SENA (#04324d) - Entrada formal
  // 2: Asignación -> Violeta / Púrpura sobrio - Designación técnica
  // 3: En Atención -> Ámbar cálido / Naranja tecnológico - Intervención activa en campo
  // 4: Solucionado -> Verde Esmeralda SENA (#39A900) - Resolución y conformidad
  const stepsConfig = [
    {
      num: 1,
      title: 'Radicación',
      subtitle: 'Recibido en Mesa TIC',
      icon: 'description',
      activeColor: {
        border: 'border-[#04324d]/30 ring-1 ring-[#04324d]/20',
        bg: 'bg-sky-50/60',
        badge: 'bg-[#04324d] text-white',
        text: 'text-[#04324d]',
        dot: 'bg-[#04324d]',
      },
      completedColor: {
        border: 'border-slate-200/90',
        bg: 'bg-slate-50/70',
        badge: 'bg-slate-700 text-white',
        text: 'text-slate-800',
        dot: 'bg-slate-400',
      },
    },
    {
      num: 2,
      title: 'Asignación',
      subtitle: solicitud.tecnico && typeof solicitud.tecnico === 'object' && solicitud.tecnico.nombre
        ? `${solicitud.tecnico.nombre.split(' ')[0]}`
        : 'Técnico especialista',
      icon: 'engineering',
      activeColor: {
        border: 'border-purple-300 ring-1 ring-purple-300/40',
        bg: 'bg-purple-50/70',
        badge: 'bg-purple-700 text-white',
        text: 'text-purple-950',
        dot: 'bg-purple-600',
      },
      completedColor: {
        border: 'border-purple-200/80',
        bg: 'bg-purple-50/30',
        badge: 'bg-purple-600 text-white',
        text: 'text-purple-900',
        dot: 'bg-purple-500',
      },
    },
    {
      num: 3,
      title: 'En Atención',
      subtitle: isEsperandoUsuario
        ? 'Esperando tu respuesta'
        : 'Intervención y pruebas',
      icon: isEsperandoUsuario ? 'contact_support' : 'handyman',
      activeColor: {
        border: isEsperandoUsuario
          ? 'border-amber-400 ring-1 ring-amber-400/50'
          : 'border-amber-300 ring-1 ring-amber-300/40',
        bg: 'bg-amber-50/80',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-950',
        dot: 'bg-amber-500',
      },
      completedColor: {
        border: 'border-amber-200/70',
        bg: 'bg-amber-50/30',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-900',
        dot: 'bg-amber-500',
      },
    },
    {
      num: 4,
      title: isCerrado ? 'Cerrado' : 'Solucionado',
      subtitle: isCerrado
        ? 'Visto bueno otorgado'
        : isResuelto
        ? 'Esperando tu visto bueno'
        : 'Validación y cierre',
      icon: 'verified',
      activeColor: {
        border: 'border-emerald-400 ring-1 ring-emerald-400/50',
        bg: 'bg-emerald-50/80',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-950',
        dot: 'bg-emerald-500',
      },
      completedColor: {
        border: 'border-emerald-200/80',
        bg: 'bg-emerald-50/40',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-900',
        dot: 'bg-emerald-500',
      },
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden transition-all duration-300">
      
      {/* ========================================================= */}
      {/* 1. HERO HEADER: Portada del Expediente (Bento Grid Funcionario) */}
      {/* ========================================================= */}
      {(() => {
        const parsedJob = parseEnrichedDescription(solicitud.descripcion)
        const symptom = detectVisualSymptom(parsedJob, solicitud.descripcion)
        const isAtencionPublico = parsedJob.impactoServicio === 'atencion_publico'
        const isExpress = parsedJob.modoExpress
        const codigo = solicitud.codigoCaso || solicitud._id.slice(-6)
        const rawTitle = parsedJob.rawDescription || solicitud.descripcion

        // Desduplicación y jerarquía de ubicación física ingresada por el usuario (Aula / Oficina / Puesto)
        const baseAmbiente = solicitud.ambiente?.nombre?.trim() || ''
        const oficina = parsedJob.oficina?.trim() || ''
        const puesto = parsedJob.puesto?.trim() || ''
        const isOficinaSame = oficina && baseAmbiente.toLowerCase().includes(oficina.toLowerCase())
        const ubicacionPrincipal = isOficinaSame || !oficina ? (baseAmbiente || 'Sede CTPI') : `${baseAmbiente} · ${oficina}`

        return (
          <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200 space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Tarjeta A (8 Cols): Identificador, Estado del Caso, Fecha y Requerimiento Principal */}
              <div className="md:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(codigo)
                        setCopiedCode(true)
                        setTimeout(() => setCopiedCode(false), 2000)
                      }}
                      title="Copiar radicado para seguimiento"
                      className="group flex items-center gap-1.5 font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-azul-sena shadow-2xs hover:border-azul-sena/40 hover:bg-blue-50/40 transition-all cursor-pointer active:scale-95"
                    >
                      <span>#{codigo}</span>
                      <span className={`material-symbols-outlined !text-[13px] transition-transform ${
                        copiedCode ? 'text-emerald-600 scale-110' : 'text-slate-400 group-hover:text-azul-sena'
                      }`}>
                        {copiedCode ? 'check' : 'content_copy'}
                      </span>
                      {copiedCode && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">¡Copiado!</span>
                      )}
                    </button>
                    <StatusBadge status={solicitud.estado} />
                    {isEnAtencion && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2 py-0.5 rounded-full shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                        <span>En atención activa</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <span className="material-symbols-outlined !text-[13px]">schedule</span>
                    <span>Radicado {formattedDate}</span>
                    {relativeTime && (
                      <span className="text-slate-400 font-normal hidden sm:inline">({relativeTime})</span>
                    )}
                  </div>
                </div>

                <h1 className="font-jakarta text-base sm:text-[20px] font-extrabold text-slate-900 tracking-[-0.025em] leading-snug break-words">
                  {rawTitle}
                </h1>
              </div>

              {/* Tarjeta B (4 Cols): Síntoma y Diagnóstico Inicial Reportado */}
              <div className="md:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                    Síntoma Diagnosticado
                  </span>
                  <span className="text-[10px] font-bold text-azul-sena bg-blue-50 px-2 py-0.5 rounded-full">
                    Mesa TIC
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200 text-azul-sena flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined !text-[20px]">{symptom.icono}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-jakarta text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {symptom.titulo}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      {symptom.tag}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Inferior Bento: Lugar Reportado (Aula / Oficina / Puesto) y Nivel de Prioridad */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs">
              {/* Ubicación Física Exacta Ingresada por el Funcionario */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined !text-[16px] text-emerald-600">apartment</span>
                <span className="font-bold text-slate-800">{ubicacionPrincipal}</span>
                {puesto && (
                  <span className="text-slate-400 font-medium">
                    · {puesto.startsWith('Puesto') || puesto.startsWith('Ventanilla') ? puesto : `Puesto ${puesto}`}
                  </span>
                )}
              </div>

              {/* Badges de Impacto / Prioridad sin rectángulos pesados */}
              <div className="flex items-center gap-3 shrink-0">
                {isAtencionPublico ? (
                  <div className="inline-flex items-center gap-1.5 font-black text-amber-700">
                    <span className="material-symbols-outlined !text-[16px] text-amber-600">emergency</span>
                    <span>Atención al Público Prioritaria</span>
                  </div>
                ) : isExpress ? (
                  <div className="inline-flex items-center gap-1.5 font-black text-rose-700">
                    <span className="material-symbols-outlined !text-[16px] text-rose-600">bolt</span>
                    <span>Clase Presencial en Vivo</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Soporte Estándar SENA CTPI</span>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      <div className="p-4 sm:p-7 space-y-5 sm:space-y-7">
        
        {/* ========================================================= */}
        {/* 2. HERO STATUS BANNER: Qué ocurre y cuál es el siguiente paso */}
        {/* ========================================================= */}
        {isEsperandoUsuario ? (
          <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                <span className="material-symbols-outlined !text-[24px]">contact_support</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 font-mono">
                    Atención Requerida ·
                  </span>
                  <span className="text-xs font-bold text-amber-900">El técnico necesita tu respuesta</span>
                </div>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {solicitud.proximaAccion ||
                    'El especialista ha dejado una consulta o requiere datos adicionales de tu equipo para continuar con la atención.'}
                </p>
              </div>
            </div>

            {onSendReply && (
              <form onSubmit={handleReplySubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Escribe aquí tu aclaración o información adicional..."
                    className="w-full rounded-xl border border-amber-300/80 bg-white p-3 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-azul-sena focus:ring-2 focus:ring-azul-sena/20 transition-all outline-none shadow-2xs"
                    disabled={isSubmittingReply}
                  />
                  {replyMessage.trim() && (
                    <button
                      type="button"
                      onClick={() => setReplyMessage('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined !text-[16px]">close</span>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!replyMessage.trim() || isSubmittingReply}
                  className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex h-6 w-6 rounded-lg bg-white/20 items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
                    {isSubmittingReply ? (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined !text-[15px] text-white">send</span>
                    )}
                  </span>
                  <span className="tracking-tight">
                    {isSubmittingReply ? 'Enviando...' : 'Enviar respuesta'}
                  </span>
                </button>
              </form>
            )}
          </div>
        ) : isCerrado ? (
          <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/30 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm ring-4 ring-emerald-100">
                  <span className="material-symbols-outlined !text-[24px]">verified</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 font-mono">
                      Caso Cerrado & Formalizado ·
                    </span>
                    <span className="text-xs font-bold text-emerald-800">Visto bueno otorgado</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">
                    Solución Técnica Verificada y Aprobada
                  </h3>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-black shrink-0 self-start sm:self-center">
                <span className="material-symbols-outlined !text-[18px] text-emerald-700">check_circle</span>
                <span>Cierre formalizado</span>
              </div>
            </div>

            {/* Ficha de Solución Inmediata sin Scroll */}
            <div className="rounded-xl border border-emerald-200/80 bg-white/90 p-4 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 font-mono">
                <span className="material-symbols-outlined !text-[15px] text-emerald-600">task_alt</span>
                Detalle del Trabajo Realizado por el Especialista:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {solucionText || 'Intervención técnica concluida exitosamente con pruebas operativas en el ambiente.'}
              </p>
            </div>
          </div>
        ) : isResuelto ? (
          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <span className="material-symbols-outlined !text-[24px]">task_alt</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 font-mono">
                      Solución Técnica Lista ·
                    </span>
                    <span className="text-xs font-bold text-emerald-900">Requiere tu validación</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">
                    El técnico especialista completó las labores en tu equipo
                  </h3>
                </div>
              </div>

              {onConfirmSolution && canConfirm && (
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isConfirming}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-verde-sena to-[#2e8800] hover:from-[#329600] hover:to-[#277400] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex h-6 w-6 rounded-lg bg-white/20 items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {isConfirming ? (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined !text-[16px] text-white">verified</span>
                    )}
                  </span>
                  <span className="tracking-tight">
                    {isConfirming ? 'Registrando visto bueno...' : 'Dar visto bueno'}
                  </span>
                </button>
              )}
            </div>

            {/* Ficha de Solución Inmediata sin Scroll */}
            <div className="rounded-xl border border-emerald-300/80 bg-white p-4 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 font-mono">
                <span className="material-symbols-outlined !text-[15px] text-emerald-600">engineering</span>
                Trabajo realizado reportado por el técnico:
              </span>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                {solucionText || 'Intervención técnica concluida exitosamente con pruebas operativas. Por favor verifica el funcionamiento de tu equipo.'}
              </p>
            </div>
          </div>
        ) : isEnAtencion ? (
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-white p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined !text-[24px] animate-pulse">handyman</span>
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-azul-sena font-mono">
                  Atención en Sitio Activa
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                El técnico especialista se encuentra diagnosticando o interviniendo los equipos en tu ambiente.
              </p>
              {/* OPP-5: Próxima Acción & ETA en Vivo del Técnico */}
              {solicitud.proximaAccion ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-azul-sena shadow-2xs">
                  <span className="material-symbols-outlined !text-[18px] text-blue-600 shrink-0">near_me</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-800 font-mono">Estado Actual de Campo:</p>
                    <p className="text-xs font-bold text-slate-800 break-words">{solicitud.proximaAccion}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Mantente atento a cualquier prueba operativa requerida.</p>
              )}
            </div>
          </div>
        ) : isAsignado ? (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-white p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined !text-[24px]">engineering</span>
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 font-mono">
                Especialista Designado
              </span>
              <p className="text-sm font-bold text-slate-900">
                El caso ya tiene técnico encargado y está programando su arribo al ambiente.
              </p>
              {/* OPP-5: ETA en Asignado */}
              {solicitud.proximaAccion ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 shadow-2xs">
                  <span className="material-symbols-outlined !text-[18px] text-indigo-600 shrink-0">schedule</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-800 font-mono">Próxima Acción Programada:</p>
                    <p className="text-xs font-bold text-slate-800 break-words">{solicitud.proximaAccion}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Puedes contactar al especialista directamente con los datos a continuación.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 flex items-center gap-4 shadow-2xs">
            <div className="h-11 w-11 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined !text-[24px]">inbox</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 font-mono">
                Recepción & Programación
              </span>
              <p className="text-sm font-bold text-slate-900">
                Tu solicitud está en la Mesa de Ayuda TIC para asignación de especialista según disponibilidad en la sede.
              </p>
              <p className="text-xs text-slate-500">Te notificaremos en cuanto el Líder asigne al técnico de campo.</p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. CONTEXT CARDS: Especialista asignado + Ubicación física */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Ficha Especialista Asignado */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                <span className="material-symbols-outlined !text-[16px] text-azul-sena">support_agent</span>
                Especialista Asignado
              </span>
              {solicitud.tecnico && typeof solicitud.tecnico === 'object' ? (
                <span className="text-[11px] font-bold text-emerald-700 tracking-tight flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  En Guardia
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 tracking-tight">
                  Pendiente
                </span>
              )}
            </div>

            {solicitud.tecnico && typeof solicitud.tecnico === 'object' ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-azul-sena text-white font-black flex items-center justify-center text-sm shadow-sm">
                    {(solicitud.tecnico.nombre || 'T')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {solicitud.tecnico.nombre}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {solicitud.tecnico.telefono ? `Cel: ${solicitud.tecnico.telefono}` : 'Técnico Soporte CTPI'}
                    </p>
                  </div>
                </div>

                {solicitud.tecnico.telefono && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${solicitud.tecnico.telefono}`}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-azul-sena hover:bg-azul-sena hover:text-white hover:border-azul-sena transition-all shadow-2xs cursor-pointer flex items-center justify-center active:scale-95"
                      title="Llamar al técnico"
                    >
                      <span className="material-symbols-outlined !text-[18px]">call</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-500 py-2">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined !text-[20px]">hourglass_top</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">En proceso de asignación</p>
                  <p className="text-[11px] text-slate-400">El Líder TIC designará al especialista disponible</p>
                </div>
              </div>
            )}
          </div>

          {/* Ficha Ambiente y Ubicación Física Enriquecida */}
          {(() => {
            const parsedLocation = parseEnrichedDescription(solicitud.descripcion)
            const oficinaName = parsedLocation.oficina?.trim()
            const puestoName = parsedLocation.puesto?.trim()
            const baseAmb = solicitud.ambiente?.nombre || 'General'
            const isOficinaSame = oficinaName && baseAmb.toLowerCase().includes(oficinaName.toLowerCase())
            const displayTitle = isOficinaSame || !oficinaName ? baseAmb : `${baseAmb} · ${oficinaName}`

            return (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                    <span className="material-symbols-outlined !text-[16px] text-emerald-600">apartment</span>
                    Ambiente de Formación / Oficina
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 tracking-tight">
                    Soporte en Sitio
                  </span>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black flex items-center justify-center text-xs shadow-2xs shrink-0 mt-0.5">
                    CTPI
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-black text-slate-900 tracking-tight truncate">
                      {displayTitle}
                    </p>
                    
                    {/* Detalle exacto de puesto o ventanilla */}
                    {puestoName ? (
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined !text-[14px] text-azul-sena">desktop_windows</span>
                        <span>{puestoName.startsWith('Puesto') || puestoName.startsWith('Ventanilla') ? puestoName : `Puesto: ${puestoName}`}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">Sede Central CTPI · Soporte Técnico en Sitio</p>
                    )}

                    {/* Metadata académica complementaria (Ficha y Jornada) */}
                    {(parsedLocation.ficha || parsedLocation.jornada) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                        {parsedLocation.ficha && (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[13px] text-slate-400">school</span>
                            Ficha: {parsedLocation.ficha}
                          </span>
                        )}
                        {parsedLocation.jornada && (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[13px] text-amber-500">wb_sunny</span>
                            Jornada: {parsedLocation.jornada}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* ========================================================= */}
        {/* EVIDENCIA ADJUNTA GANADORA DEFINITIVA: SPLIT CLEAN        */}
        {/* ========================================================= */}
        {solicitud.foto && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Lado A: Objeto y Propósito Técnico */}
              <div className="md:col-span-7 xl:col-span-8 p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 text-azul-sena flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined !text-[18px]">photo_library</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                        Archivo de Evidencia
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        Inspección Gráfica del Equipo
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    Imagen de soporte adjuntada para validar error o daño reportado. Puedes abrir el visor en alta definición en cualquier momento.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenPreview(solicitud.foto?.url || '')}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-azul-sena hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-[16px]">visibility</span>
                    <span>Abrir en pantalla completa</span>
                  </button>
                </div>
              </div>

              {/* Lado B: Visor Interactivo Integrado */}
              <div className="md:col-span-5 xl:col-span-4 p-3.5 bg-slate-50/70 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onOpenPreview(solicitud.foto?.url || '')}
                  className="group relative w-full h-32 sm:h-36 md:h-28 xl:h-32 rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                  title="Clic para inspeccionar"
                >
                  <img
                    src={solicitud.foto?.url}
                    alt="Evidencia adjunta"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold backdrop-blur-2xs">
                    <span className="material-symbols-outlined !text-[16px]">zoom_in</span>
                    <span>Ampliar</span>
                  </div>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECCIÓN TRAZABILIDAD (Con botón disparador según A/B)     */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 space-y-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-azul-sena font-mono">
                  Trazabilidad ·
                </span>
                <h3 className="text-sm font-black text-slate-900">Ciclo de Vida del Requerimiento</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Progreso de atención y etapas completadas</p>
            </div>

            {/* BOTÓN DISPARADOR CANÓNICO: HISTORIAL EN STEPPER SINCRONIZADO */}
            <button
              type="button"
              onClick={() => setIsTimelineDrawerOpen(true)}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-black text-xs transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined !text-[17px] text-emerald-700">history_edu</span>
              <span>Ver Historial del Caso</span>
            </button>
          </div>

          {/* Stepper inteligente: 2x2 en móviles y laptops compactas (1280x800), 4 columnas en monitores grandes (>= 1280px con sidebar expandido) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {stepsConfig.map((st) => {
              const status = getStepStatus(st.num)
              const isCompleted = status === 'completed'
              const isCurrent = status === 'current'

              const currentStyle = isCurrent
                ? st.activeColor
                : isCompleted
                ? st.completedColor
                : {
                    border: 'border-slate-100',
                    bg: 'bg-slate-50/50 opacity-60',
                    badge: 'bg-slate-200 text-slate-500',
                    text: 'text-slate-500',
                    icon: 'text-slate-400',
                  }

              return (
                <div
                  key={st.num}
                  onClick={() => setIsTimelineDrawerOpen(true)}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer hover:ring-2 hover:ring-azul-sena/40 hover:scale-[1.02] ${currentStyle.border} ${currentStyle.bg}`}
                  title="Clic para abrir el historial en este hito"
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs shrink-0 ${currentStyle.badge}`}
                      >
                        {isCompleted ? '✓' : st.num}
                      </div>
                      <span className={`text-xs font-black tracking-tight ${currentStyle.text}`}>
                        {st.title}
                      </span>
                    </div>

                    <span
                      className={`material-symbols-outlined !text-[16px] shrink-0 ${
                        isCurrent
                          ? currentStyle.text
                          : isCompleted
                          ? 'text-slate-500'
                          : 'text-slate-300'
                      }`}
                    >
                      {st.icon}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    {st.subtitle}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DRAWER CANÓNICO: STEPPER SINCRONIZADO                                     */}
        {/* ========================================================================= */}
        {isTimelineDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 sm:p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">sync</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">Historial Sincronizado</h3>
                      <p className="text-[11px] sm:text-xs text-slate-500">Mapeado con el stepper de 4 etapas</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTimelineDrawerOpen(false)}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined !text-[20px]">close</span>
                  </button>
                </div>

                {/* Micro-Stepper dentro del Header del Drawer */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-1">
                  {stepsConfig.map((s) => {
                    const isDone = getStepStatus(s.num) === 'completed'
                    const isCurr = getStepStatus(s.num) === 'current'
                    return (
                      <div
                        key={s.num}
                        className={`p-1 sm:p-1.5 rounded-lg text-center text-[9px] sm:text-[10px] font-bold border transition-all ${
                          isCurr
                            ? 'bg-white border-emerald-400 text-emerald-800 shadow-2xs font-black'
                            : isDone
                            ? 'bg-emerald-100/70 border-emerald-200 text-emerald-800'
                            : 'bg-slate-100/60 border-slate-200/60 text-slate-400'
                        }`}
                      >
                        <span className="block truncate">
                          {s.num}. {s.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 hairline-scrollbar">
                {loadingHistorial && !liveHistorial ? (
                  <div className="flex items-center justify-center p-8 space-x-2 text-slate-500">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span className="text-xs font-bold">Sincronizando historial en tiempo real...</span>
                  </div>
                ) : (
                  <FuncionarioTimeline
                    solicitud={enrichedSolicitud}
                    onOpenPreview={onOpenPreview}
                  />
                )}
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Trazabilidad Institucional SENA
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimelineDrawerOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer text-center"
                >
                  Cerrar Historial
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
