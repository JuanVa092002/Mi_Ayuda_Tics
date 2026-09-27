import { useEffect, useState, type ReactNode } from 'react'
import { historialSolicitudesFuncionario } from '@/features/tickets'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { SearchField, PaginationFooter, StatusBadge, ErrorState } from '@/shared/ui'
import type { Solicitud } from '@/shared/types'

interface HistorialFuncionarioProps {
  refreshKey: number
}

function getWorkflowStep(estado: string): { step: number; label: string } {
  switch (estado) {
    case 'solicitado':
    case 'nuevo':
      return { step: 1, label: 'Radicado' }
    case 'asignado':
      return { step: 2, label: 'Asignado a Técnico' }
    case 'en_progreso':
    case 'en_atencion':
    case 'esperando_usuario':
      return { step: 3, label: 'En Atención Activa' }
    case 'resuelto':
    case 'finalizado':
    case 'cerrado':
      return { step: 4, label: 'Resuelto' }
    default:
      return { step: 1, label: estado }
  }
}

export default function HistorialFuncionario({ refreshKey }: HistorialFuncionarioProps): ReactNode {
  const [historial, setHistorial] = useState<Solicitud[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const itemsPerPage = 6

  const fetchHistorial = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const solicitudes = await historialSolicitudesFuncionario()
      setHistorial(solicitudes)
      if (solicitudes.length > 0) {
        setSelectedTicketId(prev => prev ?? solicitudes[0]._id)
      }
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
      (row.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.ambiente?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const selectedCase = historial.find(s => s._id === selectedTicketId) || currentItems[0] || null
  const currentStepInfo = selectedCase ? getWorkflowStep(selectedCase.estado) : { step: 1, label: 'Radicado' }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#dbe4e8] shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-azul-sena">Historial y Seguimiento de Incidencias</h2>
          <p className="text-xs text-slate-500 font-medium">Revisa el progreso en vivo de tus requerimientos técnicos</p>
        </div>
        <div className="w-full sm:w-80 shrink-0">
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código, ambiente o detalle..."
            label="Buscar en historial"
          />
        </div>
      </div>

      {/* Split Workspace: Queue List on Left, Active Case Timeline & Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Request Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#dbe4e8] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#dbe4e8] bg-[#f5f8f9] flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-azul-sena">
              Tus Solicitudes ({totalItems})
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Página {currentPage} de {Math.max(1, totalPages)}
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="h-8 w-8 mx-auto animate-spin rounded-full border-3 border-slate-200 border-t-azul-sena" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Consultando historial...</p>
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState message={fetchError} onRetry={() => void fetchHistorial()} />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="py-20 text-center px-4">
              <span className="material-symbols-outlined !text-[44px] text-slate-300">history</span>
              <p className="mt-2 text-sm font-bold text-slate-700">Sin solicitudes encontradas</p>
              <p className="text-xs text-slate-400 mt-0.5">No hay requerimientos que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#dbe4e8]/70" role="list">
              {currentItems.map((item) => {
                const isSelected = selectedCase?._id === item._id
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelectedTicketId(item._id)}
                    className={`w-full text-left p-4.5 transition-all cursor-pointer flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-blue-50/50 ring-2 ring-inset ring-azul-sena/20 border-l-4 border-l-azul-sena'
                        : 'hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-azul-sena">
                        #{item.codigoCaso || item._id.slice(-6)}
                      </span>
                      <StatusBadge status={item.estado} />
                    </div>

                    <h3 className="text-sm font-bold text-on-surface line-clamp-2">
                      {item.descripcion}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.ambiente?.nombre || 'General'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{item.fecha}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="p-3 border-t border-[#dbe4e8] bg-white">
            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="solicitudes"
            />
          </div>
        </div>

        {/* Right: Detailed Tracking Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-white rounded-3xl border border-[#dbe4e8] shadow-sm overflow-hidden sticky top-24 space-y-6 p-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#dbe4e8]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-[#f5f8f9] border border-[#dbe4e8] text-azul-sena">
                    #{selectedCase.codigoCaso || selectedCase._id.slice(-6)}
                  </span>
                  <StatusBadge status={selectedCase.estado} />
                </div>
                <span className="text-xs text-slate-400 font-semibold">
                  Radicado el {selectedCase.fecha}
                </span>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="bg-[#f5f8f9] p-5 rounded-2xl border border-[#dbe4e8]">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">
                  Etapa del Requerimiento
                </p>
                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {[
                    { step: 1, name: 'Radicado' },
                    { step: 2, name: 'Asignado' },
                    { step: 3, name: 'En Atención' },
                    { step: 4, name: 'Resuelto' }
                  ].map((s) => {
                    const isCompleted = currentStepInfo.step > s.step
                    const isCurrent = currentStepInfo.step === s.step
                    return (
                      <div key={s.step} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-azul-sena text-white ring-4 ring-azul-sena/15'
                              : isCompleted
                              ? 'bg-[#39a900] text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? (
                            <span className="material-symbols-outlined !text-[16px]">check</span>
                          ) : (
                            s.step
                          )}
                        </div>
                        <span className={`text-[11px] font-bold mt-2 ${
                          isCurrent ? 'text-azul-sena font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {s.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Description & Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detalle de tu Reporte</p>
                  <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed bg-[#f5f8f9] p-4 rounded-2xl border border-[#dbe4e8]">
                    {selectedCase.descripcion}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#f5f8f9] border border-[#dbe4e8]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ambiente de Formación</p>
                    <p className="text-sm font-bold text-azul-sena mt-1">{selectedCase.ambiente?.nombre || 'General'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f5f8f9] border border-[#dbe4e8]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Especialista Asignado</p>
                    <p className="text-sm font-bold text-azul-sena mt-1">
                      {typeof selectedCase.tecnico === 'object' && selectedCase.tecnico?.nombre
                        ? selectedCase.tecnico.nombre
                        : 'En espera de despacho'}
                    </p>
                  </div>
                </div>

                {/* Evidence */}
                {selectedCase.foto ? (
                  <div className="p-4 rounded-2xl border border-[#dbe4e8] bg-white">
                    <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[18px] text-azul-sena">image</span>
                      Evidencia Registrada
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(selectedCase.foto?.url || null)}
                      className="h-24 w-32 rounded-xl overflow-hidden border border-[#dbe4e8] group relative cursor-pointer"
                    >
                      <img
                        src={selectedCase.foto.url}
                        alt="Evidencia radicada"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  </div>
                ) : null}

                {/* Resolution note if present */}
                {typeof selectedCase.solucion === 'object' && selectedCase.solucion?.descripcionSolucion ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined !text-[18px]">verified</span>
                      Resolución Formal del Personal Técnico
                    </p>
                    <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                      {selectedCase.solucion.descripcionSolucion}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#dbe4e8] p-12 text-center text-slate-400">
              <span className="material-symbols-outlined !text-[48px] text-slate-300">find_in_page</span>
              <p className="mt-2 text-sm font-bold text-slate-700">Selecciona una solicitud para ver su trazabilidad</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Evidencia ampliada" className="max-h-[85vh] w-auto object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2 rounded-full cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
