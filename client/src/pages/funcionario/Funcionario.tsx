import { useState, useEffect, type ReactNode } from 'react'
import {
  obtenerAmbientes,
  crearSolicitud,
  historialSolicitudesFuncionario,
  obtenerTiposCaso,
} from '@/features/tickets'
import { useAuth } from '@/features/auth'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { useForm, Controller } from 'react-hook-form'
import HistorialFuncionario from './HistorialFuncionario'
import { CustomSelect, AppShell, StatusBadge, Button, WorkCanvas, SlideOverDrawer } from '@/shared/ui'
import type { AmbienteFormacion, Solicitud, TipoCaso } from '@/shared/types'

interface SolicitudFormValues {
  ambiente: string
  tipoCaso: string
  descripcion: string
  telefono: string
  foto: FileList
}

function getStageStep(estado: string): { step: number; label: string } {
  switch (estado) {
    case 'solicitado':
    case 'nuevo':
    case 'pendiente':
      return { step: 1, label: 'Radicado' }
    case 'asignado':
      return { step: 2, label: 'Asignado a Especialista' }
    case 'en_progreso':
    case 'en_atencion':
    case 'esperando_usuario':
      return { step: 3, label: 'En Atención Activa' }
    case 'resuelto':
    case 'finalizado':
    case 'cerrado':
      return { step: 4, label: 'Resuelto' }
    default:
      return { step: 1, label: 'Radicado' }
  }
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const watchFoto = watch('foto')

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ambResponse, tiposResponse] = await Promise.all([
          obtenerAmbientes(),
          obtenerTiposCaso(),
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

  const openConfirmation = (data: SolicitudFormValues): void => {
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
      setRefreshKey((prev) => prev + 1)
      reset()
      closeModal()
      setIsDrawerOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      closeModal()
    } finally {
      setSubmitting(false)
    }
  }

  // Active / Highlighted Request (El caso que más requiere atención o seguimiento del funcionario)
  const activeTicket = solicitudes.find(
    (s) =>
      s.estado === 'en_progreso' ||
      s.estado === 'en_atencion' ||
      s.estado === 'esperando_usuario' ||
      s.estado === 'asignado' ||
      s.estado === 'solicitado' ||
      s.estado === 'nuevo'
  )

  const activeStepInfo = activeTicket ? getStageStep(activeTicket.estado) : null

  const stats = {
    total: solicitudes.length,
    enAtencion: solicitudes.filter((s) =>
      ['asignado', 'en_progreso', 'en_atencion', 'esperando_usuario'].includes(s.estado)
    ).length,
    resueltas: solicitudes.filter((s) =>
      ['finalizado', 'resuelto', 'cerrado'].includes(s.estado)
    ).length,
  }

  const primerNombre = user?.nombre ? user.nombre.split(' ')[0] : 'Funcionario'

  return (
    <AppShell subtitleContext="Centro de Acompañamiento y Asistencia TIC">
      <WorkCanvas>
        {/* Welcome & Reassurance Header */}
        <section
          className="rounded-2xl border p-6 lg:p-7 relative overflow-hidden"
          style={{
            borderColor: 'var(--border-c)',
            background: 'linear-gradient(135deg, var(--surface-0) 0%, var(--surface-1) 100%)',
            boxShadow: 'var(--sh-xs)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">👋</span>
                <span className="text-xs font-bold uppercase tracking-wider text-verde-sena">
                  Asistencia Técnica Especializada CTPI
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-azul-sena">
                Hola, {primerNombre}
              </h1>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {activeTicket
                  ? 'Tu requerimiento técnico está en seguimiento activo. Nuestro equipo trabaja para restablecer la operatividad de tus equipos.'
                  : 'Todos tus equipos y ambientes se encuentran al día. Si tienes alguna falla técnica, radica tu solicitud inmediatamente.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-5 px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-subtle">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Activos</p>
                  <p className="text-lg font-black text-amber-700">{stats.enAtencion}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Resueltos</p>
                  <p className="text-lg font-black text-verde-sena">{stats.resueltas}</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon="add_circle"
                onClick={() => setIsDrawerOpen(true)}
                className="shadow-md"
              >
                Radicar nueva incidencia
              </Button>
            </div>
          </div>
        </section>

        {/* Hero Protagonista: Active Ticket Progression (Google PAIR Stepper) */}
        {activeTicket && activeStepInfo ? (
          <section
            className="rounded-2xl border p-6 lg:p-7 relative overflow-hidden"
            style={{
              borderColor: 'var(--border-c)',
              background: 'var(--surface-0)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-border-subtle">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Caso en Progreso #{activeTicket.codigoCaso || activeTicket._id.slice(-6)}
                  </span>
                  <StatusBadge status={activeTicket.estado} />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-azul-sena">
                  {activeTicket.descripcion}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-verde-sena">location_on</span>
                    {activeTicket.ambiente?.nombre || 'Ambiente no especificado'}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[16px] text-slate-400">calendar_today</span>
                    Reportado: {activeTicket.fecha}
                  </span>
                </div>
              </div>

              {/* Specialist Contact Card or Action Needed */}
              <div className="shrink-0 w-full lg:w-80 rounded-xl p-4 border border-border-subtle bg-surface-subtle space-y-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Acompañamiento Técnico Asignado
                </p>
                {typeof activeTicket.tecnico === 'object' && activeTicket.tecnico?.nombre ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-azul-sena text-white flex items-center justify-center font-bold text-sm">
                      {activeTicket.tecnico.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-azul-sena truncate">
                        {activeTicket.tecnico.nombre}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {activeTicket.tecnico.correo || 'Especialista en Mesa TIC'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined !text-[18px] text-amber-600">hourglass_top</span>
                    En espera de asignación de técnico por Mesa TIC
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs font-bold text-azul-sena">
                    {activeTicket.estado === 'esperando_usuario'
                      ? '⚠️ Acción requerida: El técnico necesita tu respuesta.'
                      : activeTicket.estado === 'en_progreso' || activeTicket.estado === 'en_atencion'
                      ? '✅ El técnico se encuentra ejecutando la solución en tu ambiente.'
                      : 'ℹ️ Tu ticket está registrado con alta prioridad en el sistema.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Timeline (Google PAIR) */}
            <div className="pt-6">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-4">
                Línea de Vida y Progreso del Requerimiento
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { step: 1, label: 'Radicado', desc: 'Recibido en sistema' },
                  { step: 2, label: 'Asignado', desc: 'Especialista designado' },
                  { step: 3, label: 'En Atención', desc: 'Intervención en curso' },
                  { step: 4, label: 'Solucionado', desc: 'Listo y validado' },
                ].map((s) => {
                  const isDone = activeStepInfo.step > s.step
                  const isCurrent = activeStepInfo.step === s.step
                  return (
                    <div
                      key={s.step}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-verde-sena bg-surface-selected shadow-xs'
                          : isDone
                          ? 'border-border-subtle bg-surface'
                          : 'border-dashed border-slate-200 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-verde-sena text-white'
                              : isDone
                              ? 'bg-azul-sena text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isDone ? '✓' : s.step}
                        </div>
                        <span className={`text-xs font-bold ${isCurrent ? 'text-verde-sena' : 'text-slate-700'}`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium pl-7">{s.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* Historial and Tracking Center */}
        <section className="space-y-4">
          <HistorialFuncionario refreshKey={refreshKey} />
        </section>

        {/* Clean Slide-Over Drawer for New Incidents */}
        <SlideOverDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Radicar Nueva Incidencia TIC"
          subtitle="Registra el incidente para que el equipo de soporte técnico acuda a tu ambiente o laboratorio."
          width="lg"
          footer={
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsDrawerOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit(openConfirmation)}
                icon="send"
              >
                Continuar
              </Button>
            </>
          }
        >
          <form className="space-y-5">
            <Controller
              name="ambiente"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomSelect
                  label="Ambiente / Laboratorio / Sede"
                  placeholder="Selecciona la ubicación exacta"
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="descripcion">
                Descripción Detallada del Problema
              </label>
              <textarea
                className="w-full rounded-xl border border-border-subtle bg-surface-subtle p-3.5 text-sm font-medium text-ink focus:border-azul-sena focus:bg-white focus:outline-none transition-all min-h-[110px]"
                id="descripcion"
                placeholder="Describe qué ocurrió, el equipo afectado o el mensaje de error observado..."
                {...register('descripcion', { required: true })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="telefono">
                Teléfono o Extensión de Contacto
              </label>
              <input
                className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-2.5 text-sm font-medium text-ink focus:border-azul-sena focus:bg-white focus:outline-none transition-all"
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
                <label className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl border border-border-subtle hover:bg-surface-subtle text-slate-600 font-bold text-xs cursor-pointer transition-colors">
                  <span className="material-symbols-outlined !text-[18px]">photo_camera</span>
                  {watchFoto && watchFoto[0] ? 'Cambiar archivo' : 'Adjuntar foto del fallo'}
                  <input type="file" className="hidden" {...register('foto')} accept="image/*" />
                </label>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="w-12 h-12 object-cover rounded-xl border border-border-subtle cursor-pointer shadow-xs"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                ) : null}
              </div>
            </div>
          </form>
        </SlideOverDrawer>
      </WorkCanvas>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs z-[100] p-4">
          <div className="bg-white p-7 rounded-2xl max-w-md w-full shadow-2xl border border-border-subtle animate-in fade-in zoom-in duration-150">
            <div className="w-11 h-11 rounded-xl bg-azul-sena/10 flex items-center justify-center text-azul-sena mb-4">
              <span className="material-symbols-outlined !text-[26px]">verified</span>
            </div>
            <h3 className="text-lg font-bold text-azul-sena mb-1.5">¿Confirmar radicación de solicitud?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium">
              Se creará un ticket oficial que ingresará inmediatamente a la cola de despacho técnico del CTPI.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                size="md"
                disabled={submitting}
                onClick={closeModal}
              >
                Revisar
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={submitting}
                onClick={() => void onSubmit()}
              >
                {submitting ? 'Radicando...' : 'Sí, radicar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xs z-[200] p-4 cursor-zoom-out"
          onClick={() => setIsImageModalOpen(false)}
        >
          <img
            src={previewImage ?? undefined}
            alt="Vista previa ampliada"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute top-6 right-6 text-white hover:scale-110 transition-transform cursor-pointer"
            onClick={() => setIsImageModalOpen(false)}
          >
            <span className="material-symbols-outlined !text-[28px]">close</span>
          </button>
        </div>
      )}
    </AppShell>
  )
}
