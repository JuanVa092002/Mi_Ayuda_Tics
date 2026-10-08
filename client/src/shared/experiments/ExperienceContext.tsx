import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth'

export type FuncionarioVariant =
  | 'f1-journey'
  | 'f2-clarity'
  | 'f3-conversation'
  | 'f4-inbox'
  | 'f5-reassurance'

export type TecnicoVariant =
  | 't1-workbench'
  | 't2-execution-queue'
  | 't3-field-checklist'
  | 't4-resolution-timeline'
  | 't5-mobile-dispatch'

export type LiderVariant =
  | 'l1-dispatch-desk'
  | 'l2-decision-queue'
  | 'l3-exception-center'
  | 'l4-continuity-control'
  | 'l5-triage'

export type AnyRoleVariant = FuncionarioVariant | TecnicoVariant | LiderVariant

export interface RoleVariantInfo {
  id: AnyRoleVariant
  code: string
  name: string
  shortLabel: string
  norte: string
  thesis: string
  cta: string
}

export const FUNCIONARIO_VARIANTS: Record<FuncionarioVariant, RoleVariantInfo> = {
  'f1-journey': {
    id: 'f1-journey',
    code: 'F1',
    name: 'F1 — Journey de Confianza',
    shortLabel: 'F1 Journey',
    norte: 'Confianza y Acompañamiento',
    thesis: 'Narrativa paso a paso con certeza humana: Qué pasó, Qué sigue y Lo que necesitas hacer.',
    cta: 'Ver qué sigue',
  },
  'f2-clarity': {
    id: 'f2-clarity',
    code: 'F2',
    name: 'F2 — Centro de Claridad',
    shortLabel: 'F2 Claridad',
    norte: 'Claridad en 4 Respuestas',
    thesis: 'Panel escaneable con 4 respuestas directas: Estado, Responsable, Acción y Último evento.',
    cta: 'Revisar actualización',
  },
  'f3-conversation': {
    id: 'f3-conversation',
    code: 'F3',
    name: 'F3 — Seguimiento Conversacional',
    shortLabel: 'F3 Conversación',
    norte: 'Diálogo y Mensajería Guiada',
    thesis: 'Feed de diálogo interactivo donde cada actualización es un mensaje con respuesta contextual.',
    cta: 'Responder actualización',
  },
  'f4-inbox': {
    id: 'f4-inbox',
    code: 'F4',
    name: 'F4 — Bandeja Personal',
    shortLabel: 'F4 Bandeja',
    norte: 'Procesamiento de Solicitudes',
    thesis: 'Bandeja multipetición personal con filtros rápidos por estado y lectura adyacente.',
    cta: 'Abrir solicitud',
  },
  'f5-reassurance': {
    id: 'f5-reassurance',
    code: 'F5',
    name: 'F5 — Recovery & Reassurance',
    shortLabel: 'F5 Resiliencia',
    norte: 'Certeza en Contingencias',
    thesis: 'Garantía de registro, explicación clara de demoras y recuperación guiada sin pérdida de datos.',
    cta: 'Reintentar o Actuar',
  },
}

export const TECNICO_VARIANTS: Record<TecnicoVariant, RoleVariantInfo> = {
  't1-workbench': {
    id: 't1-workbench',
    code: 'T1',
    name: 'T1 — Workbench de Intervención',
    shortLabel: 'T1 Workbench',
    norte: 'Estación Integral de Campo',
    thesis: 'Active Job dominante enfrentado a la cola con Action Rail de avance y cierre inmediato.',
    cta: 'Iniciar atención',
  },
  't2-execution-queue': {
    id: 't2-execution-queue',
    code: 'T2',
    name: 'T2 — Cola de Ejecución',
    shortLabel: 'T2 Ejecución',
    norte: 'Velocidad Secuencial',
    thesis: 'Atención caso tras caso: foco en el presente y transición instantánea al siguiente ticket.',
    cta: 'Tomar siguiente caso',
  },
  't3-field-checklist': {
    id: 't3-field-checklist',
    code: 'T3',
    name: 'T3 — Checklist de Campo',
    shortLabel: 'T3 Checklist',
    norte: 'Precisión y Cero Omisiones',
    thesis: 'Protocolo técnico estructurado: Antes de ir, Durante la atención y Comprobación antes de cerrar.',
    cta: 'Completar preparación',
  },
  't4-resolution-timeline': {
    id: 't4-resolution-timeline',
    code: 'T4',
    name: 'T4 — Timeline de Resolución',
    shortLabel: 'T4 Timeline',
    norte: 'Trazabilidad y Evidencia',
    thesis: 'Línea de tiempo cronológica central con hitos técnicos y registro de nuevo avance.',
    cta: 'Registrar avance',
  },
  't5-mobile-dispatch': {
    id: 't5-mobile-dispatch',
    code: 'T5',
    name: 'T5 — Mobile-First Dispatch',
    shortLabel: 'T5 Móvil',
    norte: 'Operación Táctil en Sitio',
    thesis: 'Diseño para celular o tablet en movimiento con llamadas en 1 clic y botón de acción fijo inferior.',
    cta: 'Iniciar atención en sitio',
  },
}

export const LIDER_VARIANTS: Record<LiderVariant, RoleVariantInfo> = {
  'l1-dispatch-desk': {
    id: 'l1-dispatch-desk',
    code: 'L1',
    name: 'L1 — Mesa de Despacho',
    shortLabel: 'L1 Despacho',
    norte: 'Despacho Ágil con Contexto',
    thesis: 'Resumen estructurado de aula y solicitante enfrentado a selector de especialistas en 1 clic.',
    cta: 'Despachar solicitud',
  },
  'l2-decision-queue': {
    id: 'l2-decision-queue',
    code: 'L2',
    name: 'L2 — Cola de Decisiones',
    shortLabel: 'L2 Decisiones',
    norte: 'Decisiones Secuenciales',
    thesis: 'Una decisión a la vez en orden estricto de llegada para despacho o cancelación justificada.',
    cta: 'Resolver decisión',
  },
  'l3-exception-center': {
    id: 'l3-exception-center',
    code: 'L3',
    name: 'L3 — Centro de Excepciones',
    shortLabel: 'L3 Excepciones',
    norte: 'Resolución de Anomalías',
    thesis: 'Identificación prioritaria de tickets estancados o sin responsable para intervención correctiva.',
    cta: 'Tomar decisión correctiva',
  },
  'l4-continuity-control': {
    id: 'l4-continuity-control',
    code: 'L4',
    name: 'L4 — Control de Continuidad',
    shortLabel: 'L4 Continuidad',
    norte: 'Dinamismo y Flujo Activo',
    thesis: 'Monitoreo del movimiento de solicitudes y distribución equilibrada de carga técnica.',
    cta: 'Mover solicitud',
  },
  'l5-triage': {
    id: 'l5-triage',
    code: 'L5',
    name: 'L5 — Triage Operativo',
    shortLabel: 'L5 Triage',
    norte: 'Análisis Previo y Calidad',
    thesis: 'Evaluación técnica detallada y verificación de antecedentes antes de autorizar despacho a campo.',
    cta: 'Clasificar y despachar',
  },
}

interface ExperienceContextType {
  activeRole: 'funcionario' | 'tecnico' | 'lider'
  funcionarioVariant: FuncionarioVariant
  tecnicoVariant: TecnicoVariant
  liderVariant: LiderVariant
  setFuncionarioVariant: (v: FuncionarioVariant) => void
  setTecnicoVariant: (v: TecnicoVariant) => void
  setLiderVariant: (v: LiderVariant) => void
  resetToBaseline: () => void
  currentVariantInfo: RoleVariantInfo
}

const STORAGE_KEY_PREFIX = 'miayudatics_role_variant_'

const ExperienceContext = createContext<ExperienceContextType | null>(null)

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  // Determinar rol activo a partir del usuario autenticado o fallback a funcionario
  const rawRole = (user?.rol || '').toLowerCase()
  const activeRole: 'funcionario' | 'tecnico' | 'lider' =
    rawRole.includes('lider') || rawRole.includes('admin')
      ? 'lider'
      : rawRole.includes('tec')
      ? 'tecnico'
      : 'funcionario'

  // Estados independientes de variantes por rol
  const [fVar, setFVar] = useState<FuncionarioVariant>(() => {
    const q = searchParams.get('f_variant') || searchParams.get('variant')
    if (q && Object.keys(FUNCIONARIO_VARIANTS).includes(q)) return q as FuncionarioVariant
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}funcionario`)
      if (saved && Object.keys(FUNCIONARIO_VARIANTS).includes(saved)) return saved as FuncionarioVariant
    } catch {
      // Ignorar
    }
    return 'f1-journey'
  })

  const [tVar, setTVar] = useState<TecnicoVariant>(() => {
    const q = searchParams.get('t_variant') || searchParams.get('variant')
    if (q && Object.keys(TECNICO_VARIANTS).includes(q)) return q as TecnicoVariant
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tecnico`)
      if (saved && Object.keys(TECNICO_VARIANTS).includes(saved)) return saved as TecnicoVariant
    } catch {
      // Ignorar
    }
    return 't1-workbench'
  })

  const [lVar, setLVar] = useState<LiderVariant>(() => {
    const q = searchParams.get('l_variant') || searchParams.get('variant')
    if (q && Object.keys(LIDER_VARIANTS).includes(q)) return q as LiderVariant
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}lider`)
      if (saved && Object.keys(LIDER_VARIANTS).includes(saved)) return saved as LiderVariant
    } catch {
      // Ignorar
    }
    return 'l2-decision-queue'
  })

  const setFuncionarioVariant = (v: FuncionarioVariant) => {
    setFVar(v)
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}funcionario`, v)
    } catch {
      // Ignorar
    }
    const next = new URLSearchParams(searchParams)
    next.set('f_variant', v)
    setSearchParams(next, { replace: true })
  }

  const setTecnicoVariant = (v: TecnicoVariant) => {
    setTVar(v)
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}tecnico`, v)
    } catch {
      // Ignorar
    }
    const next = new URLSearchParams(searchParams)
    next.set('t_variant', v)
    setSearchParams(next, { replace: true })
  }

  const setLiderVariant = (v: LiderVariant) => {
    setLVar(v)
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lider`, v)
    } catch {
      // Ignorar
    }
    const next = new URLSearchParams(searchParams)
    next.set('l_variant', v)
    setSearchParams(next, { replace: true })
  }

  const resetToBaseline = () => {
    if (activeRole === 'funcionario') setFuncionarioVariant('f1-journey')
    if (activeRole === 'tecnico') setTecnicoVariant('t1-workbench')
    if (activeRole === 'lider') setLiderVariant('l1-dispatch-desk')
  }

  // Sincronización desde query params
  useEffect(() => {
    const qF = searchParams.get('f_variant')
    if (qF && Object.keys(FUNCIONARIO_VARIANTS).includes(qF) && qF !== fVar) {
      setFVar(qF as FuncionarioVariant)
    }
    const qT = searchParams.get('t_variant')
    if (qT && Object.keys(TECNICO_VARIANTS).includes(qT) && qT !== tVar) {
      setTVar(qT as TecnicoVariant)
    }
    const qL = searchParams.get('l_variant')
    if (qL && Object.keys(LIDER_VARIANTS).includes(qL) && qL !== lVar) {
      setLVar(qL as LiderVariant)
    }
  }, [searchParams, fVar, tVar, lVar])

  // Obtener info actual según rol
  const currentVariantInfo: RoleVariantInfo =
    activeRole === 'funcionario'
      ? FUNCIONARIO_VARIANTS[fVar]
      : activeRole === 'tecnico'
      ? TECNICO_VARIANTS[tVar]
      : LIDER_VARIANTS[lVar]

  return (
    <ExperienceContext.Provider
      value={{
        activeRole,
        funcionarioVariant: fVar,
        tecnicoVariant: tVar,
        liderVariant: lVar,
        setFuncionarioVariant,
        setTecnicoVariant,
        setLiderVariant,
        resetToBaseline,
        currentVariantInfo,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  )
}

export function useExperience() {
  const ctx = useContext(ExperienceContext)
  if (!ctx) {
    return {
      activeRole: 'funcionario' as const,
      funcionarioVariant: 'f1-journey' as FuncionarioVariant,
      tecnicoVariant: 't1-workbench' as TecnicoVariant,
      liderVariant: 'l1-dispatch-desk' as LiderVariant,
      setFuncionarioVariant: () => {},
      setTecnicoVariant: () => {},
      setLiderVariant: () => {},
      resetToBaseline: () => {},
      currentVariantInfo: FUNCIONARIO_VARIANTS['f1-journey'],
    }
  }
  return ctx
}
