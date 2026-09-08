import { useEffect, useState } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import {
  getTecnicosPendientes,
  aprobarTecnico,
  denegarTecnico,
} from '@/features/users'
import { toast } from 'react-toastify'
import AdminTecnicosLayout from '@/app/layouts/AdminTecnicosLayout'
import type { User } from '@/shared/types'

export default function AdminTecnicos() {
  const [tecnicos, setTecnicos] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const { tecnicosFalse } = await getTecnicosPendientes()
        setTecnicos(tecnicosFalse)
      } catch (error) {
        console.error('Error al obtener técnicos pendientes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTecnicos()
  }, [])

  const handleAprobar = async (id: string) => {
    try {
      await aprobarTecnico(id)
      setTecnicos(tecnicos.filter(tecnico => tecnico._id !== id))
      toast.success('Técnico aprobado exitosamente.')
    } catch (error) {
      console.error('Error al aprobar técnico:', error)
      toast.error('Hubo un error al aprobar el técnico.')
    }
  }

  const handleDenegar = async (id: string) => {
    try {
      await denegarTecnico(id)
      setTecnicos(tecnicos.filter(tecnico => tecnico._id !== id))
      toast.success('Técnico denegado exitosamente.')
    } catch (error) {
      console.error('Error al denegar técnico:', error)
      toast.error('Hubo un error al denegar el técnico.')
    }
  }

  const filteredData = tecnicos.filter(t =>
    (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.correo || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <LeaderLayout>
        <AdminTecnicosLayout>
          <main className="p-8 animate-in fade-in duration-700">
            <section className="premium-card rounded-3xl overflow-hidden flex flex-col h-full shadow-xl">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-azul-sena">Técnicos por aprobar</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Revisión y acreditación de nuevos especialistas técnicos.</p>
                </div>
                <div className="relative w-full sm:w-80 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">search</span>
                  <input 
                    className="w-full pl-11 pr-4 py-3 solid-input rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all shadow-sm" 
                    placeholder="Filtrar aspirantes por nombre o correo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="premium-table-container max-h-[calc(100vh-320px)]">
                <table className="premium-table">
                  <thead className="premium-thead">
                    <tr>
                      <th className="premium-th min-w-[250px]">Aspirante</th>
                      <th className="premium-th min-w-[200px]">Información de Contacto</th>
                      <th className="premium-th text-center min-w-[150px]">Estatus</th>
                      <th className="premium-th text-center min-w-[200px]">Acciones de Acceso</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {loading ? (
                      <tr><td colSpan={4} className="py-20 text-center"><span className="animate-pulse font-bold text-slate-300 uppercase tracking-widest">Cargando base de datos...</span></td></tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((row) => (
                        <tr key={row._id} className="premium-tr group">
                          <td className="premium-td">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container font-black">
                                {row.nombre?.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-on-surface leading-tight">{row.nombre}</span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rol: Especialista Técnico</span>
                              </div>
                            </div>
                          </td>
                          <td className="premium-td">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-[13px] font-medium text-on-surface">
                                <span className="material-symbols-outlined !text-[16px] text-slate-400">alternate_email</span>
                                {row.correo}
                              </div>
                              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 pl-6">
                                <span className="material-symbols-outlined !text-[14px]">call</span>
                                {row.telefono}
                              </div>
                            </div>
                          </td>
                          <td className="premium-td text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wider shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pendiente
                            </span>
                          </td>
                          <td className="premium-td text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleAprobar(row._id)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                              >
                                Aprobar
                              </button>
                              <button 
                                onClick={() => handleDenegar(row._id)}
                                className="px-4 py-2 rounded-xl bg-white text-slate-500 border hairline-border border-slate-200 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                              >
                                Denegar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                            <span className="material-symbols-outlined !text-[64px]">group_off</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">No hay aspirantes pendientes</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="pagination-footer">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Moderación — Página {currentPage}</span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{totalItems} técnicos en espera</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="pagination-btn">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="pagination-btn">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </main>
        </AdminTecnicosLayout>
    </LeaderLayout>
  )
}
