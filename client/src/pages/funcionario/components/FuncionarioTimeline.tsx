import { useMemo } from 'react'
import type { Solicitud, SolicitudHistorialEvent } from '@/shared/types'
import { parseEnrichedDescription } from '@/shared/utils/ticketContext'
import { useAuth } from '@/features/auth'
import { resolveTimelineActor } from '@/features/tickets/utils/timeline-identity'

export type TimelineCardVariant = 'control'

export interface FuncionarioTimelineProps {
  solicitud: Solicitud
  onOpenPreview?: (url: string) => void
  filter?: 'all' | 'milestones' | 'notes'
  cardVariant?: TimelineCardVariant
}

export type AuthorParty = 'mine' | 'mesa' | 'tecnico' | 'system' | 'unknown'

interface EnrichedTimelineItem {
  id: string
  type: string
  title: string
  message: string
  createdAt?: string
  authorName: string
  authorRole: string
  initials: string
  icon: string
  party: AuthorParty
  partyLabel: string
  isMine: boolean
  isCurrentUser: boolean
  isRequesterParty: boolean
  colorClasses: {
    node: string
    badge: string
    bg: string
    border: string
    text: string
  }
  attachmentUrl?: string
  nextAction?: string
  whatWasDone?: string
  isLatest?: boolean
}

// Iconografía, estilos y colores semánticos por tipo de evento
function getEventVisualConfig(type: string) {
  switch (type) {
    case 'created':
      return {
        icon: 'description',
        colorClasses: {
          node: 'bg-[#04324d] text-white ring-4 ring-[#04324d]/10',
          badge: 'bg-sky-100 text-[#04324d]',
          bg: 'bg-sky-50/40',
          border: 'border-sky-200/80',
          text: 'text-[#04324d]',
        },
      }
    case 'assigned':
    case 'reassigned':
      return {
        icon: 'engineering',
        colorClasses: {
          node: 'bg-purple-600 text-white ring-4 ring-purple-100',
          badge: 'bg-purple-100 text-purple-800',
          bg: 'bg-purple-50/40',
          border: 'border-purple-200/80',
          text: 'text-purple-900',
        },
      }
    case 'started':
      return {
        icon: 'handyman',
        colorClasses: {
          node: 'bg-blue-600 text-white ring-4 ring-blue-100',
          badge: 'bg-blue-100 text-blue-800',
          bg: 'bg-blue-50/40',
          border: 'border-blue-200/80',
          text: 'text-blue-900',
        },
      }
    case 'en_camino':
      return {
        icon: 'directions_run',
        colorClasses: {
          node: 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse',
          badge: 'bg-indigo-100 text-indigo-900 font-bold',
          bg: 'bg-indigo-50/50',
          border: 'border-indigo-300',
          text: 'text-indigo-950',
        },
      }
    case 'updated':
      return {
        icon: 'edit_note',
        colorClasses: {
          node: 'bg-teal-600 text-white ring-4 ring-teal-100',
          badge: 'bg-teal-100 text-teal-800',
          bg: 'bg-teal-50/40',
          border: 'border-teal-200/80',
          text: 'text-teal-900',
        },
      }
    case 'waiting_for_requester':
      return {
        icon: 'contact_support',
        colorClasses: {
          node: 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse',
          badge: 'bg-amber-100 text-amber-900',
          bg: 'bg-amber-50/50',
          border: 'border-amber-300',
          text: 'text-amber-950',
        },
      }
    case 'requester_reply':
      return {
        icon: 'send',
        colorClasses: {
          node: 'bg-indigo-600 text-white ring-4 ring-indigo-100',
          badge: 'bg-indigo-100 text-indigo-900',
          bg: 'bg-indigo-50/40',
          border: 'border-indigo-200',
          text: 'text-indigo-950',
        },
      }
    case 'partial_solution':
      return {
        icon: 'construction',
        colorClasses: {
          node: 'bg-amber-600 text-white ring-4 ring-amber-100',
          badge: 'bg-amber-100 text-amber-900',
          bg: 'bg-amber-50/40',
          border: 'border-amber-200',
          text: 'text-amber-900',
        },
      }
    case 'resolved':
      return {
        icon: 'task_alt',
        colorClasses: {
          node: 'bg-emerald-600 text-white ring-4 ring-emerald-100',
          badge: 'bg-emerald-100 text-emerald-900',
          bg: 'bg-emerald-50/50',
          border: 'border-emerald-300',
          text: 'text-emerald-950',
        },
      }
    case 'closed':
      return {
        icon: 'verified',
        colorClasses: {
          node: 'bg-emerald-700 text-white ring-4 ring-emerald-200',
          badge: 'bg-emerald-200 text-emerald-900',
          bg: 'bg-emerald-50/70',
          border: 'border-emerald-400',
          text: 'text-emerald-950',
        },
      }
    case 'reopened':
      return {
        icon: 'replay',
        colorClasses: {
          node: 'bg-rose-600 text-white ring-4 ring-rose-100',
          badge: 'bg-rose-100 text-rose-800',
          bg: 'bg-rose-50/40',
          border: 'border-rose-200',
          text: 'text-rose-950',
        },
      }
    case 'cancelled':
      return {
        icon: 'cancel',
        colorClasses: {
          node: 'bg-slate-500 text-white ring-4 ring-slate-100',
          badge: 'bg-slate-100 text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-800',
        },
      }
    default:
      return {
        icon: 'info',
        colorClasses: {
          node: 'bg-slate-600 text-white ring-4 ring-slate-100',
          badge: 'bg-slate-100 text-slate-700',
          bg: 'bg-slate-50/60',
          border: 'border-slate-200',
          text: 'text-slate-800',
        },
      }
  }
}


function formatRelativeOrAbsoluteTime(rawDate?: string): { time: string; humanDay: string } {
  if (!rawDate) return { time: '', humanDay: '' }
  const d = new Date(rawDate)
  if (isNaN(d.getTime())) return { time: '', humanDay: '' }

  const now = new Date()
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()

  const time = d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  let humanDay = ''
  if (isToday) {
    humanDay = 'Hoy'
  } else if (isYesterday) {
    humanDay = 'Ayer'
  } else {
    humanDay = d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  return { time, humanDay }
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'TIC'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function FuncionarioTimeline({
  solicitud,
  onOpenPreview,
  filter = 'all',
}: FuncionarioTimelineProps) {
  const { user } = useAuth()
  const currentUserId = user?._id || (user as unknown as { id?: string })?.id

  // Construcción unificada y sintética de eventos con reconocimiento de identidad (Tú vs Soporte)
  const timelineItems: EnrichedTimelineItem[] = useMemo(() => {
    const rawEvents: SolicitudHistorialEvent[] = solicitud.historial || []

    // Identificador del funcionario dueño del ticket
    const solUserId = typeof solicitud.usuario === 'object' && solicitud.usuario !== null && '_id' in solicitud.usuario
      ? (solicitud.usuario as { _id?: string })._id
      : typeof solicitud.usuario === 'string'
      ? solicitud.usuario
      : undefined

    const solUserName = typeof solicitud.usuario === 'object' && solicitud.usuario?.nombre
      ? solicitud.usuario.nombre
      : 'Funcionario Solicitante'

    const tecnicoName = typeof solicitud.tecnico === 'object' && solicitud.tecnico?.nombre
      ? solicitud.tecnico.nombre
      : undefined

    // 1. Si existen eventos reales registrados en la BD por el workflow:
    if (rawEvents.length > 0) {
      return rawEvents.map((evt, idx) => {
        const actorMeta = resolveTimelineActor({
          event: evt,
          solicitud,
          currentUser: user || null,
        })

        // Si es el evento de inicio y la solicitud tiene foto inicial, o de solución y tiene evidencia:
        let attachmentUrl = evt.attachment?.url
        if (!attachmentUrl && evt.type === 'created' && solicitud.foto?.url) {
          attachmentUrl = solicitud.foto.url
        }
        if (
          !attachmentUrl &&
          evt.type === 'resolved' &&
          typeof solicitud.solucion === 'object' &&
          solicitud.solucion?.evidencia?.url
        ) {
          attachmentUrl = solicitud.solucion.evidencia.url
        }

        const effectiveType = evt.type
        const effectiveVisual = getEventVisualConfig(effectiveType)

        return {
          id: evt._id || `evt-${idx}`,
          type: effectiveType,
          title: actorMeta.eventTitle,
          message: evt.message,
          createdAt: evt.createdAt,
          authorName: actorMeta.authorDisplayName,
          authorRole: actorMeta.authorRole,
          initials: getInitials(actorMeta.authorDisplayName),
          icon: actorMeta.icon || effectiveVisual.icon,
          party: actorMeta.party,
          partyLabel: actorMeta.partyLabel,
          isMine: actorMeta.isRequesterParty,
          isCurrentUser: actorMeta.isCurrentUser,
          isRequesterParty: actorMeta.isRequesterParty,
          colorClasses: effectiveVisual.colorClasses,
          attachmentUrl,
          nextAction: evt.metadata?.nextAction,
          whatWasDone: evt.metadata?.whatWasDone,
          isLatest: idx === rawEvents.length - 1,
        }
      })
    }

    // 2. FALLBACK INTELIGENTE (Para solicitudes donde el historial aún no está desglosado en BD):
    const fallbackList: EnrichedTimelineItem[] = []

    // Hito 1: Radicación inicial (Siempre del funcionario solicitante)
    const createdVisual = getEventVisualConfig('created')
    const isCurrentUserCreator = user?.rol === 'funcionario' || (Boolean(currentUserId) && currentUserId === solUserId)

    fallbackList.push({
      id: 'fb-created',
      type: 'created',
      title: 'Solicitud Radicada',
      message:
        solicitud.descripcion ||
        'La solicitud fue registrada en la Mesa de Ayuda TIC para diagnóstico.',
      createdAt: solicitud.fecha,
      authorName: solUserName,
      authorRole: 'Funcionario',
      initials: getInitials(solUserName),
      icon: createdVisual.icon,
      party: 'mine',
      partyLabel: isCurrentUserCreator ? 'Tú (Solicitante)' : 'Parte Solicitante',
      isMine: true,
      isCurrentUser: isCurrentUserCreator,
      isRequesterParty: true,
      colorClasses: createdVisual.colorClasses,
      attachmentUrl: solicitud.foto?.url,
    })

    // Hito 2: Asignación técnica
    if (solicitud.tecnico && typeof solicitud.tecnico === 'object' && solicitud.tecnico.nombre) {
      const assignVisual = getEventVisualConfig('assigned')
      fallbackList.push({
        id: 'fb-assigned',
        type: 'assigned',
        title: 'Asignación de Especialista',
        message: `El caso fue asignado al técnico especialista ${solicitud.tecnico.nombre} para atención presencial.`,
        createdAt: solicitud.fecha,
        authorName: 'Mesa de Ayuda TIC',
        authorRole: 'Gestión Operativa',
        initials: 'TIC',
        icon: assignVisual.icon,
        party: 'mesa',
        partyLabel: 'Mesa de Ayuda TIC',
        isMine: false,
        isCurrentUser: false,
        isRequesterParty: false,
        colorClasses: assignVisual.colorClasses,
      })
    }

    // Hito 3: En Atención o Espera de respuesta
    const estado = (solicitud.estado || '').toLowerCase().trim()
    const isEsperando = estado === 'esperando_usuario' || estado === 'requiere_informacion'
    const isEnAtencion =
      estado === 'en_progreso' ||
      estado === 'en_atencion' ||
      estado === 'resuelto' ||
      estado === 'cerrado' ||
      estado === 'finalizado'

    const currentTecnicoId = typeof solicitud.tecnico === 'object' && solicitud.tecnico !== null && '_id' in solicitud.tecnico
      ? (solicitud.tecnico as { _id?: string })._id
      : undefined
    const isCurrentUserTecnico = Boolean(currentUserId) && Boolean(currentTecnicoId) && currentUserId === currentTecnicoId

    if (isEsperando) {
      const waitVisual = getEventVisualConfig('waiting_for_requester')
      fallbackList.push({
        id: 'fb-waiting',
        type: 'waiting_for_requester',
        title: 'Consulta de Campo Requerida',
        message:
          solicitud.proximaAccion ||
          'El técnico asignado solicitó confirmación o acceso físico para continuar.',
        createdAt: solicitud.fecha,
        authorName: tecnicoName || 'Técnico Especialista',
        authorRole: 'Soporte en Sitio',
        initials: tecnicoName ? getInitials(tecnicoName) : 'TC',
        icon: waitVisual.icon,
        party: 'tecnico',
        partyLabel: isCurrentUserTecnico ? 'Tú (Técnico Asignado)' : 'Técnico Asignado',
        isMine: false,
        isCurrentUser: isCurrentUserTecnico,
        isRequesterParty: false,
        colorClasses: waitVisual.colorClasses,
      })
    } else if (isEnAtencion && !isEsperando) {
      const startVisual = getEventVisualConfig('started')
      fallbackList.push({
        id: 'fb-started',
        type: 'started',
        title: 'Intervención en Sitio Iniciada',
        message:
          solicitud.proximaAccion ||
          `Técnico en ambiente ${solicitud.ambiente?.nombre || 'asignado'} ejecutando labores y diagnóstico.`,
        createdAt: solicitud.fecha,
        authorName: tecnicoName || 'Técnico Especialista',
        authorRole: 'Soporte en Sitio',
        initials: tecnicoName ? getInitials(tecnicoName) : 'TC',
        icon: startVisual.icon,
        party: 'tecnico',
        partyLabel: isCurrentUserTecnico ? 'Tú (Técnico Asignado)' : 'Técnico Asignado',
        isMine: false,
        isCurrentUser: isCurrentUserTecnico,
        isRequesterParty: false,
        colorClasses: startVisual.colorClasses,
      })
    }

    // Hito 4: Solución registrada (Técnico)
    const isResuelto = estado === 'resuelto' || estado === 'finalizado' || estado === 'cerrado'
    if (isResuelto) {
      const solVisual = getEventVisualConfig('resolved')
      const solDesc =
        typeof solicitud.solucion === 'object'
          ? solicitud.solucion?.descripcionSolucion
          : undefined
      const solFoto =
        typeof solicitud.solucion === 'object'
          ? solicitud.solucion?.evidencia?.url
          : undefined

      fallbackList.push({
        id: 'fb-resolved',
        type: 'resolved',
        title: 'Solución Técnica Aplicada',
        message:
          solDesc ||
          'Se completaron las pruebas operativas y el requerimiento quedó solucionado satisfactoriamente.',
        createdAt: solicitud.fecha,
        authorName: tecnicoName || 'Técnico Especialista',
        authorRole: 'Soporte en Sitio',
        initials: tecnicoName ? getInitials(tecnicoName) : 'TC',
        icon: solVisual.icon,
        party: 'tecnico',
        partyLabel: isCurrentUserTecnico ? 'Tú (Técnico Asignado)' : 'Técnico Asignado',
        isMine: false,
        isCurrentUser: isCurrentUserTecnico,
        isRequesterParty: false,
        colorClasses: solVisual.colorClasses,
        attachmentUrl: solFoto,
      })
    }

    // Hito 5: Visto bueno y cierre (Funcionario - PROPIO)
    if (estado === 'cerrado') {
      const closedVisual = getEventVisualConfig('closed')
      fallbackList.push({
        id: 'fb-closed',
        type: 'closed',
        title: 'Visto Bueno & Cierre Formal',
        message:
          'El funcionario otorgó el visto bueno de satisfacción y el expediente fue cerrado y archivado.',
        createdAt: solicitud.fecha,
        authorName: solUserName || 'Funcionario Solicitante',
        authorRole: 'Funcionario Solicitante',
        initials: getInitials(solUserName),
        icon: closedVisual.icon,
        party: 'mine',
        partyLabel: isCurrentUserCreator ? 'Tú (Solicitante)' : 'Parte Solicitante',
        isMine: true,
        isCurrentUser: isCurrentUserCreator,
        isRequesterParty: true,
        colorClasses: closedVisual.colorClasses,
      })
    }

    // Marcar el último elemento como el activo/más reciente
    if (fallbackList.length > 0) {
      fallbackList[fallbackList.length - 1].isLatest = true
    }

    return fallbackList
  }, [solicitud])

  const filteredItems = useMemo(() => {
    let list = timelineItems

    if (filter === 'milestones') {
      list = list.filter((i) =>
        ['created', 'assigned', 'started', 'resolved', 'closed'].includes(i.type)
      )
    } else if (filter === 'notes') {
      list = list.filter((i) =>
        ['waiting_for_requester', 'requester_reply', 'note_added', 'diagnostic_updated'].includes(i.type)
      )
    }

    return list
  }, [timelineItems, filter])

  // Deducir el estado de turno y contexto activo del caso
  const estado = (solicitud.estado || '').toLowerCase().trim()
  const isEsperando = estado === 'esperando_usuario' || estado === 'requiere_informacion'
  const isResuelto = estado === 'resuelto' || estado === 'finalizado'
  const isCerrado = estado === 'cerrado'

  const tecnicoObj = typeof solicitud.tecnico === 'object' && solicitud.tecnico !== null ? solicitud.tecnico : undefined
  const tecnicoNombre = tecnicoObj?.nombre || (timelineItems.find((i) => i.party === 'tecnico')?.authorName) || 'Técnico Especialista'
  const hasTecnicoAsignado = Boolean(solicitud.tecnico) || timelineItems.some((i) => i.party === 'tecnico')

  return (
    <div className="space-y-4">
      {/* BANNER DE TURNO ACTIVO Y CONTEXTO WORLD-CLASS */}
      <div className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-2xs ${
        isEsperando
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : isCerrado
          ? 'bg-slate-50 border-slate-200 text-slate-800'
          : isResuelto
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-blue-50/70 border-blue-200 text-slate-900'
      }`}>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
          isEsperando
            ? 'bg-amber-200 text-amber-900'
            : isCerrado
            ? 'bg-slate-200 text-slate-700'
            : isResuelto
            ? 'bg-emerald-200 text-emerald-900'
            : 'bg-blue-200/80 text-azul-sena'
        }`}>
          <span className="material-symbols-outlined !text-[18px]">
            {isEsperando ? 'priority_high' : isCerrado ? 'verified' : isResuelto ? 'task_alt' : 'engineering'}
          </span>
        </div>

        <div className="space-y-0.5 text-xs">
          <p className="font-black uppercase tracking-wider text-[11px]">
            {isEsperando
              ? (user?.rol === 'tecnico' ? 'Esperando Respuesta del Funcionario' : 'Esperando por ti')
              : isCerrado
              ? 'Caso Cerrado y Formalizado'
              : isResuelto
              ? 'Solución Técnica Aplicada'
              : hasTecnicoAsignado
              ? 'En Atención Técnica en Sitio'
              : 'En Atención por Mesa TIC'}
          </p>
          <p className="text-slate-600 leading-relaxed font-medium">
            {isEsperando
              ? (user?.rol === 'tecnico'
                  ? 'Has solicitado información o acceso físico al funcionario. La intervención se reanudará cuando el usuario responda.'
                  : 'El técnico asignado solicitó información o acceso para continuar con tu solicitud.')
              : isCerrado
              ? 'Intervención completada a entera satisfacción con visto bueno formal.'
              : isResuelto
              ? 'El técnico finalizó los trabajos y el caso cuenta con dictamen de solución.'
              : hasTecnicoAsignado
              ? `El técnico especialista ${tecnicoNombre} lidera los trabajos técnicos de tu solicitud.`
              : 'La solicitud se encuentra en cola y está siendo gestionada por la Mesa de Ayuda TIC.'}
          </p>
        </div>
      </div>

      {/* Carril principal de la línea de tiempo */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-azul-sena/40 before:via-slate-200 before:to-emerald-400">
        {filteredItems.map((item) => {
          const { time, humanDay } = formatRelativeOrAbsoluteTime(item.createdAt)

          return (
            <div key={item.id} className="relative group">
              {/* ========================================================= */}
              {/* NODO IZQUIERDO ICONOGRÁFICO                               */}
              {/* ========================================================= */}
              <div
                className={`absolute -left-[30px] sm:-left-[34px] top-1.5 h-7 w-7 sm:h-7.5 sm:w-7.5 rounded-xl flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 ${
                  item.colorClasses?.node ||
                  (item.isMine
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-azul-sena text-white ring-4 ring-sky-100')
                }`}
                title={item.title}
              >
                <span className="material-symbols-outlined !text-[15px] sm:!text-[16px]">
                  {item.icon}
                </span>
              </div>

              {/* ========================================================= */}
              {/* TARJETA CANÓNICA DEFINITIVA (LANE BORDER 4PX)            */}
              {/* ========================================================= */}
              <div
                className={`rounded-2xl border-y border-r border-l-4 bg-white p-4 sm:p-5 transition-all duration-200 shadow-2xs hover:shadow-xs ${
                  item.isMine
                    ? 'border-l-emerald-600 border-slate-200'
                    : item.type === 'en_camino'
                    ? 'border-l-indigo-600 border-indigo-200 bg-indigo-50/20'
                    : item.type === 'started'
                    ? 'border-l-blue-600 border-slate-200'
                    : item.type === 'resolved'
                    ? 'border-l-emerald-500 border-emerald-200 bg-emerald-50/20'
                    : item.type === 'waiting_for_requester'
                    ? 'border-l-amber-500 border-amber-200 bg-amber-50/30'
                    : 'border-l-[#04324d] border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* BADGE DE AUTORÍA E IDENTIDAD WORLD-CLASS */}
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs ${
                        item.isCurrentUser
                          ? 'bg-emerald-600 text-white border border-emerald-700 ring-2 ring-emerald-500/20'
                          : item.isRequesterParty
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : item.party === 'tecnico'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-slate-100 text-[#04324d] border border-slate-200'
                      }`}
                    >
                      {item.isCurrentUser && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      )}
                      <span>
                        {item.isCurrentUser
                          ? `● Tú (${item.isRequesterParty ? 'Solicitante' : 'Técnico'})`
                          : item.isRequesterParty
                          ? '● Parte Solicitante'
                          : item.party === 'tecnico'
                          ? '🛠️ Técnico Asignado'
                          : '🏢 Mesa TIC'}
                      </span>
                    </span>

                    <span className={`text-xs ${item.isCurrentUser ? 'font-black text-emerald-950' : 'font-bold text-slate-800'}`}>
                      {item.isCurrentUser ? `${item.authorName} (Tú)` : item.authorName}
                    </span>

                    <span className="text-[11px] text-slate-400 font-normal">
                      ({item.authorRole})
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    {humanDay} {time && `· ${time}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {item.title}
                  </span>
                  {item.isLatest && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                      Último avance
                    </span>
                  )}
                </div>

                {/* Badges de Contexto SENA para evento de radicación */}
                {item.type === 'created' && (() => {
                  const parsedMsg = parseEnrichedDescription(item.message)
                  return (
                    <div className="space-y-2">
                      {(parsedMsg.ficha || parsedMsg.puesto || parsedMsg.oficina || parsedMsg.jornada) && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {parsedMsg.oficina && (
                            <span className="inline-flex items-center gap-1 font-black text-emerald-950 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 text-[11px] shadow-2xs">
                              <span className="material-symbols-outlined !text-[13px]">domain</span>
                              <span>Oficina: {parsedMsg.oficina}</span>
                            </span>
                          )}
                          {parsedMsg.puesto && (
                            <span className="inline-flex items-center gap-1 font-black text-blue-900 bg-blue-100/90 px-2 py-0.5 rounded-md border border-blue-200 text-[11px] shadow-2xs">
                              <span className="material-symbols-outlined !text-[13px]">desktop_windows</span>
                              <span>{parsedMsg.puesto}</span>
                            </span>
                          )}
                          {parsedMsg.ficha && (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 text-[11px] shadow-2xs">
                              <span className="material-symbols-outlined !text-[13px]">school</span>
                              <span>Ficha: {parsedMsg.ficha}</span>
                            </span>
                          )}
                          {parsedMsg.jornada && (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] shadow-2xs">
                              <span className="material-symbols-outlined !text-[13px]">wb_sunny</span>
                              <span>Jornada {parsedMsg.jornada}</span>
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {parsedMsg.rawDescription || item.message}
                      </p>
                    </div>
                  )
                })()}

                {item.type !== 'created' && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {item.message}
                  </p>
                )}

                {item.whatWasDone && item.whatWasDone !== item.message && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">Labor realizada:</strong>
                    <span>{item.whatWasDone}</span>
                  </div>
                )}

                {item.nextAction && (
                  <div className="mt-2 p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-azul-sena flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                    <span><strong>Siguiente paso:</strong> {item.nextAction}</span>
                  </div>
                )}

                {item.attachmentUrl && renderAttachment(item.attachmentUrl, onOpenPreview)}
              </div>





            </div>
          )
        })}
      </div>
    </div>
  )
}

// Renderizador unificado del thumb de evidencia fotográfica
function renderAttachment(url: string, onOpenPreview?: (url: string) => void) {
  return (
    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
      <button
        type="button"
        onClick={() => onOpenPreview && onOpenPreview(url)}
        className="group/thumb relative h-12 w-12 rounded-xl border border-slate-200 overflow-hidden shadow-2xs cursor-pointer shrink-0 active:scale-95 transition-transform"
        title="Clic para ampliar evidencia fotográfica"
      >
        <img
          src={url}
          alt="Evidencia fotográfica del evento"
          className="h-full w-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
          <span className="material-symbols-outlined !text-[16px]">zoom_in</span>
        </div>
      </button>

      <div className="space-y-0.5">
        <p className="text-xs font-bold text-slate-800">Evidencia técnica adjunta</p>
        <button
          type="button"
          onClick={() => onOpenPreview && onOpenPreview(url)}
          className="text-[11px] font-bold text-azul-sena hover:underline cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined !text-[13px]">visibility</span>
          Ver foto en tamaño completo
        </button>
      </div>
    </div>
  )
}
