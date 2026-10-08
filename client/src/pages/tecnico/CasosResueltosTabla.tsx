import { useState, useEffect, useMemo, type ReactNode } from 'react'
import {
  AppShell,
  SearchField,
  PaginationFooter,
  AdaptiveSkeletonList,
  AdaptiveSkeletonDetail,
  FeedbackBanner,
} from '@/shared/ui'
import { getCasosFinalizados, obtenerHistorialCaso } from '@/features/tickets'
import type { Solicitud } from '@/shared/types'
import { FuncionarioTimeline } from '@/pages/funcionario/components/FuncionarioTimeline'
import { parseEnrichedDescription, detectVisualSymptom } from '@/shared/utils/ticketContext'

type CategoryFilter = 'todas' | 'pantalla_proyector' | 'red_internet' | 'pc_equipo' | 'impresora_periferico' | 'software_cuenta' | 'otro_soporte'
type EvidenceFilter = 'todos' | 'con_foto' | 'todas_las_soluciones'
type TimeFilter = 'todos' | 'hoy' | 'esta_semana' | 'este_mes'
type ViewMode = 'grid' | 'compact'

function getSolucionText(solucion: Solicitud['solucion']): string {
  if (!solucion) return ''
  if (typeof solucion === 'string') return solucion
  return solucion.descripcionSolucion ?? ''
}

function getSolucionEvidencia(solucion: Solicitud['solucion']): string | undefined {
  if (!solucion || typeof solucion === 'string') return undefined
  return solucion.evidencia?.url
}

/** Calcula la duración de resolución de forma humana */
function getDuracionResolucion(caso: Solicitud): string | null {
  if (!caso.fecha) return null
  const inicio = new Date(caso.fecha).getTime()
  // Usar updatedAt si está disponible, o fecha de último evento de cierre
  const fin = caso.updatedAt ? new Date(caso.updatedAt).getTime() : null
  if (!fin || isNaN(inicio) || isNaN(fin) || fin <= inicio) return null

  const diffMinutos = Math.round((fin - inicio) / (1000 * 60))
  if (diffMinutos < 1) return '< 5 min'
  if (diffMinutos < 60) return `${diffMinutos} min`
  const horas = Math.floor(diffMinutos / 60)
  const minsRestantes = diffMinutos % 60
  if (horas < 24) return `${horas}h ${minsRestantes > 0 ? `${minsRestantes}m` : ''}`
  const dias = Math.floor(horas / 24)
  return `${dias}d ${horas % 24}h`
}

export default function CasosResueltosTabla(): ReactNode {
  const [cases, setCases] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filtros de Conocimiento Técnico (Knowledge Base)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('todas')
  const [selectedAmbiente, setSelectedAmbiente] = useState<string>('todos')
  const [selectedEvidenceFilter, setSelectedEvidenceFilter] = useState<EvidenceFilter>('todos')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('todos')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Estado del caso seleccionado para la Ficha Técnica de Consulta
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [caseHistorial, setCaseHistorial] = useState<Record<string, import('@/shared/types').SolicitudHistorialEvent[]>>({})

  // Visor modal de evidencia en alta definición
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [copiedSolucionId, setCopiedSolucionId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedReport, setCopiedReport] = useState(false)

  useEffect(() => {
    const fetchCases = async (): Promise<void> => {
      setLoading(true)
      setFetchError(null)
      try {
        const solicitudes = await getCasosFinalizados()
        const list = Array.isArray(solicitudes) ? solicitudes : []
        setCases(list)
        if (list.length > 0 && !selectedCaseId) {
          setSelectedCaseId(list[0]._id)
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error al obtener los casos resueltos:', error)
        }
        setFetchError('No se pudo cargar la base de conocimientos de soluciones.')
      } finally {
        setLoading(false)
      }
    }
    void fetchCases()
  }, [])

  // Métricas de Impacto y Biblioteca de Conocimiento
  const stats = useMemo(() => {
    const total = cases.length
    const conEvidencia = cases.filter((c) => Boolean(getSolucionEvidencia(c.solucion))).length
    
    // Top de ambientes asistidos
    const ambienteCounts: Record<string, number> = {}
    cases.forEach((c) => {
      const nom = c.ambiente?.nombre || 'General'
      ambienteCounts[nom] = (ambienteCounts[nom] || 0) + 1
    })
    const sortedAmbientes = Object.entries(ambienteCounts).sort((a, b) => b[1] - a[1])
    const topAmbiente = sortedAmbientes[0] ? `${sortedAmbientes[0][0]} (${sortedAmbientes[0][1]})` : '—'

    return { total, conEvidencia, topAmbiente }
  }, [cases])

  // Catálogo dinámico de ambientes presentes en el histórico
  const ambientesDisponibles = useMemo(() => {
    const set = new Set<string>()
    cases.forEach((c) => {
      if (c.ambiente?.nombre) set.add(c.ambiente.nombre)
    })
    return Array.from(set).sort()
  }, [cases])

  // Filtrado reactivo multidimensional
  const filteredData = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    return cases.filter((c) => {
      const query = searchTerm.toLowerCase().trim()
      const codigo = (c.codigoCaso || '').toLowerCase()
      const desc = (c.descripcion || '').toLowerCase()
      const usuarioNombre = (typeof c.usuario === 'object' && c.usuario?.nombre ? c.usuario.nombre : '').toLowerCase()
      const ambienteNombre = (c.ambiente?.nombre || '').toLowerCase()
      const solucion = getSolucionText(c.solucion).toLowerCase()

      // Búsqueda textual
      if (query) {
        const matchesQuery =
          codigo.includes(query) ||
          desc.includes(query) ||
          usuarioNombre.includes(query) ||
          ambienteNombre.includes(query) ||
          solucion.includes(query)
        if (!matchesQuery) return false
      }

      // Filtro por ambiente
      if (selectedAmbiente !== 'todos' && c.ambiente?.nombre !== selectedAmbiente) {
        return false
      }

      // Filtro por evidencia
      if (selectedEvidenceFilter === 'con_foto' && !getSolucionEvidencia(c.solucion)) {
        return false
      }

      // Filtro por síntoma/categoría tecnológica
      if (selectedCategory !== 'todas') {
        const ctx = parseEnrichedDescription(c.descripcion)
        const detected = detectVisualSymptom(ctx, c.descripcion)
        if (detected.id !== selectedCategory) return false
      }

      // Filtro Temporal
      if (selectedTimeFilter !== 'todos' && c.fecha) {
        const itemTime = new Date(c.fecha).getTime()
        if (selectedTimeFilter === 'hoy' && itemTime < startOfToday) return false
        if (selectedTimeFilter === 'esta_semana' && itemTime < startOfWeek) return false
        if (selectedTimeFilter === 'este_mes' && itemTime < startOfMonth) return false
      }

      return true
    })
  }, [cases, searchTerm, selectedAmbiente, selectedEvidenceFilter, selectedCategory, selectedTimeFilter])

  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const currentItems = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const activeCase = useMemo(() => {
    return cases.find((c) => c._id === selectedCaseId) || currentItems[0] || null
  }, [cases, selectedCaseId, currentItems])

  // Cargar eventos del caso seleccionado
  useEffect(() => {
    if (!selectedCaseId) return
    if (caseHistorial[selectedCaseId]) return

    let isMounted = true
    const loadEvents = async () => {
      setLoadingHistorial(true)
      try {
        const events = await obtenerHistorialCaso(selectedCaseId)
        if (isMounted) {
          setCaseHistorial((prev) => ({ ...prev, [selectedCaseId]: events }))
        }
      } catch {
        // Silencioso
      } finally {
        if (isMounted) setLoadingHistorial(false)
      }
    }

    void loadEvents()
    return () => {
      isMounted = false
    }
  }, [selectedCaseId, caseHistorial])

  const enrichedActiveCase = useMemo(() => {
    if (!activeCase) return null
    const events = caseHistorial[activeCase._id]
    if (events && events.length > 0) {
      return { ...activeCase, historial: events }
    }
    return activeCase
  }, [activeCase, caseHistorial])

  const handleOpenDetail = (solicitud: Solicitud) => {
    setSelectedCaseId(solicitud._id)
    setIsDetailDrawerOpen(true)
  }

  const handleCopySolucion = (solText: string, casoId: string) => {
    void navigator.clipboard.writeText(solText)
    setCopiedSolucionId(casoId)
    setTimeout(() => setCopiedSolucionId(null), 2500)
  }

  const handleCopyCode = (codigo: string) => {
    void navigator.clipboard.writeText(codigo)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  /** Exportador de Relación de Casos para Informe Mensual de Actividades SENA */
  const handleExportInformeSena = () => {
    if (filteredData.length === 0) return
    const lines = [
      '# RELACIÓN DE CASOS DE SOPORTE TIC ATENDIDOS Y RESUELTOS (SENA CTPI)',
      `Fecha de Generación: ${new Date().toLocaleDateString()} | Total Casos: ${filteredData.length}`,
      '---------------------------------------------------------------------------------',
      ...filteredData.map((c, i) => {
        const num = i + 1
        const rad = c.codigoCaso || c._id?.slice(-6) || 'S/N'
        const amb = c.ambiente?.nombre || 'General'
        const sol = getSolucionText(c.solucion) || 'Intervención completada en sitio.'
        const fec = c.fecha ? new Date(c.fecha).toLocaleDateString() : 'N/A'
        return `${num}. [${rad}] (${fec}) - Ambiente: ${amb}\n   Diagnóstico/Solución: ${sol}`
      }),
      '---------------------------------------------------------------------------------',
    ]
    const reportText = lines.join('\n')
    void navigator.clipboard.writeText(reportText)
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 3000)
  }

  return (
    <AppShell subtitleContext="Atención Técnica">
      <div className="mx-auto w-full max-w-[1540px] px-3.5 py-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* HEADER ESTRATÉGICO: Repositorio de Soluciones & Histórico de Auditoría */}
        <header className="rounded-2xl border bg-white p-4 sm:p-6 shadow-xs border-slate-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-verde-sena shrink-0" />
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Base de Soluciones & Historial Resuelto
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Archivo & Conocimiento TIC
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Consulta antecedentes técnicos, causas identificadas, evidencia fotográfica y réplicas de procedimientos de casos resueltos en la sede.
              </p>
            </div>

            {/* MÉTTRICAS TÁCTICAS DE VALOR PROFESIONAL Y ACCIÓN DE REPORTE */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Total Soluciones */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-3.5 py-2.5 border border-slate-200/80 shadow-2xs">
                <div className="h-9 w-9 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">task_alt</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resueltos</p>
                  <p className="text-base font-black text-slate-900 leading-tight">{stats.total}</p>
                </div>
              </div>

              {/* Con Evidencia Fotográfica */}
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 px-3.5 py-2.5 border border-emerald-200/80 shadow-2xs">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-verde-sena flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">photo_camera</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Con Evidencia</p>
                  <p className="text-base font-black text-emerald-950 leading-tight">{stats.conEvidencia}</p>
                </div>
              </div>

              {/* Mayor Cobertura */}
              <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-blue-50/70 px-3.5 py-2.5 border border-blue-200/80 shadow-2xs">
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-azul-sena flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[20px]">domain</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-azul-sena uppercase tracking-wider">Foco Principal</p>
                  <p className="text-xs font-black text-slate-800 truncate max-w-[140px] leading-tight">
                    {stats.topAmbiente}
                  </p>
                </div>
              </div>

              {/* Botón de Exportar / Copiar Consolidado para Informe SENA */}
              <button
                type="button"
                onClick={handleExportInformeSena}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Copiar relación completa de casos para el informe mensual de actividades SENA"
              >
                <span className="material-symbols-outlined !text-[18px]">
                  {copiedReport ? 'done_all' : 'description'}
                </span>
                <span className="hidden sm:inline">
                  {copiedReport ? 'Informe Copiado' : 'Exportar Informe SENA'}
                </span>
                <span className="sm:hidden">
                  {copiedReport ? 'Copiado' : 'Informe'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* BARRA DE HERRAMIENTAS Y CHIPS DE BÚSQUEDA INTELIGENTE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined !text-[18px] text-azul-sena">manage_search</span>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Explorar Soluciones ({totalItems} casos)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {/* Selector de Densidad Visual */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-azul-sena shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista en tarjetas de diagnóstico"
                >
                  <span className="material-symbols-outlined !text-[18px]">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center transition-colors cursor-pointer ${
                    viewMode === 'compact'
                      ? 'bg-white text-azul-sena shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista compacta de escaneo rápido"
                >
                  <span className="material-symbols-outlined !text-[18px]">view_agenda</span>
                </button>
              </div>

              {/* Selector de Ambiente */}
              <select
                value={selectedAmbiente}
                onChange={(e) => {
                  setSelectedAmbiente(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-azul-sena focus:ring-1 focus:ring-azul-sena shadow-2xs"
                title="Filtrar por ambiente"
              >
                <option value="todos">Todos los ambientes</option>
                {ambientesDisponibles.map((amb) => (
                  <option key={amb} value={amb}>{amb}</option>
                ))}
              </select>

              {/* Search Field Rápido */}
              <div className="w-full sm:w-80">
                <SearchField
                  value={searchTerm}
                  onChange={(val) => {
                    setSearchTerm(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Buscar falla, causa, cable, switch, PC..."
                />
              </div>
            </div>
          </div>

          {/* FILTRO TEMPORAL Y ESPECIALIDADES */}
          <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-100">
            {/* Fila A: Rango de Tiempo Rápido */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <span className="material-symbols-outlined !text-[13px]">calendar_today</span>
                <span>Período:</span>
              </span>
              {[
                { id: 'todos', label: 'Todo el histórico' },
                { id: 'hoy', label: 'Hoy' },
                { id: 'esta_semana', label: 'Esta semana' },
                { id: 'este_mes', label: 'Este mes' },
              ].map((t) => {
                const active = selectedTimeFilter === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTimeFilter(t.id as TimeFilter)
                      setCurrentPage(1)
                    }}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Fila B: Especialidad Tecnológica y Evidencia */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Especialidad:
              </span>

              {[
                { id: 'todas', label: 'Todas', icon: 'grid_view' },
                { id: 'pantalla_proyector', label: 'Pantallas / Proyectores', icon: 'videocam' },
                { id: 'red_internet', label: 'Red e Internet', icon: 'wifi' },
                { id: 'pc_equipo', label: 'Computadores / CPU', icon: 'desktop_windows' },
                { id: 'impresora_periferico', label: 'Impresoras', icon: 'print' },
                { id: 'software_cuenta', label: 'Software & Cuentas', icon: 'key' },
              ].map((chip) => {
                const active = selectedCategory === chip.id
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(chip.id as CategoryFilter)
                      setCurrentPage(1)
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-azul-sena text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-[14px]">{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                )
              })}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={() => {
                  setSelectedEvidenceFilter((prev) => (prev === 'con_foto' ? 'todos' : 'con_foto'))
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedEvidenceFilter === 'con_foto'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span className="material-symbols-outlined !text-[14px]">photo_camera</span>
                <span>Solo con Foto</span>
              </button>
            </div>
          </div>
        </div>

        {fetchError && (
          <FeedbackBanner
            tone="danger"
            title="Error de Conexión"
            message={fetchError}
          />
        )}

        {/* FEED DE TARJETAS TÉCNICAS (KNOWLEDGE BASE GRID) */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <AdaptiveSkeletonList count={4} />
          </div>
        ) : currentItems.length > 0 ? (
          viewMode === 'compact' ? (
            /* VISTA COMPACTA DE ESCANEO RÁPIDO */
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
              {currentItems.map((caso) => {
                const parsed = parseEnrichedDescription(caso.descripcion)
                const detected = detectVisualSymptom(parsed, caso.descripcion)
                const solucionText = getSolucionText(caso.solucion)
                const duracion = getDuracionResolucion(caso)
                const isCopied = copiedSolucionId === caso._id

                return (
                  <div
                    key={caso._id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 text-azul-sena flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined !text-[18px]">{detected.icono}</span>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(caso.codigoCaso || caso._id)}
                            className="text-xs font-black text-slate-600 hover:text-azul-sena font-mono"
                          >
                            #{caso.codigoCaso || caso._id?.slice(-6)}
                          </button>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {caso.ambiente?.nombre || 'General'}
                          </span>
                          {duracion && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                              <span className="material-symbols-outlined !text-[12px]">timer</span>
                              <span>{duracion}</span>
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {caso.fecha ? new Date(caso.fecha).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate max-w-xl">
                          {parsed.rawDescription || caso.descripcion}
                        </p>
                        <p className="text-xs text-emerald-900 font-medium truncate max-w-xl flex items-center gap-1">
                          <span className="material-symbols-outlined !text-[14px] text-verde-sena shrink-0">task_alt</span>
                          <span className="truncate">{solucionText || 'Resuelto en sitio'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopySolucion(solucionText || 'Solución formalizada', caso._id)}
                        className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Copiar procedimiento"
                      >
                        <span className="material-symbols-outlined !text-[14px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                        <span>{isCopied ? 'Copiado' : 'Reusar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(caso)}
                        className="px-3 py-1.5 rounded-xl bg-azul-sena text-white text-xs font-bold hover:bg-[#032337] transition-all cursor-pointer shadow-2xs"
                      >
                        Auditar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* VISTA DE TARJETAS EXPANDIDAS DE DIAGNÓSTICO */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentItems.map((caso) => {
                const parsed = parseEnrichedDescription(caso.descripcion)
                const detected = detectVisualSymptom(parsed, caso.descripcion)
                const solucionText = getSolucionText(caso.solucion)
                const evidenciaUrl = getSolucionEvidencia(caso.solucion)
                const duracion = getDuracionResolucion(caso)
                const isCopied = copiedSolucionId === caso._id

                return (
                  <div
                    key={caso._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-azul-sena/40 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                  >
                    {/* Fila Superior: Meta, Badge de Especialidad y Código */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Chip de Síntoma Visual */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-azul-sena text-[11px] font-black uppercase tracking-wide">
                            <span className="material-symbols-outlined !text-[14px]">{detected.icono}</span>
                            <span>{detected.tag}</span>
                          </span>

                          {/* Ambiente */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                            <span className="material-symbols-outlined !text-[14px] text-emerald-600">location_on</span>
                            <span className="truncate max-w-[130px]">{caso.ambiente?.nombre || 'General'}</span>
                          </span>

                          {/* Duración de Resolución */}
                          {duracion && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/60 text-[11px] font-bold" title="Tiempo total de atención hasta el cierre">
                              <span className="material-symbols-outlined !text-[13px] text-emerald-700">timer</span>
                              <span>{duracion}</span>
                            </span>
                          )}
                        </div>

                        {/* Código de Caso */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(caso.codigoCaso || caso._id)}
                          className="text-xs font-black text-slate-500 hover:text-azul-sena flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80"
                          title="Copiar código"
                        >
                          #{caso.codigoCaso || caso._id?.slice(-6)}
                          <span className="material-symbols-outlined !text-[13px]">content_copy</span>
                        </button>
                      </div>

                      {/* Problema Reportado Original */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Falla Reportada por {typeof caso.usuario === 'object' ? caso.usuario?.nombre : 'Usuario'}:
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                          {parsed.rawDescription || caso.descripcion}
                        </p>
                        {parsed.puesto && (
                          <span className="inline-block mt-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Alcance: {parsed.puesto}
                          </span>
                        )}
                      </div>

                      {/* BLOQUE DE LA SOLUCIÓN APLICADA (DESTACADO EN VERDE INSTITUCIONAL) */}
                      <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/50 p-3 sm:p-3.5 space-y-1.5 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[14px] text-verde-sena">verified</span>
                            <span>Solución Aplicada & Procedimiento</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopySolucion(solucionText || 'Solución formalizada', caso._id)}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer"
                            title="Copiar procedimiento para reusar en otro caso"
                          >
                            <span className="material-symbols-outlined !text-[13px]">
                              {isCopied ? 'check' : 'content_copy'}
                            </span>
                            <span>{isCopied ? 'Copiado' : 'Reusar texto'}</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                          {solucionText || 'Intervención completada y verificada en sitio.'}
                        </p>
                      </div>
                    </div>

                    {/* Fila Inferior: Evidencia, Fecha y Botón de Auditoría */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {evidenciaUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(evidenciaUrl)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                            title="Ver fotografía de evidencia técnica"
                          >
                            <span className="material-symbols-outlined !text-[15px] text-emerald-700">photo_camera</span>
                            <span>Ver Foto</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Sin foto adjunta</span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {caso.fecha ? new Date(caso.fecha).toLocaleDateString() : '—'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenDetail(caso)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-azul-sena text-white text-xs font-bold hover:bg-[#032337] active:scale-95 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Auditar Historial</span>
                        <span className="material-symbols-outlined !text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="flex flex-col items-center gap-2 opacity-60">
              <span className="material-symbols-outlined !text-[48px] text-slate-400">inventory_2</span>
              <p className="text-sm font-bold text-slate-700">No se encontraron soluciones resueltas</p>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchTerm || selectedAmbiente !== 'todos' || selectedCategory !== 'todas'
                  ? 'Intenta restablecer los filtros para ver el histórico de incidentes.'
                  : 'Los casos finalizados en la consola por resolver se archivan automáticamente aquí.'}
              </p>
            </div>
          </div>
        )}

        {/* PAGINACIÓN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="soluciones archivadas"
          />
        </div>

        {/* DRAWER LATERAL DE AUDITORÍA Y TRAZABILIDAD (FICHA TÉCNICA SENA) */}
        {isDetailDrawerOpen && enrichedActiveCase && (
          <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsDetailDrawerOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
                
                {/* Header del Drawer */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined !text-[14px]">verified</span>
                          <span>Caso Finalizado & Verificado</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(enrichedActiveCase.codigoCaso || enrichedActiveCase._id)}
                          className="text-xs font-bold text-azul-sena hover:underline flex items-center gap-1"
                        >
                          #{enrichedActiveCase.codigoCaso || enrichedActiveCase._id?.slice(-6)}
                          <span className="material-symbols-outlined !text-[13px]">
                            {copiedCode ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Auditoría y Trazabilidad del Caso
                      </h3>
                      <p className="text-xs text-slate-500">
                        {enrichedActiveCase.ambiente?.nombre || 'Ambiente'} · Solicitado por{' '}
                        {typeof enrichedActiveCase.usuario === 'object' ? enrichedActiveCase.usuario?.nombre : 'Funcionario'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDetailDrawerOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Cerrar detalle"
                    >
                      <span className="material-symbols-outlined !text-[20px]">close</span>
                    </button>
                  </div>
                </div>

                {/* Contenido del Drawer */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 hairline-scrollbar">
                  
                  {/* Resumen de Solución Aplicada */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[16px] text-verde-sena">task_alt</span>
                        <span>Dictamen de Solución Registrado</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySolucion(getSolucionText(enrichedActiveCase.solucion), enrichedActiveCase._id)}
                        className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined !text-[13px]">content_copy</span>
                        <span>Copiar texto</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 bg-white p-3 rounded-xl border border-emerald-100 leading-relaxed">
                      {getSolucionText(enrichedActiveCase.solucion) || 'Intervención finalizada y validada en sitio.'}
                    </p>

                    {/* Evidencia adjunta */}
                    {getSolucionEvidencia(enrichedActiveCase.solucion) && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined !text-[14px]">photo_camera</span>
                          <span>Fotografía de Evidencia</span>
                        </p>
                        <div
                          onClick={() => setPreviewImage(getSolucionEvidencia(enrichedActiveCase.solucion)!)}
                          className="relative h-44 rounded-xl overflow-hidden border border-emerald-200 group cursor-pointer bg-slate-900 shadow-2xs"
                        >
                          <img
                            src={getSolucionEvidencia(enrichedActiveCase.solucion)!}
                            alt="Evidencia del cierre"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <span className="material-symbols-outlined !text-[18px]">zoom_in</span>
                            <span>Ver en alta definición</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Requerimiento Inicial */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Requerimiento Original Reportado
                    </p>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 leading-relaxed font-medium">
                      {parseEnrichedDescription(enrichedActiveCase.descripcion).rawDescription || enrichedActiveCase.descripcion}
                    </div>
                  </div>

                  {/* Línea de Tiempo Institucional Completa */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined !text-[16px] text-azul-sena">history</span>
                      <span>Línea de Tiempo del Requerimiento</span>
                    </p>

                    {loadingHistorial && !caseHistorial[enrichedActiveCase._id] ? (
                      <AdaptiveSkeletonDetail />
                    ) : (
                      <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-2xs">
                        <FuncionarioTimeline
                          solicitud={enrichedActiveCase}
                          onOpenPreview={(url) => setPreviewImage(url)}
                        />
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer del Drawer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Trazabilidad SENA CTPI
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDetailDrawerOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Cerrar Auditoría
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODAL VISOR DE EVIDENCIA EN ALTA DEFINICIÓN */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setPreviewImage(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-slate-900/90 flex items-center justify-between border-b border-slate-800 text-white">
                <span className="text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[16px] text-emerald-400">image</span>
                  <span>Evidencia Fotográfica de la Solución</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined !text-[18px]">close</span>
                </button>
              </div>
              <div className="p-2 flex items-center justify-center bg-black">
                <img
                  src={previewImage}
                  alt="Evidencia ampliada"
                  className="max-h-[80vh] w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
