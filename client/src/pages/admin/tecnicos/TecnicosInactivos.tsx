import { useEffect, useState } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import { getTecnicosInactivos, reactivarTecnico } from '@/features/users'
import { toast } from 'react-toastify'
import AdminTecnicosLayout from '@/app/layouts/AdminTecnicosLayout'
import type { User } from '@/shared/types'

export default function TecnicosInactivos() {
  const [tecnicosInactivos, setTecnicosInactivos] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const cargarTecnicosInactivos = async () => {
      try {
        const { data } = await getTecnicosInactivos()
        setTecnicosInactivos(data ?? [])
      } catch (error) {
        console.error('Error al cargar técnicos inactivos:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarTecnicosInactivos()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredTecnicos = tecnicosInactivos.filter(tecnico =>
    tecnico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnico.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleReactivar = async (id: string) => {
    try {
      await reactivarTecnico(id)
      toast.success('Técnico reactivado exitosamente')
      setTecnicosInactivos(prevState => prevState.filter(tecnico => tecnico._id !== id))
    } catch (error) {
      toast.error('Error al reactivar técnico')
      console.error('Error al reactivar técnico:', error)
    }
  }

  // Pagination Logic
  const totalItems = filteredTecnicos.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTecnicos.slice(indexOfFirstItem, indexOfLastItem)

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  return (
    <LeaderLayout>
        <AdminTecnicosLayout>
          <main className="p-4 sm:p-8">
            <section className="solid-card rounded-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              {/* Header of Table */}
              <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Técnicos Inactivos</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Personal con acceso restringido pendiente de reactivación.</p>
                </div>
                <div className="relative w-full sm:w-72 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px] group-focus-within:text-primary-container transition-colors">search</span>
                  <input 
                    className="w-full pl-11 pr-4 py-2.5 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all placeholder:text-slate-400" 
                    placeholder="Buscar técnico por nombre..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table Body */}
              <div className="w-full overflow-auto max-h-[calc(100vh-350px)] hairline-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-0">
                  <thead className="sticky-header">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200">Nombre Completo</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200">Correo Electrónico</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200">Teléfono</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200">Estado</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30 animate-pulse">
                            <span className="material-symbols-outlined !text-[48px] animate-spin">progress_activity</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Cargando historial...</p>
                          </div>
                        </td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((tecnico) => (
                        <tr key={tecnico._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-100 grayscale">
                                {tecnico.nombre.charAt(0)}
                              </div>
                              <span className="text-[13px] font-bold text-on-surface opacity-60">{tecnico.nombre}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className="text-[13px] font-medium text-on-surface-variant opacity-60">{tecnico.correo}</span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className="text-[13px] font-semibold text-on-surface opacity-60">{tecnico.telefono}</span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border hairline-border bg-slate-50 text-slate-600 border-slate-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>Inactivo
                            </span>
                          </td>
                          <td className="py-6 px-6 align-top text-right">
                            <button 
                              onClick={() => handleReactivar(tecnico._id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-[11px] font-bold border hairline-border border-blue-100"
                            >
                              <span className="material-symbols-outlined !text-[16px]">person_check</span>
                              Reactivar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                            <span className="material-symbols-outlined !text-[64px]">group_off</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">No hay técnicos inactivos</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-6 border-t hairline-border border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Página {currentPage} de {totalPages || 1}</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{totalItems} técnicos en archivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevPage} disabled={currentPage === 1} className="w-9 h-9 rounded-xl flex items-center justify-center border hairline-border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm group">
                    <span className="material-symbols-outlined !text-[20px] group-active:scale-90 transition-transform">chevron_left</span>
                  </button>
                  <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="w-9 h-9 rounded-xl flex items-center justify-center border hairline-border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm group">
                    <span className="material-symbols-outlined !text-[20px] group-active:scale-90 transition-transform">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </AdminTecnicosLayout>
    </LeaderLayout>
  )
}
