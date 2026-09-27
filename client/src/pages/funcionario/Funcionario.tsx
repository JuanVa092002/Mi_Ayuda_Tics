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
import { CustomSelect, AppShell, StatusBadge } from '@/shared/ui'
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
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
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

    void fetchInitialData()
  }, [])

  useEffect(() => {
    if (watchFoto && watchFoto[0]) {
      const file = watchFoto[0]
      setPreviewImage(URL.createObjectURL(file))
    } else {
      setPreviewImage(null)
    }
  }, [watchFoto])

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data: Solicitud[] = await historialSolicitudesFuncionario()
        setSolicitudes(data)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    }
    void fetchSolicitudes()
  }, [refreshKey])

  const openModal = (data: SolicitudFormValues): void => {
    setFormData(data)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData(null)
  }

  const onSubmit = async (): Promise<void> => {
    if (!formData || !user || submitting) return
    setSubmitting(true)
    try {
      const submissionData = new FormData()
      submissionData.append('descripcion', formData.descripcion)
      submissionData.append('telefono', formData.telefono)
      submissionData.append('ambiente', formData.ambiente)
      submissionData.append('tipoCaso', formData.tipoCaso)
      submissionData.append('usuario', user._id)
      if (formData.foto && formData.foto[0]) {
        submissionData.append('foto', formData.foto[0])
      }

      await crearSolicitud(submissionData)
      toast.success('Incidencia radicada exitosamente')
      setRefreshKey(prev => prev + 1)
      reset()
      closeModal()
      setShowNewRequestForm(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      closeModal()
    } finally {
      setSubmitting(false)
    }
  }

  // Active / Highlighted Request (El caso que más requiere atención del funcionario)
  const activeTicket = solicitudes.find(
    s => s.estado === 'en_progreso' || s.estado === 'en_atencion' || s.estado === 'esperando_usuario' || s.estado === 'asignado'
  )

  const stats = {
    total: solicitudes.length,
    enAtencion: solicitudes.filter(s => ['asignado', 'en_progreso', 'en_atencion', 'esperando_usuario'].includes(s.estado)).length,
    resueltas: solicitudes.filter(s => ['finalizado', 'resuelto', 'cerrado'].includes(s.estado)).length,
  }

  const userName = user?.nombre ? user.nombre.split(' ')[0] : 'Funcionario'

  return (
    <AppShell subtitleContext="Centro de Asistencia TIC">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner: Confianza, Orientación y Acción Inmediata */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#04324d] via-[#03283e] to-[#021b2b] text-white p-6 sm:p-10 shadow-[0_12px_36px_rgba(4,50,77,0.15)] border border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-[#39a900] animate-pulse" />
                Mesa de Ayuda CTPI · En Servicio
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Hola, {userName}. ¿En qué podemos apoyarte hoy?
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                Reporta fallas de conectividad, equipos o software en ambientes de formación. Nuestro equipo técnico responderá de inmediato.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#39a900] hover:bg-[#329600] active:scale-98 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#39a900]/25 group cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[20px] font-variation-['FILL'_1] group-hover:rotate-90 transition-transform">
                  {showNewRequestForm ? 'close' : 'add_circle'}
                </span>
                {showNewRequestForm ? 'Cerrar Formulario' : 'Reportar Incidencia'}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total Radicadas</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.total}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">En Atención Activa</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{stats.enAtencion}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Resueltas / Cerradas</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{stats.resueltas}</p>
            </div>
          </div>
        </section>

        {/* Featured Live Status Card (Si hay un ticket en progreso) */}
        {activeTicket ? (
          <section className="rounded-3xl bg-white border hairline-border border-amber-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgba(245,158,11,0.06)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-amber-400 to-[#39a900]" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Caso Activo #{activeTicket.codigoCaso || activeTicket._id.slice(-6)}
                  </span>
                  <StatusBadge status={activeTicket.estado} />
                </div>
                <h2 className="text-xl font-bold text-[#04324d]">
                  {activeTicket.descripcion}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-emerald-600">location_on</span>
                    {activeTicket.ambiente?.nombre || 'Ambiente no especificado'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-slate-400">calendar_today</span>
                    Reportado: {activeTicket.fecha}
                  </span>
                  {typeof activeTicket.tecnico === 'object' && activeTicket.tecnico?.nombre ? (
                    <span className="inline-flex items-center gap-1.5 text-azul-sena font-bold">
                      <span className="material-symbols-outlined !text-[16px] text-azul-sena">engineering</span>
                      Atendido por: {activeTicket.tecnico.nombre}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 bg-slate-50 p-4 rounded-2xl border hairline-border border-slate-200/80 text-center sm:text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado de tu requerimiento</p>
                <p className="text-sm font-extrabold text-[#04324d] mt-0.5">
                  {activeTicket.estado === 'esperando_usuario'
                    ? 'Requiere tu respuesta o confirmación'
                    : activeTicket.estado === 'asignado'
                    ? 'Técnico asignado · En cola de atención'
                    : 'Personal técnico trabajando en el incidente'}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Collapsible / Dedicated New Request Drawer or Section */}
        {showNewRequestForm && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border hairline-border border-slate-200/90 shadow-[0_12px_40px_rgba(4,50,77,0.08)] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-6 border-b hairline-border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-azul-sena/10 flex items-center justify-center text-azul-sena">
                  <span className="material-symbols-outlined !text-[22px] font-variation-['FILL'_1]">add_task</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Radicar Nueva Incidencia TIC</h2>
                  <p className="text-xs text-slate-500 font-medium">Completa los datos del incidente para asignación inmediata</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRequestForm(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(openModal)} className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="ambiente"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomSelect
                    label="Ambiente / Laboratorio / Sede"
                    placeholder="Selecciona la ubicación física"
                    options={ambientes}
                    value={field.value}
                    onChange={field.onChange}
                    icon="location_on"
                  />
                )}
              />

              <Controller
                name="tipoCaso"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomSelect
                    label="Categoría del Incidente"
                    placeholder="Selecciona el tipo de falla"
                    options={tiposCaso}
                    value={field.value}
                    onChange={field.onChange}
                    icon="category"
                  />
                )}
              />

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="descripcion">
                  Descripción Detallada del Problema
                </label>
                <textarea
                  className="w-full rounded-2xl border hairline-border border-slate-200 bg-slate-50/50 p-4 text-sm font-medium text-on-surface focus:border-azul-sena focus:bg-white focus:outline-none transition-all min-h-[110px]"
                  id="descripcion"
                  placeholder="Describe qué ocurrió, el equipo afectado o el mensaje de error observado..."
                  {...register('descripcion', { required: true })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="telefono">
                  Teléfono / Extensión de Contacto
                </label>
                <input
                  className="w-full rounded-xl border hairline-border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-on-surface focus:border-azul-sena focus:bg-white focus:outline-none transition-all"
                  id="telefono"
                  placeholder="Ej: Ext. 4520 o 3123456789"
                  type="tel"
                  {...register('telefono', { required: true })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Evidencia Fotográfica (Opcional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl border hairline-border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs cursor-pointer transition-colors">
                    <span className="material-symbols-outlined !text-[18px]">photo_camera</span>
                    {watchFoto && watchFoto[0] ? 'Cambiar archivo' : 'Adjuntar foto de la falla'}
                    <input type="file" className="hidden" {...register('foto')} accept="image/*" />
                  </label>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Vista previa"
                      className="w-11 h-11 object-cover rounded-xl border hairline-border border-slate-200 cursor-pointer shadow-xs"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                  ) : null}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t hairline-border border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRequestForm(false)}
                  className="px-5 py-2.5 rounded-xl border hairline-border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-azul-sena hover:bg-[#03283e] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-98"
                >
                  Radicar Requerimiento
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Historial Section with Natural Flow */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-azul-sena tracking-tight">Historial y Seguimiento de Mis Casos</h2>
              <p className="text-xs text-slate-500 font-medium">Consulta el estado, técnico asignado y resolución de cada solicitud</p>
            </div>
            {!showNewRequestForm && (
              <button
                type="button"
                onClick={() => setShowNewRequestForm(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-verde-sena hover:text-emerald-800 uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined !text-[18px]">add_circle</span>
                Nueva Solicitud
              </button>
            )}
          </div>

          <HistorialFuncionario refreshKey={refreshKey} />
        </section>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-azul-sena/10 flex items-center justify-center text-azul-sena mb-5">
              <span className="material-symbols-outlined !text-[28px]">verified</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">¿Confirmar radicación de solicitud?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Se creará un ticket oficial que ingresará inmediatamente a la cola de despacho técnico del CTPI.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={closeModal} 
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl border hairline-border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                Revisar
              </button>
              <button 
                onClick={onSubmit}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-azul-sena text-white font-bold text-xs uppercase tracking-widest hover:bg-[#03283e] transition-all shadow-md"
              >
                {submitting ? 'Radicando...' : 'Sí, radicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[200] p-4 cursor-zoom-out"
          onClick={() => setIsImageModalOpen(false)}
        >
          <img
            src={previewImage ?? undefined}
            alt="Vista previa ampliada"
            className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          />
          <button 
            type="button"
            className="absolute top-8 right-8 text-white hover:scale-110 transition-transform cursor-pointer"
            onClick={() => setIsImageModalOpen(false)}
          >
            <span className="material-symbols-outlined !text-[32px]">close</span>
          </button>
        </div>
      )}
    </AppShell>
  )
}
