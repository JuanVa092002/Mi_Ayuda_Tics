import { useState, useEffect, type FormEvent } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import { getCasos, createCaso, updateCaso } from '@/features/tickets'
import { toast } from 'react-toastify'
import type { TipoCaso } from '@/shared/types'

export default function AdminCasos() {
  const [casos, setCasos] = useState<TipoCaso[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editCasoId, setEditCasoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    loadCasos()
  }, [])

  const loadCasos = async () => {
    setLoading(true)
    try {
      const response = await getCasos()
      setCasos(response.data ?? [])
    } catch (error) {
      console.error('Error al obtener los tipos de casos', error)
      toast.error('Error al cargar los tipos de soporte')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nuevoCaso = { nombre, descripcion }

    try {
      if (editMode && editCasoId) {
        await updateCaso(editCasoId, nuevoCaso)
        toast.success('Tipo de caso actualizado exitosamente')
      } else {
        await createCaso(nuevoCaso)
        toast.success('Tipo de caso creado exitosamente')
      }
      resetForm()
      loadCasos()
    } catch (error) {
      console.error('Error al crear/actualizar tipo de caso', error)
      toast.error('Error en la operación')
    }
  }

  const handleEdit = (caso: TipoCaso) => {
    setEditMode(true)
    setEditCasoId(caso._id)
    setNombre(caso.nombre)
    setDescripcion(caso.descripcion ?? '')
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setNombre('')
    setDescripcion('')
    setEditMode(false)
    setEditCasoId(null)
  }

  const filteredData = casos.filter(c =>
    (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <LeaderLayout>
          <main className="p-4 sm:p-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Section */}
              <section className="lg:col-span-4">
                <div className="premium-card rounded-3xl p-6 sm:p-8 shadow-xl bg-white sticky top-8">
                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-4">
                      <span className="material-symbols-outlined !text-[28px] font-variation-['FILL'_1]">category</span>
                    </div>
                    <h2 className="text-xl font-bold text-on-surface tracking-tight">
                      {editMode ? 'Editar Soporte' : 'Nuevo Soporte'}
                    </h2>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      Define categorías para la clasificación técnica de incidentes.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nombre del soporte</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Ej: Hardware, Software..."
                        required
                        className="w-full px-4 py-3 solid-input rounded-2xl text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Descripción</label>
                      <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="Define el alcance de este soporte..."
                        required
                        className="w-full px-4 py-3 solid-input rounded-2xl text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all min-h-[120px] resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      {editMode && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="flex-1 py-3 rounded-2xl border hairline-border border-slate-200 text-on-surface-variant font-bold text-xs hover:bg-slate-50 transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-2xl bg-primary-container text-white font-bold text-xs hover:translate-y-[-1px] active:translate-y-[0px] transition-all shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined !text-[18px]">
                          {editMode ? 'save' : 'add_circle'}
                        </span>
                        {editMode ? 'Actualizar' : 'Crear'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Table Section */}
              <section className="lg:col-span-8">
                <div className="premium-card rounded-3xl overflow-hidden flex flex-col h-full shadow-xl bg-white">
                  <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface tracking-tight">Categorías de Soporte</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">Configuración actual del árbol de servicios.</p>
                    </div>
                    <div className="relative w-full sm:w-64 group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">search</span>
                      <input 
                        className="w-full pl-11 pr-4 py-2.5 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all" 
                        placeholder="Buscar categorías..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="premium-table-container max-h-[calc(100vh-320px)]">
                    <table className="premium-table">
                      <thead className="premium-thead">
                        <tr>
                          <th className="premium-th min-w-[200px]">Nombre</th>
                          <th className="premium-th min-w-[300px]">Descripción del Alcance</th>
                          <th className="premium-th text-center w-[120px]">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {loading ? (
                          <tr><td colSpan={3} className="py-20 text-center"><span className="animate-pulse font-bold text-slate-300 uppercase tracking-widest">Consultando tipos...</span></td></tr>
                        ) : currentItems.length > 0 ? (
                          currentItems.map((row) => (
                            <tr key={row._id} className="premium-tr group">
                              <td className="premium-td">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-slate-50 border hairline-border border-slate-200 flex items-center justify-center text-primary-container/60">
                                    <span className="material-symbols-outlined !text-[16px] font-variation-['wght'_300]">label</span>
                                  </div>
                                  <span className="text-[13px] font-bold text-on-surface leading-tight">{row.nombre}</span>
                                </div>
                              </td>
                              <td className="premium-td">
                                <p className="text-[12px] font-medium text-slate-500 leading-relaxed line-clamp-2 italic">
                                  {row.descripcion}
                                </p>
                              </td>
                              <td className="premium-td text-center">
                                <button 
                                  onClick={() => handleEdit(row)}
                                  className="w-9 h-9 rounded-xl bg-slate-50 border hairline-border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-container hover:bg-primary-container/5 hover:border-primary-container/20 transition-all active:scale-95 group/btn"
                                  title="Editar categoría"
                                >
                                  <span className="material-symbols-outlined !text-[18px] group-hover/btn:rotate-12 transition-transform">edit_note</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-24 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-20">
                                <span className="material-symbols-outlined !text-[64px]">inventory_2</span>
                                <p className="text-sm font-black uppercase tracking-[0.2em]">Sin categorías registradas</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="p-6 border-t hairline-border border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Catálogo — Página {currentPage}</span>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{totalItems} Tipos de Soporte</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1} 
                        className="w-10 h-10 rounded-xl border hairline-border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages || totalPages === 0} 
                        className="w-10 h-10 rounded-xl border hairline-border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </main>
    </LeaderLayout>
  )
}
