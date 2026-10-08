/**
 * Utilidades para estructuración, serialización y extracción del contexto
 * operativo SENA: Ficha de Formación, Aula / Ambiente, Puesto de Aprendiz y Jornada.
 */

export interface FichaContext {
  tipoUbicacion?: 'academico' | 'administrativo' | string
  ficha?: string
  puesto?: string
  oficina?: string
  jornada?: 'Mañana' | 'Tarde' | 'Noche' | string
  impactoServicio?: 'atencion_publico' | 'operativo_interno' | string
  modoExpress?: boolean
  equipoFalla?: string
  rawDescription: string
}

/**
 * Determina la jornada recomendada según la hora actual local.
 */
export function getJornadaActual(): 'Mañana' | 'Tarde' | 'Noche' {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 12) return 'Mañana'
  if (hora >= 12 && hora < 18) return 'Tarde'
  return 'Noche'
}

/**
 * Construye la descripción enriquecida con metadatos estructurados de forma
 * legible y compatible hacia atrás con el backend.
 *
 * Ejemplo Académico (Express):
 * "[TIPO: ACADEMICO | FICHA: 2669742 | PUESTO: 14 | JORNADA: Mañana | MODO: EXPRESS | EQUIPO: VIDEOBEAM]
 * Videobeam no proyecta señal HDMI ni detecta cable."
 *
 * Ejemplo Administrativo:
 * "[TIPO: ADMINISTRATIVO | OFICINA: Matrículas | PUESTO: Ventanilla 2 | IMPACTO: ATENCION_PUBLICO]
 * Impresora de carnets no recibe trabajos de impresión."
 */
export function buildEnrichedDescription(params: {
  tipoUbicacion?: 'academico' | 'administrativo' | string
  ficha?: string
  puesto?: string
  oficina?: string
  jornada?: string
  impactoServicio?: string
  modoExpress?: boolean
  equipoFalla?: string
  descripcion: string
}): string {
  const parts: string[] = []

  if (params.tipoUbicacion) {
    parts.push(`TIPO: ${params.tipoUbicacion.toUpperCase()}`)
  }

  if (params.tipoUbicacion === 'administrativo') {
    if (params.oficina?.trim()) parts.push(`OFICINA: ${params.oficina.trim()}`)
    if (params.puesto?.trim()) parts.push(`PUESTO: ${params.puesto.trim()}`)
    if (params.impactoServicio?.trim()) parts.push(`IMPACTO: ${params.impactoServicio.trim().toUpperCase()}`)
  } else {
    // Académico (por defecto)
    if (params.ficha?.trim()) parts.push(`FICHA: ${params.ficha.trim()}`)
    if (params.puesto?.trim()) parts.push(`PUESTO: ${params.puesto.trim()}`)
    if (params.jornada?.trim()) parts.push(`JORNADA: ${params.jornada.trim()}`)
    if (params.modoExpress) parts.push(`MODO: EXPRESS`)
    if (params.equipoFalla?.trim()) parts.push(`EQUIPO: ${params.equipoFalla.trim().toUpperCase()}`)
  }

  if (parts.length === 0) return params.descripcion.trim()

  const header = `[${parts.join(' | ')}]`
  return `${header}\n${params.descripcion.trim()}`
}

export interface SolicitudWithContext {
  descripcion?: string
  tipoUbicacion?: string
  ficha?: string
  puesto?: string
  oficina?: string
  jornada?: string
}

/**
 * Parsea una descripción para extraer Ficha, Puesto, Oficina, Jornada y la descripción limpia.
 * Resiliente a variaciones de formato y preparado para convivir con campos nativos en BD futuros.
 */
export function parseEnrichedDescription(
  input?: string | SolicitudWithContext | null
): FichaContext {
  if (!input) {
    return { rawDescription: '' }
  }

  // Si se pasa un objeto solicitud directamente
  if (typeof input === 'object') {
    const fromDesc = parseEnrichedDescription(input.descripcion)
    return {
      tipoUbicacion: input.tipoUbicacion || fromDesc.tipoUbicacion,
      ficha: input.ficha || fromDesc.ficha,
      puesto: input.puesto || fromDesc.puesto,
      oficina: input.oficina || fromDesc.oficina,
      jornada: input.jornada || fromDesc.jornada,
      rawDescription: fromDesc.rawDescription || input.descripcion || '',
    }
  }

  const fullDescription = String(input).trim()

  // Regex flexible para capturar cabecera [TAG1: VAL1 | TAG2: VAL2 ...]
  const match = fullDescription.match(/^\[([^\]]+)\]\s*\n?([\s\S]*)$/)

  if (!match) {
    return { rawDescription: fullDescription }
  }

  const tagContent = match[1]
  const cleanDesc = match[2]?.trim() || fullDescription

  const result: FichaContext = {
    rawDescription: cleanDesc,
  }

  const segments = tagContent.split('|').map((s) => s.trim())
  for (const seg of segments) {
    const [key, ...valParts] = seg.split(':')
    if (!key || valParts.length === 0) continue

    const val = valParts.join(':').trim()
    const upperKey = key.toUpperCase().trim()

    if (upperKey === 'TIPO') result.tipoUbicacion = val.toLowerCase()
    else if (upperKey === 'FICHA') result.ficha = val
    else if (upperKey === 'PUESTO') result.puesto = val
    else if (upperKey === 'OFICINA' || upperKey === 'DEPENDENCIA') result.oficina = val
    else if (upperKey === 'JORNADA') result.jornada = val
    else if (upperKey === 'IMPACTO') result.impactoServicio = val.toLowerCase()
    else if (upperKey === 'MODO' && val.toUpperCase() === 'EXPRESS') result.modoExpress = true
    else if (upperKey === 'EQUIPO') result.equipoFalla = val.toLowerCase()
  }

  // Si no se explicitó TIPO pero hay FICHA, es académico
  if (!result.tipoUbicacion) {
    if (result.ficha) {
      result.tipoUbicacion = 'academico'
    } else if (result.oficina) {
      result.tipoUbicacion = 'administrativo'
    }
  }

  return result
}

export interface DetectedSymptom {
  id: string
  titulo: string
  icono: string
  color: string
  tag: string
}

/**
 * Deduce el síntoma institucional a partir del contexto parseado y la descripción.
 * Permite que el técnico vea de inmediato el mismo icono y categoría que el funcionario radicó.
 */
export function detectVisualSymptom(ctx: FichaContext, rawDescription: string = ''): DetectedSymptom {
  const eq = (ctx.equipoFalla || '').toLowerCase()
  const text = `${rawDescription} ${ctx.rawDescription || ''}`.toLowerCase()

  if (eq.includes('video') || eq.includes('proyector') || text.includes('proyector') || text.includes('videobeam') || text.includes('hdmi')) {
    return {
      id: 'pantalla_proyector',
      titulo: 'Pantalla o Proyector',
      icono: 'videocam',
      color: 'blue',
      tag: 'Hardware Audiovisual',
    }
  }

  if (eq.includes('red') || eq.includes('internet') || text.includes('internet') || text.includes('wi-fi') || text.includes('wifi') || text.includes('red')) {
    return {
      id: 'red_internet',
      titulo: 'Red e Internet',
      icono: 'wifi_off',
      color: 'sky',
      tag: 'Conectividad Institucional',
    }
  }

  if (eq.includes('impresora') || text.includes('impresora') || text.includes('tóner') || text.includes('toner') || text.includes('escaner')) {
    return {
      id: 'impresora_periferico',
      titulo: 'Impresora / Periférico',
      icono: 'print',
      color: 'purple',
      tag: 'Periférico de Impresión',
    }
  }

  if (eq.includes('software') || eq.includes('licencia') || text.includes('office') || text.includes('licencia') || text.includes('windows') || text.includes('contraseña')) {
    return {
      id: 'software_cuenta',
      titulo: 'Software o Licencia',
      icono: 'key',
      color: 'amber',
      tag: 'Sistemas & Software',
    }
  }

  if (eq.includes('pc') || text.includes('computador') || text.includes('cpu') || text.includes('enciende') || text.includes('pantalla azul')) {
    return {
      id: 'pc_equipo',
      titulo: 'Computador / CPU',
      icono: 'desktop_windows',
      color: 'emerald',
      tag: 'Equipo de Cómputo',
    }
  }

  return {
    id: 'otro_soporte',
    titulo: 'Asistencia TIC',
    icono: 'support',
    color: 'slate',
    tag: 'Soporte General',
  }
}

/**
 * Calcula la puntuación de prioridad operativa para el rol FUNCIONARIO / DOCENTE.
 * A diferencia del Técnico (donde 'esperando_usuario' se pausa), para el Funcionario
 * los casos donde el técnico espera su respuesta o espera su visto bueno son P0 (bloqueo en su cancha).
 *
 * Jerarquía de Experiencia de Producto:
 * - Score 5: Requiere acción inmediata del usuario (esperando_usuario / requiere_informacion)
 * - Score 8: Requiere validación del usuario (resuelto / finalizado esperando visto bueno)
 * - Score 12: Intervención en sitio activa en este instante (en_progreso / en_atencion)
 * - Score 15: Emergencias de aula o ventanilla en curso (Clase en Vivo / Atención al Público)
 * - Score 25: Casos estándar en curso en mesa TIC (asignado / nuevo / solicitado / pendiente)
 * - Score 60: Histórico formalizado / cerrado (cerrado / cancelado)
 */
export function getFuncionarioPriorityScore(
  estado?: string,
  descripcion?: string
): number {
  const st = (estado || '').toLowerCase().trim()
  const ctx = parseEnrichedDescription(descripcion || '')

  // 1. Intervención en sitio activa: El técnico está operando físicamente en el ambiente en este instante
  if (st === 'en_progreso' || st === 'en_atencion') {
    return 5
  }

  // 2. Bloqueo de acción en cancha del usuario: El técnico requiere respuesta para continuar
  if (st === 'esperando_usuario' || st === 'requiere_informacion') {
    return 10
  }

  // 3. Incidentes de alto impacto institucional en espera de atención
  if (ctx.modoExpress) {
    return 15 // Clase en Vivo
  }
  if (ctx.impactoServicio === 'atencion_publico') {
    return 18 // Atención al Público
  }

  // 4. Casos asignados y nuevos en trámite estándar en mesa TIC
  if (st === 'asignado') {
    return 22
  }
  if (st === 'nuevo' || st === 'solicitado' || st === 'pendiente') {
    return 26
  }

  // 5. Validación pendiente: El técnico ya intervino y espera visto bueno del usuario
  if (st === 'resuelto' || st === 'finalizado') {
    return 35
  }

  // 6. Finalizados y formalizados
  if (st === 'cerrado' || st === 'cancelado') {
    return 60
  }

  return 40
}

/**
 * Calcula la puntuación de prioridad operativa para el rol TÉCNICO DE SOPORTE TIC.
 * Diseñado como el plan de vuelo de campo del especialista:
 *
 * Jerarquía de Experiencia de Producto:
 * - Score 5: En intervención técnica activa (caso abierto en su mesa/puesto en este instante)
 * - Score 12: Emergencia de aula en vivo (Clase en Vivo / modoExpress sin pausar)
 * - Score 15: Emergencia de atención ciudadana (Atención al Público sin pausar)
 * - Score 22: Casos asignados estándar listos para iniciar atención
 * - Score 26: Nuevos requerimientos asignados por mesa TIC
 * - Score 45: Casos pausados a la espera de respuesta del funcionario (no bloquean su ruta activa)
 * - Score 60: Casos formalizados / resueltos
 */
export function getTecnicoPriorityScore(
  estado?: string,
  descripcion?: string
): number {
  const st = (estado || '').toLowerCase().trim()
  const ctx = parseEnrichedDescription(descripcion || '')

  // 1. Intervención activa en sitio: Trabajo en ejecución física
  if (st === 'en_progreso' || st === 'en_atencion') {
    return 5
  }

  // 2. Si el caso está pausado esperando al usuario, no puede atenderse físicamente aún
  if (st === 'esperando_usuario' || st === 'requiere_informacion') {
    return 45
  }

  // 3. Incidentes de alto impacto institucional disponibles para atención inmediata
  if (ctx.modoExpress) {
    return 12 // Clase en Vivo
  }
  if (ctx.impactoServicio === 'atencion_publico') {
    return 15 // Atención al Público
  }

  // 4. Casos asignados estándar listos para iniciar
  if (st === 'asignado') {
    return 22
  }
  if (st === 'nuevo' || st === 'solicitado' || st === 'pendiente') {
    return 26
  }

  // 5. Casos resueltos / cerrados
  if (st === 'resuelto' || st === 'finalizado' || st === 'cerrado' || st === 'cancelado') {
    return 60
  }

  return 30
}