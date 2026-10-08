import type { ReactNode } from 'react'
import { SemanticIcon, StatusBadge, SearchField, AdaptiveSkeletonList, PaginationFooter } from '@/shared/ui'
import type { Solicitud } from '@/shared/types'
import { parseEnrichedDescription, detectVisualSymptom, getFuncionarioPriorityScore } from '@/shared/utils/ticketContext'

export type FuncionarioQueueFilter = 'todos' | 'en_atencion' | 'esperando_respuesta' | 'resueltos'

interface FuncionarioCasesQueueProps {
  solicitudes: Solicitud[]
  activeCaseId: string | null
  loading: boolean
  error: string | null
  searchTerm: string
  onSearchChange: (value: string) => void
  currentFilter: FuncionarioQueueFilter
  onFilterChange: (filter: FuncionarioQueueFilter) => void
  onSelectCase: (solicitud: Solicitud) => void
  onRetry: () => void
  currentPage: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
}

export function FuncionarioCasesQueue({
  solicitudes,
  activeCaseId,
  loading,
  error,
  searchTerm,
  onSearchChange,
  currentFilter,
  onFilterChange,
  onSelectCase,
  onRetry,
  currentPage,
  onPageChange,
  itemsPerPage = 6,
}: FuncionarioCasesQueueProps): ReactNode {
  // 1. Filtrado por texto y por estado
  const filteredCases = solicitudes.filter((item) => {
    // Filtro por término
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !term ||
      (item.codigoCaso || '').toLowerCase().includes(term) ||
      (item.descripcion || '').toLowerCase().includes(term) ||
      (item.ambiente?.nombre || '').toLowerCase().includes(term)

    if (!matchesSearch) return false

    // Filtro por pestaña
    const est = (item.estado || '').toLowerCase()
    if (currentFilter === 'en_atencion') {
      return est === 'asignado' || est === 'en_progreso' || est === 'en_atencion' || est === 'solicitado' || est === 'pendiente' || est === 'nuevo'
    }
    if (currentFilter === 'esperando_respuesta') {
      return est === 'esperando_usuario' || est === 'requiere_informacion'
    }
    if (currentFilter === 'resueltos') {
      return est === 'resuelto' || est === 'finalizado' || est === 'cerrado'
    }
    return true
  }).sort((a, b) => {
    // Prioridad Operativa de Producto (Rol Funcionario / Docente):
    // 1. P0 (Score 5): Esperando respuesta del funcionario (bloqueo en su cancha)
    // 2. P0 (Score 8): Resuelto/Finalizado (esperando su visto bueno para cerrar)
    // 3. P1 (Score 12): Intervención técnica activa en su ambiente (en atención)
    // 4. P1 (Score 15-18): Emergencias de alto impacto (Clase en Vivo / Atención al Público)
    // 5. P2 (Score 22-26): Asignados y nuevos en trámite estándar en mesa TIC
    // 6. P3 (Score 60): Cerrados y formalizados
    const scoreDiff =
      getFuncionarioPriorityScore(a.estado, a.descripcion) -
      getFuncionarioPriorityScore(b.estado, b.descripcion)

    if (scoreDiff !== 0) return scoreDiff

    // Desempate por fecha más reciente: solicitudes nuevas siempre van primero
    const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
    const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
    return dateB - dateA
  })

  // 2. Paginación
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredCases.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
      {/* Barra de Búsqueda y Pestañas de Filtro */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SemanticIcon name="cola" className="text-slate-600 !text-[18px]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Tus Solicitudes</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
            {filteredCases.length}
          </span>
        </div>

        <SearchField
          placeholder="Buscar por radicado, falla o ambiente..."
          value={searchTerm}
          onChange={(val) => {
            onSearchChange(val)
            onPageChange(1)
          }}
        />

        {/* Pestañas de Filtro Rápidas */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/60 rounded-xl text-xs">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'en_atencion', label: 'En curso' },
            { id: 'esperando_respuesta', label: 'Tu respuesta' },
            { id: 'resueltos', label: 'Resueltas' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onFilterChange(tab.id as FuncionarioQueueFilter)
                onPageChange(1)
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
                currentFilter === tab.id
                  ? 'bg-white text-azul-sena shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de la Lista */}
      {loading ? (
        <div className="p-4">
          <AdaptiveSkeletonList count={5} />
        </div>
      ) : error ? (
        <div className="p-5 text-center space-y-3">
          <p className="text-xs text-red-600 font-semibold">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-bold text-azul-sena hover:underline"
          >
            Reintentar carga
          </button>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <SemanticIcon name="solucionado" className="!text-[36px] mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No hay solicitudes en esta vista</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Tus solicitudes registradas aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto" role="list">
          {currentItems.map((item) => {
            const isSelected = activeCaseId === item._id
            const isEnCurso = item.estado === 'en_progreso' || item.estado === 'en_atencion'
            const isEsperando = item.estado === 'esperando_usuario' || item.estado === 'requiere_informacion'
            const parsed = parseEnrichedDescription(item.descripcion)

            return (
              <button
                key={item._id}
                type="button"
                onClick={() => onSelectCase(item)}
                className={`w-full text-left p-4 transition-all duration-200 ease-out flex flex-col gap-2 relative cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/80 border-l-[5px] border-l-azul-sena shadow-sm scale-[1.01] z-10 ring-1 ring-blue-100'
                    : isEnCurso
                    ? 'bg-emerald-50/20 hover:bg-emerald-50/50 border-l-[5px] border-l-emerald-500'
                    : 'hover:bg-slate-50/90 bg-white border-l-[5px] border-l-transparent hover:translate-x-0.5'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] sm:text-xs font-black text-azul-sena tracking-tight">
                      #{item.codigoCaso || item._id.slice(-6)}
                    </span>
                    {isEnCurso && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                        <span>En atención</span>
                      </span>
                    )}
                    {isSelected && !isEnCurso && (
                      <span className="h-1.5 w-1.5 rounded-full bg-azul-sena animate-ping shrink-0" />
                    )}
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={item.estado} />
                  </div>
                </div>

                {/* Fila 2: Síntoma Visual Diagnóstico + Badges de Alto Impacto (Clase en Vivo / Atención al Público) */}
                {(() => {
                  const symptom = detectVisualSymptom(parsed, item.descripcion)
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {/* Badge de Síntoma Visual Institucional */}
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/90 flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[13px] text-azul-sena">{symptom.icono}</span>
                        <span>{symptom.titulo}</span>
                      </span>

                      {parsed.impactoServicio === 'atencion_publico' && (
                        <span className="font-black text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 animate-pulse">
                          <span className="material-symbols-outlined !text-[12px] text-amber-700">emergency</span>
                          <span>Atención al Público</span>
                        </span>
                      )}
                      {parsed.modoExpress && (
                        <span className="font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                          <span className="material-symbols-outlined !text-[12px] text-rose-700 animate-bounce">bolt</span>
                          <span>Clase en Vivo</span>
                        </span>
                      )}
                    </div>
                  )
                })()}

                <h3 className={`font-jakarta text-xs sm:text-[13px] font-bold line-clamp-2 leading-snug transition-colors ${
                  isSelected ? 'text-azul-sena font-extrabold' : 'text-slate-800 group-hover:text-slate-900'
                }`}>
                  {parsed.rawDescription || item.descripcion}
                </h3>

                {/* Fila 3: Técnico Asignado + Ubicación Física Desduplicada */}
                {(() => {
                  const baseAmbiente = item.ambiente?.nombre?.trim() || ''
                  const oficina = parsed.oficina?.trim() || ''
                  const puesto = parsed.puesto?.trim() || ''

                  const isOficinaSame = oficina && baseAmbiente.toLowerCase().includes(oficina.toLowerCase())
                  const isAmbienteSame = baseAmbiente && oficina.toLowerCase().includes(baseAmbiente.toLowerCase())
                  
                  const mainLocation = isOficinaSame || isAmbienteSame
                    ? (baseAmbiente || oficina || 'General')
                    : [baseAmbiente, oficina].filter(Boolean).join(' · ')

                  const puestoText = puesto ? ` · ${puesto.startsWith('Puesto') || puesto.startsWith('Ventanilla') ? puesto : `Puesto ${puesto}`}` : ''

                  return (
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 pt-1.5 border-t border-slate-100">
                      <span className="font-medium text-slate-600 truncate max-w-[150px] sm:max-w-[180px] flex items-center gap-1 text-[11px] sm:text-xs">
                        <span className="material-symbols-outlined !text-[13px] sm:!text-[14px] text-azul-sena shrink-0">support_agent</span>
                        <span className="truncate">
                          {item.tecnico && typeof item.tecnico === 'object'
                            ? item.tecnico.nombre
                            : 'Mesa TIC en asignación'}
                        </span>
                      </span>
                      <span className="font-bold text-emerald-800 flex items-center gap-1 text-[10px] sm:text-[11px] shrink-0 truncate max-w-[150px]">
                        <span className="material-symbols-outlined !text-[13px] text-emerald-600">apartment</span>
                        <span className="truncate">{mainLocation}{puestoText}</span>
                      </span>
                    </div>
                  )
                })()}

                {isEsperando && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200 mt-0.5 shadow-2xs animate-pulse">
                    <span className="material-symbols-outlined !text-[15px] text-amber-600">notification_important</span>
                    <span>Acción requerida: responde al técnico</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {filteredCases.length > itemsPerPage ? (
        <div className="border-t border-slate-200 bg-slate-50">
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCases.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            itemLabel="solicitudes"
            className="!p-3"
          />
        </div>
      ) : null}
    </div>
  )
}
