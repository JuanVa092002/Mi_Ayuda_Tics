import { useEffect, useState, type ReactNode } from 'react'
import { historialSolicitudesFuncionario } from '@/features/tickets'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { SearchField, PaginationFooter, StatusBadge, EmptyState, ErrorState } from '@/shared/ui'
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

  useEffect(() => {
    void fetchHistorial()
  }, [refreshKey])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredData = historial.filter(
    (row) =>
      (row.codigoCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <section className="premium-card rounded-3xl overflow-hidden flex flex-col h-full bg-white shadow-xl">
      {/* Header of Table */}
      <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h2 className="text-xl font-black text-azul-sena tracking-tight">Historial de Solicitudes</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Seguimiento en tiempo real de tus incidencias radicadas
          </p>
        </div>
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por código o descripción..."
          label="Buscar en historial de solicitudes"
        />
      </div>

      {/* Table Body - Natural Flow Container */}
      <div className="premium-table-container">
        <table className="premium-table">
          <thead className="premium-thead">
            <tr>
              <th className="premium-th min-w-[110px]">Ticket</th>
              <th className="premium-th min-w-[130px]">Registro</th>
              <th className="premium-th min-w-[120px]">Categoría</th>
              <th className="premium-th min-w-[140px]">Ubicación</th>
              <th className="premium-th min-w-[280px]">Detalle del Caso</th>
              <th className="premium-th text-center w-[80px]">Media</th>
              <th className="premium-th min-w-[130px]">Estado</th>
              <th className="premium-th min-w-[160px]">Especialista</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-60" role="status" aria-live="polite">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-azul-sena" />
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Cargando historial...
                    </p>
                  </div>
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan={8} className="py-12">
                  <ErrorState message={fetchError} onRetry={() => void fetchHistorial()} />
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((row) => (
                <tr key={row._id} className="premium-tr group">
                  {/* Ticket */}
                  <td className="premium-td">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[16px] text-azul-sena/50">
                          confirmation_number
                        </span>
                        <span className="text-[13px] font-bold text-azul-sena leading-none">
                          #{row.codigoCaso}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5">
                        Caso Oficial
                      </span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="premium-td">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[15px] text-slate-400">
                          calendar_today
                        </span>
                        <span className="text-[13px] font-semibold text-slate-800 whitespace-nowrap leading-none">
                          {row.fecha}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5">
                        Fecha Reporte
                      </span>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="premium-td">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[15px] text-azul-sena/50">
                          category
                        </span>
                        <span className="text-[13px] font-semibold text-slate-800 whitespace-nowrap leading-none">
                          {typeof row.tipoCaso === 'object' ? row.tipoCaso?.nombre : 'General'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5">
                        Tipo de Caso
                      </span>
                    </div>
                  </td>

                  {/* Ambiente */}
                  <td className="premium-td">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[16px] text-verde-sena">
                          location_on
                        </span>
                        <span className="text-[13px] font-medium text-slate-800 leading-snug">
                          {row.ambiente?.nombre || 'No especificado'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-5">
                        Ubicación
                      </span>
                    </div>
                  </td>

                  {/* Descripción & Solución */}
                  <td className="premium-td">
                    <div className="flex flex-col gap-2 max-w-[380px]">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="material-symbols-outlined !text-[14px] text-slate-400">
                            description
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            Reporte
                          </span>
                        </div>
                        <p className="text-[13px] font-medium text-slate-800 leading-relaxed line-clamp-3">
                          {row.descripcion}
                        </p>
                      </div>
                      {typeof row.solucion === 'object' && row.solucion?.descripcionSolucion ? (
                        <div className="pl-3 border-l-2 border-verde-sena/40 py-0.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="material-symbols-outlined !text-[13px] text-verde-sena">
                              task_alt
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-verde-sena">
                              Resolución Técnica
                            </span>
                          </div>
                          <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">
                            {row.solucion.descripcionSolucion}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </td>

                  {/* Foto */}
                  <td className="premium-td text-center">
                    {row.foto ? (
                      <a
                        href={row.foto.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-col items-center gap-1 group/thumb focus:outline-none focus:ring-2 focus:ring-azul-sena rounded-xl p-1"
                        onClick={(e) => e.stopPropagation()}
                        title="Ver evidencia"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border hairline-border border-slate-200 group-hover/thumb:border-azul-sena transition-all shadow-sm relative">
                          <img src={row.foto.url} alt="Evidencia" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-azul-sena/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined !text-[16px] text-white">visibility</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase group-hover/thumb:text-azul-sena">
                          Ver
                        </span>
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mx-auto">
                        <span className="material-symbols-outlined text-slate-300 text-[18px]">
                          image_not_supported
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="premium-td">
                    <StatusBadge status={row.estado} label={row.displayStatus} />
                  </td>

                  {/* Técnico */}
                  <td className="premium-td">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined !text-[14px] text-slate-600">
                            support_agent
                          </span>
                        </div>
                        <span className="text-[13px] font-bold text-slate-800 truncate max-w-[130px]">
                          {typeof row.tecnico === 'object' && row.tecnico?.nombre
                            ? row.tecnico.nombre
                            : 'Por asignar'}
                        </span>
                      </div>
                      {typeof row.tecnico === 'object' && row.tecnico ? (
                        <span className="text-[9px] font-bold text-verde-sena uppercase tracking-wider pl-7">
                          Especialista Asignado
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-7">
                          Cola de espera
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8">
                  <EmptyState
                    icon="task"
                    title="Sin solicitudes registradas"
                    description={
                      searchTerm
                        ? 'No se encontraron coincidencias para tu búsqueda.'
                        : 'Aún no has radicado incidencias. Usa el formulario para crear una nueva.'
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <PaginationFooter
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="solicitudes"
      />
    </section>
  )
}
