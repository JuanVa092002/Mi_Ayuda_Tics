import { useEffect, useState } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import { getTecnicosActivos, inactivarTecnico } from '@/features/users'
import AdminTecnicosLayout from '@/app/layouts/AdminTecnicosLayout'
import { Button, StatusBadge, PaginationFooter, toast } from '@/shared/ui'
import type { User } from '@/shared/types'

export default function TecnicosActivos() {
  const [tecnicosActivos, setTecnicosActivos] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const cargarTecnicosActivos = async () => {
      try {
        const data = await getTecnicosActivos()
        setTecnicosActivos(data)
      } catch (error) {
        console.error('Error al cargar técnicos activos:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarTecnicosActivos()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredTecnicos = tecnicosActivos.filter(tecnico =>
    tecnico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnico.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Inactivar técnico
  const handleInactivar = async (id: string) => {
    try {
      await inactivarTecnico(id)
      toast.success('Técnico inactivado exitosamente')
      setTecnicosActivos(prevState => prevState.filter(tecnico => tecnico._id !== id))
    } catch (error) {
      toast.error('Error al inactivar técnico')
      console.error('Error al inactivar técnico:', error)
    }
  }

  // Pagination Logic
  const totalItems = filteredTecnicos.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTecnicos.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <LeaderLayout>
        <AdminTecnicosLayout>
          <main className="p-4 sm:p-8">
            <section className="solid-card rounded-3xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              {/* Header of Table */}
              <div className="p-6 sm:p-8 border-b hairline-border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Técnicos Activos</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Gestión de personal operativo con acceso al sistema.</p>
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
                            <p className="text-sm font-black uppercase tracking-[0.2em]">Cargando personal...</p>
                          </div>
                        </td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      currentItems.map((tecnico) => (
                        <tr key={tecnico._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary-container font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-100">
                                {tecnico.nombre.charAt(0)}
                              </div>
                              <span className="text-[13px] font-bold text-on-surface">{tecnico.nombre}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className="text-[13px] font-medium text-on-surface-variant">{tecnico.correo}</span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className="text-[13px] font-semibold text-on-surface">{tecnico.telefono}</span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <StatusBadge status="activo" label="Activo" />
                          </td>
                          <td className="py-6 px-6 align-top text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleInactivar(tecnico._id)}
                              icon="person_off"
                              className="!h-8 !px-3 !text-[11px] !min-h-0 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 shadow-none font-bold"
                            >
                              Inactivar
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                            <span className="material-symbols-outlined !text-[64px]">group_off</span>
                            <p className="text-sm font-black uppercase tracking-[0.2em]">No hay técnicos activos</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <PaginationFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="técnicos registrados"
              />
            </section>
          </main>
        </AdminTecnicosLayout>
    </LeaderLayout>
  )
}
