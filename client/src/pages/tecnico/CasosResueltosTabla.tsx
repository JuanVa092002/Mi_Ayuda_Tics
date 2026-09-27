import { useState, useEffect, type ReactNode } from 'react'
import { AppShell, PageHeader, SearchField, PaginationFooter, StatusBadge } from '@/shared/ui'
import { getCasosFinalizados } from '@/features/tickets'
import type { Solicitud } from '@/shared/types'

function getSolucionText(solucion: Solicitud['solucion']): string {
  if (!solucion) return ''
  if (typeof solucion === 'string') return solucion
  return solucion.descripcionSolucion ?? ''
}

function getSolucionEvidencia(solucion: Solicitud['solucion']): string | undefined {
  if (!solucion || typeof solucion === 'string') return undefined
  return solucion.evidencia?.url
}

export default function CasosResueltosTabla(): ReactNode {
  const [cases, setCases] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const fetchCases = async (): Promise<void> => {
      try {
        const solicitudes = await getCasosFinalizados()
        setCases(solicitudes)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error al obtener los casos resueltos:', error)
        }
      } finally {
        setLoading(false)
      }
    }
    void fetchCases()
  }, [])

  const filteredData = cases.filter(c =>
    (c.codigoCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof c.usuario === 'object' && c.usuario?.nombre
      ? c.usuario.nombre
      : ''
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    getSolucionText(c.solucion).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <AppShell subtitleContext="Atención Técnica">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <PageHeader
          category="Atención Técnica"
          title="Historial de Casos Resueltos"
          description="Registro histórico y trazabilidad de requerimientos cerrados y solucionados."
        />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border hairline-border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {totalItems} incidentes en el histórico
          </p>
          <div className="w-full sm:w-80">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por código, solicitante o solución..."
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border hairline-border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="premium-table-container">
            <table className="premium-table">
              <thead className="premium-thead">
                <tr>
                  <th className="premium-th min-w-[120px]">Ticket</th>
                  <th className="premium-th min-w-[120px]">Fecha</th>
                  <th className="premium-th min-w-[160px]">Solicitante</th>
                  <th className="premium-th min-w-[240px]">Problema</th>
                  <th className="premium-th min-w-[240px]">Solución Aplicada</th>
                  <th className="premium-th text-center w-[80px]">Evidencia</th>
                  <th className="premium-th min-w-[130px] text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-60" role="status" aria-live="polite">
                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-slate-200 border-t-[#04324d]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cargando histórico...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((row) => {
                    const evidenciaUrl = getSolucionEvidencia(row.solucion)
                    return (
                      <tr key={row._id} className="premium-tr">
                        <td className="premium-td">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[16px] text-primary-container font-variation-['wght'_300]">confirmation_number</span>
                            <span className="text-xs font-bold text-primary-container">#{row.codigoCaso || row._id?.slice(-6) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface">
                            <span className="material-symbols-outlined !text-[15px] text-slate-400">calendar_today</span>
                            <span>{row.fecha ? new Date(row.fecha).toLocaleDateString() : '—'}</span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined !text-[14px] text-slate-500">person</span>
                            </div>
                            <span className="text-xs font-semibold text-on-surface truncate max-w-[150px]">
                              {typeof row.usuario === 'object' ? row.usuario?.nombre : 'No asignado'}
                            </span>
                          </div>
                        </td>
                        <td className="premium-td">
                          <p className="text-xs font-normal text-on-surface leading-relaxed line-clamp-2 max-w-xs">
                            {row.descripcion}
                          </p>
                        </td>
                        <td className="premium-td">
                          <p className="text-xs font-normal text-emerald-800 leading-relaxed line-clamp-2 max-w-xs">
                            {getSolucionText(row.solucion) || '—'}
                          </p>
                        </td>
                        <td className="premium-td text-center">
                          {evidenciaUrl ? (
                            <a href={evidenciaUrl} target="_blank" rel="noreferrer" className="inline-block group/thumb">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 group-hover/thumb:border-primary-container transition-all">
                                <img src={evidenciaUrl} alt="Evidencia de solución" className="w-full h-full object-cover" />
                              </div>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="premium-td text-center">
                          <StatusBadge status={row.estado} />
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <span className="material-symbols-outlined !text-[48px] text-slate-400">history</span>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No hay registros en el histórico resuelto</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="casos resueltos"
          />
        </div>
      </div>
    </AppShell>
  )
}
