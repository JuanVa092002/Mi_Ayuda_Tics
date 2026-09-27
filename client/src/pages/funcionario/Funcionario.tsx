import { useState, useEffect, type ReactNode } from 'react'
import {
  obtenerAmbientes,
  crearSolicitud,
  historialSolicitudesFuncionario,
  obtenerTiposCaso,
} from '@/features/tickets'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { useForm, Controller } from 'react-hook-form'
import HistorialFuncionario from './HistorialFuncionario'
import { CustomSelect, AppShell, KpiCard, PageHeader } from '@/shared/ui'
import { useAuth } from '@/features/auth'
import type { AmbienteFormacion, Solicitud, TipoCaso } from '@/shared/types'

interface SolicitudFormValues {
  ambiente: string
  tipoCaso: string
  descripcion: string
  telefono: string
  foto: FileList
}

export default function Funcionario(): ReactNode {
  const { user } = useAuth()
  const { register, handleSubmit, reset, watch, control } = useForm<SolicitudFormValues>()
  const [ambientes, setAmbientes] = useState<AmbienteFormacion[]>([])
  const [tiposCaso, setTiposCaso] = useState<TipoCaso[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<SolicitudFormValues | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)
  const watchFoto = watch('foto')

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ambResponse, tiposResponse] = await Promise.all([
          obtenerAmbientes(),
          obtenerTiposCaso()
        ])
        
        if (Array.isArray(ambResponse.data)) {
          setAmbientes(ambResponse.data)
        }
        
        if (Array.isArray(tiposResponse.data)) {
          setTiposCaso(tiposResponse.data)
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }

    fetchInitialData()
  }, [])

  // Actualiza la vista previa de la imagen cuando se selecciona un archivo
  useEffect(() => {
    if (watchFoto && watchFoto[0]) {
      const file = watchFoto[0]
      setPreviewImage(URL.createObjectURL(file))
    } else {
      setPreviewImage(null)
    }
  }, [watchFoto])

  const openModal = (data: SolicitudFormValues): void => {
    setFormData(data)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData(null)
  }

  const onSubmit = async (): Promise<void> => {
    if (!formData || !user) return
    try {
      const submissionData = new FormData()
      submissionData.append('descripcion', formData.descripcion)
      submissionData.append('telefono', formData.telefono)
      submissionData.append('ambiente', formData.ambiente)
      submissionData.append('tipoCaso', formData.tipoCaso)
      submissionData.append('usuario', user._id)
      submissionData.append('foto', formData.foto[0])

      await crearSolicitud(submissionData)
      toast.success('La solicitud ha sido realizada con éxito.')
      setRefreshKey(prev => prev + 1)
      reset()
      closeModal()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      closeModal()
    }
  }

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const [stats, setStats] = useState({ total: 0, pendientes: 0, resueltas: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const solicitudes: Solicitud[] = await historialSolicitudesFuncionario()
        const total = solicitudes.length
        const pendientes = solicitudes.filter(
          s =>
            s.estado === 'solicitado' ||
            s.estado === 'nuevo' ||
            s.estado === 'asignado' ||
            s.estado === 'pendiente' ||
            s.estado === 'en_progreso' ||
            s.estado === 'esperando_usuario' ||
            s.estado === 'resuelto'
        ).length
        const resueltas = solicitudes.filter(
          s => s.estado === 'finalizado' || s.estado === 'cerrado' || s.estado === 'cancelado'
        ).length
        setStats({ total, pendientes, resueltas })
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }
    fetchStats()
  }, [refreshKey])

  return (
    <AppShell subtitleContext="Portal del Funcionario">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <PageHeader
          category="Mesa de Ayuda CTPI"
          title="Panel de Gestión de Solicitudes"
          description={`Bienvenido ${user?.nombre ? user.nombre.split(' ')[0] : 'Funcionario'}. Reporta y da seguimiento a tus requerimientos TIC.`}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <KpiCard
            label="Total Solicitudes"
            value={stats.total}
            icon="analytics"
            tone="navy"
            hint="Histórico registrado"
          />
          <KpiCard
            label="En Proceso / Pendientes"
            value={stats.pendientes}
            icon="pending_actions"
            tone="amber"
            hint="En atención activa"
          />
          <KpiCard
            label="Resueltas / Cerradas"
            value={stats.resueltas}
            icon="verified"
            tone="green"
            hint="Conformidad o cierre"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* New Request Form Card - Narrower for more table space */}
          <div className="lg:col-span-3">
            <section className="solid-card rounded-3xl p-6 sm:p-8 flex flex-col sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined !text-[20px] font-variation-['FILL'_1,'wght'_300]">add_circle</span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">Nueva Solicitud</h2>
              </div>
              
              <form onSubmit={handleSubmit(openModal)} className="space-y-5">
                <Controller
                  name="ambiente"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomSelect 
                      label="Ambiente"
                      placeholder="Selecciona ubicación"
                      options={ambientes}
                      value={field.value}
                      onChange={field.onChange}
                      icon="unfold_more"
                    />
                  )}
                />

                <Controller
                  name="tipoCaso"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomSelect 
                      label="Tipo de Caso"
                      placeholder="Selecciona categoría"
                      options={tiposCaso}
                      value={field.value}
                      onChange={field.onChange}
                      icon="category"
                    />
                  )}
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="descripcion">Descripción</label>
                  <textarea 
                    className="w-full solid-input rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all resize-none min-h-[100px]" 
                    id="descripcion" 
                    placeholder="Detalles del incidente"
                    {...register('descripcion')}
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="telefono">Contacto</label>
                  <input 
                    className="w-full solid-input rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/10 transition-all" 
                    id="telefono" 
                    placeholder="Ext / Teléfono" 
                    type="tel"
                    {...register('telefono')}
                  />
                </div>

                <div className="pt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center justify-center gap-2 flex-1 py-2.5 px-3 rounded-xl border hairline-border border-slate-200 text-on-surface-variant font-bold text-[11px] hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap">
                      <span className="material-symbols-outlined !text-[16px] font-variation-['wght'_300]">cloud_upload</span>
                      {watchFoto && watchFoto[0] ? 'Cambiar' : 'Foto'}
                      <input type="file" className="hidden" {...register('foto')} accept="image/*" />
                    </label>
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Vista previa"
                        className="w-10 h-10 object-cover rounded-lg cursor-pointer border hairline-border border-slate-200"
                        onClick={openImageModal}
                      />
                    )}
                  </div>
                  
                  <button 
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary-container text-white font-bold text-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all shadow-md shadow-primary-container/20 group" 
                    type="submit"
                  >
                    <span className="material-symbols-outlined !text-[18px] transition-transform group-hover:translate-x-1 font-variation-['FILL'_1,'wght'_300]">send</span>
                    Enviar reporte
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* History List Section - Much wider now (9/12) */}
          <div className="lg:col-span-9">
            <HistorialFuncionario refreshKey={refreshKey} />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-primary-container/20 backdrop-blur-md z-[100]">
          <div className="solid-card p-8 rounded-3xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-6">
              <span className="material-symbols-outlined !text-[28px]">contact_support</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">¿Confirmar envío?</h3>
            <p className="text-on-surface-variant text-sm mb-8">Se creará un nuevo ticket con la información proporcionada para su pronta atención.</p>
            <div className="flex gap-3">
              <button 
                onClick={closeModal} 
                className="flex-1 py-3 px-4 rounded-2xl border hairline-border border-slate-200 text-on-surface-variant font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Revisar
              </button>
              <button 
                onClick={onSubmit} 
                className="flex-1 py-3 px-4 rounded-2xl bg-primary-container text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg"
              >
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[200] p-4 cursor-zoom-out"
          onClick={closeImageModal}
        >
          <img
            src={previewImage ?? undefined}
            alt="Vista previa ampliada"
            className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          />
          <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform">
            <span className="material-symbols-outlined !text-[32px]">close</span>
          </button>
        </div>
      )}
    </AppShell>
  )
}
