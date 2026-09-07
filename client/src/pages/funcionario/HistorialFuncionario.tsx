import { useEffect, useState, type ReactNode } from 'react'
import { historialSolicitudesFuncionario } from '@/features/tickets'
import { getApiErrorMessage } from '@/shared/api/apiError'
import type { Solicitud } from '@/shared/types'

interface HistorialFuncionarioProps {
  refreshKey: number
}

export default function HistorialFuncionario({ refreshKey }: HistorialFuncionarioProps): ReactNode {
  const [historial, setHistorial] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const solicitudes = await historialSolicitudesFuncionario()
        setHistorial(solicitudes)
      } catch (error) {
        setFetchError(getApiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    fetchHistorial()
  }, [refreshKey])

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredData = historial.filter(row =>
    (row.codigoCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination Logic
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const getStatusBadge = (row: Solicitud): ReactNode => {
    const estado = row.estado
    const label = row.displayStatus
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border hairline-border transition-all";
    switch (estado) {
      case 'solicitado':
      case 'nuevo':
        return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>{label || 'Enviada'}
        </span>
      case 'asignado':
        return <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>{label || 'Asignado'}
        </span>
      case 'pendiente':
      case 'en_progreso':
      case 'esperando_usuario':
      case 'resuelto':
        return <span className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-100`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>{label || 'En Proceso'}
        </span>
      case 'finalizado':
      case 'cerrado':
      case 'cancelado':
        return <span className={`${baseClasses} bg-green-50 text-green-700 border-green-100`}>
          <span className="material-symbols-outlined !text-[12px] mr-1">verified</span>{label || 'Completado'}
        </span>
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-600 border-slate-200`}>{label || estado}</span>
    }
  }

  return (
    <section className="solid-card rounded-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
      {/* Header of Table */}
      <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Historial de Solicitudes</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Mostrando registros paginados para mayor claridad.</p>
        </div>
        <div className="relative w-full sm:w-72 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px] group-focus-within:text-primary-container transition-colors">search</span>
          <input 
            className="w-full pl-11 pr-4 py-2.5 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all placeholder:text-slate-400" 
            placeholder="Buscar por código o descripción..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Body - Premium UX/UI Overhaul with Scroll Control */}
      <div className="w-full overflow-auto max-h-[calc(100vh-350px)] hairline-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-0">
          <thead className="sticky-header">
            <tr>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[100px]">Ticket</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[130px]">Registro</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[120px]">Categoría</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[140px]">Ubicación</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[280px]">Detalle del Caso</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 text-center w-[80px]">Media</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[140px]">Estado</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 min-w-[160px]">Seguimiento</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-40" role="status" aria-live="polite">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#04324d]" />
                    <p className="text-sm font-black uppercase tracking-[0.2em]">Cargando historial...</p>
                  </div>
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan={8} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 text-red-600">
                    <span className="material-symbols-outlined !text-[48px]">error</span>
                    <p className="text-sm font-semibold">{fetchError}</p>
                  </div>
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Ticket - Align Top */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[16px] text-primary-container/40 font-variation-['wght'_300]">confirmation_number</span>
                        <span className="text-[13px] font-bold text-primary-container leading-none">
                          #{row.codigoCaso}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">ID Sistema</span>
                    </div>
                  </td>

                  {/* Fecha - Align Top */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[16px] text-slate-300 font-variation-['wght'_300]">calendar_today</span>
                        <span className="text-[13px] font-semibold text-on-surface whitespace-nowrap leading-none">{row.fecha}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">Fecha Reporte</span>
                    </div>
                  </td>

                  {/* Categoría - Align Top */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[16px] text-primary/40 font-variation-['wght'_300]">category</span>
                        <span className="text-[13px] font-semibold text-on-surface whitespace-nowrap leading-none">
                          {typeof row.tipoCaso === 'object' ? row.tipoCaso?.nombre : 'General'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">Tipo de Caso</span>
                    </div>
                  </td>

                  {/* Ambiente - Align Top */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[18px] text-emerald-500 font-variation-['FILL'_1,'wght'_300]">location_on</span>
                        <span className="text-[13px] font-medium text-on-surface leading-snug">
                          {row.ambiente?.nombre || 'No especificado'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-6">Ubicación</span>
                    </div>
                  </td>

                  {/* Descripción & Solución - Combined for UX Flow */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-3 max-w-[400px]">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="material-symbols-outlined !text-[14px] text-slate-300 font-variation-['wght'_300]">history_edu</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reporte Inicial</span>
                        </div>
                        <p className="text-[13px] font-medium text-on-surface leading-relaxed line-clamp-3">
                          {row.descripcion}
                        </p>
                      </div>
                      {typeof row.solucion === 'object' && row.solucion?.descripcionSolucion && (
                        <div className="pl-4 border-l-2 border-emerald-500/20 py-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined !text-[14px] text-emerald-500/50 font-variation-['FILL'_1,'wght'_300]">verified_user</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Resolución Técnica</span>
                          </div>
                          <p className="text-[12px] font-medium text-on-surface-variant leading-relaxed italic">
                            {row.solucion.descripcionSolucion}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Foto - Align Top */}
                  <td className="py-6 px-6 align-top text-center">
                    {row.foto ? (
                      <a 
                        href={row.foto.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex flex-col items-center gap-1 group/thumb"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border hairline-border border-slate-200 group-hover/thumb:border-primary-container transition-all shadow-sm relative">
                           <img src={row.foto.url} alt="Evidencia" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-primary-container/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined !text-[16px] text-white">visibility</span>
                           </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase group-hover/thumb:text-primary-container">Ver</span>
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mx-auto">
                        <span className="material-symbols-outlined text-slate-300 text-[18px] font-variation-['wght'_300]">image_not_supported</span>
                      </div>
                    )}
                  </td>

                  {/* Estado - Align Top */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-2">
                       {getStatusBadge(row)}
                    </div>
                  </td>

                  {/* Técnico - Align Top */}
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary-container/10 transition-colors">
                          <span className="material-symbols-outlined !text-[14px] text-on-surface-variant group-hover:text-primary-container font-variation-['FILL'_1,'wght'_300]">support_agent</span>
                        </div>
                        <span className="text-[13px] font-bold text-on-surface truncate max-w-[120px] group-hover:text-primary-container transition-colors">
                          {typeof row.tecnico === 'object' ? row.tecnico?.nombre : 'Por asignar'}
                        </span>
                      </div>
                      {typeof row.tecnico === 'object' && row.tecnico ? (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider pl-8 italic">Agente Activo</span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider pl-8">Cola de espera</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-24 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-30">
                      <span className="material-symbols-outlined !text-[64px]">layers_clear</span>
                      <p className="text-sm font-black uppercase tracking-[0.2em]">Sin actividad registrada</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer of Table */}
      <div className="p-6 border-t hairline-border border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Página {currentPage} de {totalPages || 1}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {totalItems} registros totales
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevPage}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center border hairline-border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
          >
            <span className="material-symbols-outlined !text-[20px] group-active:scale-90 transition-transform">chevron_left</span>
          </button>
          <button 
            onClick={nextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center border hairline-border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
          >
            <span className="material-symbols-outlined !text-[20px] group-active:scale-90 transition-transform">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}
