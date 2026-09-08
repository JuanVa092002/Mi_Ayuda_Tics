import { useEffect, useState } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import {
  getAmbientes,
  createAmbiente,
  updateAmbiente,
  inactivarAmbiente,
} from '@/features/ambientes'
import { toast } from 'react-toastify'
import type { AmbienteFormacion } from '@/shared/types'

export default function AdminAmbientes() {
  const [ambientes, setAmbientes] = useState<AmbienteFormacion[]>([])
  const [nombre, setNombre] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [currentAmbienteId, setCurrentAmbienteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    loadAmbientes()
  }, [])

  const loadAmbientes = async () => {
    try {
      const data = await getAmbientes()
      setAmbientes(data.data ?? [])
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      toast.error('Error al cargar ambientes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async () => {
    try {
      if (editMode && currentAmbienteId) {
        await updateAmbiente(currentAmbienteId, { nombre })
        toast.success('Ambiente actualizado')
      } else {
        await createAmbiente({ nombre })
        toast.success('Ambiente creado')
      }
      setNombre('')
      setEditMode(false)
      loadAmbientes()
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      toast.error('Error en la operación')
    }
  }

  const handleEdit = (ambiente: AmbienteFormacion) => {
    setNombre(ambiente.nombre)
    setCurrentAmbienteId(ambiente._id)
    setEditMode(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleInactivar = async (id: string) => {
    try {
      await inactivarAmbiente(id)
      toast.success('Ambiente inactivado')
      loadAmbientes()
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      toast.error('Error al inactivar')
    }
  }

  const filteredData = ambientes.filter(row =>
    row.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <LeaderLayout>
        <main className="p-4 sm:p-8 flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
          
          {/* Left Column: Form Section */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24">
              <div className="solid-card rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border hairline-border border-white/40">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-4">
                    <span className="material-symbols-outlined !text-[24px]">meeting_room</span>
                  </div>
                  <h2 className="text-xl font-black text-on-surface tracking-tight">
                    {editMode ? 'Editar' : 'Nuevo'} Ambiente
                  </h2>
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">
                    Gestión de Ubicaciones
                  </p>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleCreateOrUpdate()
                  }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/70 ml-1">Nombre del Ambiente</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej: Sala de Sistemas 401"
                      required
                      className="w-full px-4 py-3 solid-input rounded-2xl text-sm font-semibold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary-container/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-primary-container text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {editMode ? 'Guardar Cambios' : 'Registrar Ambiente'}
                    </button>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false)
                          setNombre('')
                        }}
                        className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Helper Card */}
              <div className="mt-6 p-6 bg-blue-50/50 rounded-3xl border hairline-border border-blue-100/50">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-blue-400 !text-[20px]">info</span>
                  <p className="text-xs font-medium text-blue-700/70 leading-relaxed">
                    Los ambientes creados estarán disponibles para que los funcionarios reporten sus casos técnicos.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Table Section */}
          <div className="flex-1 min-w-0">
            <section className="solid-card rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl shadow-slate-200/30">
              {/* Table Header */}
              <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Listado de Ambientes</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Directorio de sedes y salas de formación.</p>
                </div>
                <div className="relative w-full sm:w-72 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px] group-focus-within:text-primary-container transition-colors">search</span>
                  <input 
                    className="w-full pl-11 pr-4 py-2.5 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all placeholder:text-slate-400" 
                    placeholder="Filtrar ambientes..." 
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
                      <th className="py-4 px-8 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200">Nombre</th>
                      <th className="py-4 px-8 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200">Estado</th>
                      <th className="py-4 px-8 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70 border-b hairline-border border-slate-200 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30 animate-pulse">
                            <span className="material-symbols-outlined !text-[48px] animate-spin">progress_activity</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Sincronizando ambientes...</p>
                          </div>
                        </td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((ambiente) => (
                        <tr key={ambiente._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-6 px-8 align-top">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined !text-[18px] text-slate-300 font-variation-['wght'_300]">meeting_room</span>
                              <span className="text-[13px] font-bold text-on-surface group-hover:text-primary-container transition-colors">{ambiente.nombre}</span>
                            </div>
                          </td>
                          <td className="py-6 px-8 align-top">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border hairline-border bg-emerald-50 text-emerald-700 border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>Operativo
                            </span>
                          </td>
                          <td className="py-6 px-8 align-top text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(ambiente)}
                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary-container hover:text-white transition-all flex items-center justify-center border hairline-border border-slate-100"
                              >
                                <span className="material-symbols-outlined !text-[18px]">edit</span>
                              </button>
                              <button 
                                onClick={() => handleInactivar(ambiente._id)}
                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border hairline-border border-slate-100"
                              >
                                <span className="material-symbols-outlined !text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                            <span className="material-symbols-outlined !text-[64px]">location_off</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">No hay ambientes registrados</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-6 border-t hairline-border border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Página {currentPage} de {totalPages || 1}</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{totalItems} registros totales</span>
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
          </div>
        </main>
    </LeaderLayout>
  )
}
