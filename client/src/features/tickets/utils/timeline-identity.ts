import type { Solicitud, SolicitudHistorialEvent, User, CaseRole } from '@/shared/types'

export type TimelineParty = 'mine' | 'tecnico' | 'mesa' | 'unknown'

export interface ResolvedTimelineActor {
  /** Indica si la acción fue ejecutada por el usuario actualmente logueado en la sesión */
  isCurrentUser: boolean
  /** Pertenece al bando del solicitante (dueño del ticket) */
  isRequesterParty: boolean
  /** Pertenece al bando del técnico asignado */
  isTechnicianParty: boolean
  /** Pertenece al bando de la Mesa de Ayuda TIC / Operador / Líder */
  isMesaParty: boolean
  /** Rol del autor dentro del caso (server-authoritative) */
  caseRole: CaseRole
  /** Bando principal sintetizado */
  party: TimelineParty
  /** Rótulo principal de bando institucional */
  partyLabel: string
  /** Subtítulo descriptivo de función institucional */
  authorRole: string
  /** Nombre visible oficial del autor */
  authorDisplayName: string
  /** Título humanamente comprensible del evento */
  eventTitle: string
  /** Ícono temático de Material Symbols */
  icon: string
  /** Configuración visual de tono de badge */
  badgeStyle: {
    containerClasses: string
    dotColor?: string
  }
}

/**
 * Normaliza cualquier variante de ID (ObjectId de Mongoose, String, objeto { _id, id })
 */
export function normalizeId(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    if (obj._id != null) return String(obj._id).trim()
    if (obj.id != null) return String(obj.id).trim()
  }
  return String(val).trim()
}

/**
 * Motor determinista y puro para resolver la identidad, rol y semántica de un evento
 * del historial. Basado estrictamente en IDs, tipo de evento y caseRole server-authoritative.
 * PROHIBIDO: heurísticas por nombre, coincidencias parciales de texto o fallback a Mesa TIC.
 */
export function resolveTimelineActor(params: {
  event: SolicitudHistorialEvent
  solicitud: Solicitud
  currentUser: User | null
}): ResolvedTimelineActor {
  const { event, solicitud, currentUser } = params

  const currentUserId = normalizeId(currentUser?._id || (currentUser as unknown as { id?: string })?.id)

  const requesterId = normalizeId(solicitud.usuario)
  const technicianId = normalizeId(solicitud.tecnico)

  // 1. Identificar autor del evento de forma estricta por ID
  const authorObj = typeof event.author === 'object' && event.author !== null
    ? (event.author as { _id?: unknown; id?: unknown; nombre?: string; rol?: string })
    : undefined
  const rawAuthorId = typeof event.author === 'string' ? event.author : authorObj?._id || authorObj?.id
  const authorId = normalizeId(rawAuthorId)
  const authorGlobalRole = (authorObj?.rol || '').toLowerCase().trim()
  const authorRawName = (authorObj?.nombre || '').trim()

  // 2. Resolver CaseRole de manera determinista
  // Si el backend ya calculó el caseRole (contrato canónico), se utiliza como fuente de verdad.
  let effectiveCaseRole: CaseRole = event.caseRole || 'UNKNOWN'

  if (effectiveCaseRole === 'UNKNOWN') {
    if (authorId && requesterId && authorId === requesterId) {
      effectiveCaseRole = 'SOLICITANTE'
    } else if (authorId && technicianId && authorId === technicianId) {
      effectiveCaseRole = 'TECNICO_ASIGNADO'
    } else if (event.type === 'created' || event.type === 'requester_reply') {
      effectiveCaseRole = 'SOLICITANTE'
    } else if (
      event.type === 'assigned' ||
      event.type === 'reassigned' ||
      event.type === 'cancelled' ||
      authorGlobalRole === 'lider'
    ) {
      effectiveCaseRole = 'MESA_TIC'
    } else if (
      event.type === 'started' ||
      event.type === 'note_added' ||
      event.type === 'waiting_for_requester' ||
      event.type === 'partial_solution' ||
      event.type === 'resolved' ||
      authorGlobalRole === 'tecnico'
    ) {
      effectiveCaseRole = 'TECNICO_ASIGNADO'
    } else if (authorGlobalRole === 'funcionario') {
      effectiveCaseRole = 'SOLICITANTE'
    }
  }

  // 3. Evaluar pertenencia a bandos (sin adivinar ni caer a Mesa TIC por descarte)
  const isRequesterParty = effectiveCaseRole === 'SOLICITANTE'
  const isTechnicianParty = effectiveCaseRole === 'TECNICO_ASIGNADO'
  const isMesaParty = effectiveCaseRole === 'MESA_TIC'

  // 4. Determinar si el autor del evento es el usuario activo en sesión (estrictamente por ID)
  const isCurrentUser = Boolean(currentUserId) && Boolean(authorId) && currentUserId === authorId

  // 5. Nombre visible (únicamente para presentación humana, nunca para inferencia)
  let authorDisplayName = authorRawName
  if (!authorDisplayName) {
    if (isRequesterParty) {
      authorDisplayName =
        typeof solicitud.usuario === 'object' && solicitud.usuario?.nombre
          ? solicitud.usuario.nombre
          : 'Funcionario Solicitante'
    } else if (isTechnicianParty) {
      authorDisplayName =
        typeof solicitud.tecnico === 'object' && solicitud.tecnico?.nombre
          ? solicitud.tecnico.nombre
          : 'Técnico Asignado'
    } else if (isMesaParty) {
      authorDisplayName = 'Mesa de Ayuda TIC'
    } else {
      authorDisplayName = 'Actor Desconocido'
    }
  }

  // 6. Título canónico del evento: determinado estrictamente por event.type
  let eventTitle = 'Actualización del Caso'
  switch (event.type) {
    case 'created':
      eventTitle = 'Solicitud Radicada'
      break
    case 'assigned':
      eventTitle = 'Especialista Asignado'
      break
    case 'reassigned':
      eventTitle = 'Reasignación de Técnico'
      break
    case 'started':
      eventTitle = 'Atención Iniciada en Sitio'
      break
    case 'en_camino':
      eventTitle = 'Técnico en Camino al Aula'
      break
    case 'note_added':
      eventTitle = 'Nota en Bitácora Técnica'
      break
    case 'waiting_for_requester':
      eventTitle = 'Información Adicional Requerida'
      break
    case 'requester_reply':
      eventTitle = 'Respuesta del Funcionario'
      break
    case 'partial_solution':
      eventTitle = 'Avance / Solución Parcial'
      break
    case 'resolved':
      eventTitle = 'Solución Técnica Aplicada'
      break
    case 'closed':
      eventTitle = 'Visto Bueno & Cierre Formal'
      break
    case 'reopened':
      eventTitle = 'Caso Reabierto'
      break
    case 'cancelled':
      eventTitle = 'Solicitud Cancelada'
      break
    case 'updated':
      // Manejo legacy server-compatible
      if (effectiveCaseRole === 'SOLICITANTE') {
        eventTitle = 'Respuesta del Funcionario'
      } else if (effectiveCaseRole === 'TECNICO_ASIGNADO') {
        eventTitle = 'Nota en Bitácora Técnica'
      } else if (effectiveCaseRole === 'MESA_TIC') {
        eventTitle = 'Gestión Operativa'
      } else {
        eventTitle = 'Actualización Histórica'
      }
      break
    default:
      if (effectiveCaseRole === 'SOLICITANTE') eventTitle = 'Aclaración del Solicitante'
      else if (effectiveCaseRole === 'TECNICO_ASIGNADO') eventTitle = 'Avance Técnico'
      else if (effectiveCaseRole === 'MESA_TIC') eventTitle = 'Gestión de Mesa TIC'
      else eventTitle = 'Evento Histórico'
  }

  // 7. Rótulos institucionales, ícono y estilo de badge
  let party: TimelineParty = 'unknown'
  let partyLabel = 'Evento No Clasificado'
  let authorRole = 'Registro Histórico'
  let icon = 'history'
  let badgeStyle = {
    containerClasses: 'bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-2xs',
    dotColor: undefined as string | undefined,
  }

  if (isRequesterParty) {
    party = 'mine'
    authorRole = 'Funcionario Solicitante'
    icon = event.type === 'created' ? 'description' : 'send'
    if (isCurrentUser) {
      partyLabel = 'Tú (Solicitante)'
      badgeStyle = {
        containerClasses: 'bg-emerald-600 text-white border border-emerald-700 ring-2 ring-emerald-500/20 shadow-2xs',
        dotColor: 'bg-white',
      }
    } else {
      partyLabel = 'Parte Solicitante'
      badgeStyle = {
        containerClasses: 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs',
        dotColor: undefined,
      }
    }
  } else if (isTechnicianParty) {
    party = 'tecnico'
    authorRole = 'Soporte en Sitio'
    icon =
      event.type === 'started'
        ? 'engineering'
        : event.type === 'en_camino'
        ? 'directions_run'
        : event.type === 'waiting_for_requester'
        ? 'help'
        : event.type === 'resolved'
        ? 'check_circle'
        : 'construction'

    if (isCurrentUser) {
      partyLabel = 'Tú (Técnico Asignado)'
      badgeStyle = {
        containerClasses: 'bg-blue-600 text-white border border-blue-700 ring-2 ring-blue-500/20 shadow-2xs',
        dotColor: 'bg-white',
      }
    } else {
      partyLabel = 'Técnico Asignado'
      badgeStyle = {
        containerClasses: 'bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs',
        dotColor: undefined,
      }
    }
  } else if (isMesaParty) {
    party = 'mesa'
    authorRole = 'Gestión Operativa'
    icon = event.type === 'assigned' || event.type === 'reassigned' ? 'assignment_ind' : 'hub'
    if (isCurrentUser) {
      partyLabel = 'Tú (Mesa TIC)'
      badgeStyle = {
        containerClasses: 'bg-slate-800 text-white border border-slate-900 ring-2 ring-slate-500/20 shadow-2xs',
        dotColor: 'bg-white',
      }
    } else {
      partyLabel = 'Mesa TIC'
      badgeStyle = {
        containerClasses: 'bg-slate-100 text-[#04324d] border border-slate-200 shadow-2xs',
        dotColor: undefined,
      }
    }
  }

  return {
    isCurrentUser,
    isRequesterParty,
    isTechnicianParty,
    isMesaParty,
    caseRole: effectiveCaseRole,
    party,
    partyLabel,
    authorRole,
    authorDisplayName,
    eventTitle,
    icon,
    badgeStyle,
  }
}

