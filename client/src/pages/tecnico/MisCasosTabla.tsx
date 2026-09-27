import { useState, useEffect, type ReactNode } from 'react'
import { AppShell, PageHeader, SearchField, PaginationFooter, StatusBadge } from '@/shared/ui'
import { getCasosAsignados } from '@/features/tickets'
import type { Solicitud } from '@/shared/types'

export default function MisCasosTabla(): ReactNode {
  const [cases, setCases] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const fetchCases = async (): Promise<void> => {
      try {
        const solicitudes = await getCasosAsignados()
        setCases(solicitudes)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error al obtener mis casos:', error)
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
      .includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <AppShell subtitleContext="Atención Técnica">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <PageHeader
          category="Atención Técnica"
          title="Mis Asignaciones"
          description="Gestión activa de casos y requerimientos bajo tu responsabilidad técnica directa."
        />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border hairline-border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {totalItems} casos asignados en total
          </p>
          <div className="w-full sm:w-80">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por ticket, solicitante o detalle..."
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
                  <th className="premium-th min-w-[140px]">Ubicación</th>
                  <th className="premium-th min-w-[180px]">Solicitante</th>
                  <th className="premium-th min-w-[280px]">Descripción</th>
                  <th className="premium-th min-w-[130px] text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-60" role="status" aria-live="polite">
                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-slate-200 border-t-[#04324d]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cargando asignaciones...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((row) => (
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
                        <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface">
                          <span className="material-symbols-outlined !text-[16px] text-emerald-600 font-variation-['FILL'_1]">location_on</span>
                          <span>{row.ambiente?.nombre || 'General'}</span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined !text-[14px] text-slate-500">person</span>
                          </div>
                          <span className="text-xs font-semibold text-on-surface truncate max-w-[160px]">
                            {typeof row.usuario === 'object' ? row.usuario?.nombre : 'No asignado'}
                          </span>
                        </div>
                      </td>
                      <td className="premium-td">
                        <p className="text-xs font-normal text-on-surface leading-relaxed line-clamp-2 max-w-sm">
                          {row.descripcion}
                        </p>
                      </td>
                      <td className="premium-td text-center">
                        <StatusBadge status={row.estado} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <span className="material-symbols-outlined !text-[48px] text-slate-400">task_alt</span>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No tienes asignaciones pendientes</p>
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
            itemLabel="casos asignados"
          />
        </div>
      </div>
    </AppShell>
  )
}
