import { useState, useEffect, type ReactNode } from 'react'
import {
  obtenerAmbientes,
  crearSolicitud,
  historialSolicitudesFuncionario,
  obtenerTiposCaso,
  responderSolicitud,
  confirmarSolucion,
} from '@/features/tickets'
import { useAuth } from '@/features/auth'
import { getApiErrorMessage } from '@/shared/api/apiError'
import {
  AppShell,
  FeedbackBanner,
  AdaptiveSkeletonDetail,
  toast,
} from '@/shared/ui'
import type { AmbienteFormacion, Solicitud, TipoCaso } from '@/shared/types'
import { FuncionarioHeaderStats } from './components/FuncionarioHeaderStats'
import { FuncionarioCasesQueue, type FuncionarioQueueFilter } from './components/FuncionarioCasesQueue'
import { FuncionarioCaseDetail } from './components/FuncionarioCaseDetail'
import { RadicarSolicitudModal, type RadicarModalFormValues } from './components/RadicarSolicitudModal'
import { getFuncionarioPriorityScore } from '@/shared/utils/ticketContext'

export default function Funcionario(): ReactNode {
  const { user } = useAuth()
  const [ambientes, setAmbientes] = useState<AmbienteFormacion[]>([])
  const [tiposCaso, setTiposCaso] = useState<TipoCaso[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Selección activa para el layout master-detail
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [queueFilter, setQueueFilter] = useState<FuncionarioQueueFilter>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [lastActionNotice, setLastActionNotice] = useState<{
    variant: 'success' | 'info' | 'warning' | 'danger'
    title: string
    description: string
    affectedCaseId?: string
    actor?: string
    nextStep?: string
  } | null>(null)

  useEffect(() => {
    void fetchCatalogs()
    void fetchHistory()

    // Escuchar actualizaciones en tiempo real recibidas por el canal SSE
    const handleTicketLiveUpdate = (ev: Event) => {
      const customEv = ev as CustomEvent
      // Si el evento trae solicitudId y estado, aplicamos parche in-memory inmediato
      if (customEv?.detail?.solicitudId && customEv?.detail?.estado) {
        setSolicitudes((prev) =>
          prev.map((item) =>
            item._id === customEv.detail.solicitudId
              ? { ...item, estado: customEv.detail.estado }
              : item
          )
        )
      }
      // Reconciliación en segundo plano sin parpadeo (silent refresh)
      void fetchHistory(true)
    }
    window.addEventListener('ticket:updated', handleTicketLiveUpdate)
    return () => {
      window.removeEventListener('ticket:updated', handleTicketLiveUpdate)
    }
  }, [])

  const fetchCatalogs = async () => {
    try {
      const [ambRes, tipRes] = await Promise.all([obtenerAmbientes(), obtenerTiposCaso()])
      if (ambRes?.data) setAmbientes(ambRes.data)
      if (tipRes?.data) setTiposCaso(tipRes.data)
    } catch (e) {
      console.error('Error cargando catálogos:', e)
    }
  }

  const fetchHistory = async (silent = false) => {
    if (!silent) {
      setLoadingHistory(true)
      setHistoryError(null)
    }
    try {
      const data = await historialSolicitudesFuncionario()
      const list = Array.isArray(data) ? data : []
      setSolicitudes(list)

      // Auto-seleccionar primer caso prioritario operativo si no hay ninguno seleccionado
      setSelectedCaseId((prev) => {
        if (prev && list.some((item) => item._id === prev)) return prev
        const sortedList = [...list].sort((a, b) => {
          const diff =
            getFuncionarioPriorityScore(a.estado, a.descripcion) -
            getFuncionarioPriorityScore(b.estado, b.descripcion)
          if (diff !== 0) return diff
          const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
          const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
          return dateB - dateA
        })
        return sortedList[0]?._id || null
      })
    } catch (e) {
      console.error('Error cargando historial de funcionario:', e)
      if (!silent) {
        setHistoryError(getApiErrorMessage(e))
      }
    } finally {
      if (!silent) {
        setLoadingHistory(false)
      }
    }
  }

  const handleRadicarSubmit = async (values: RadicarModalFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (user?._id) {
        formData.append('usuario', user._id)
      }
      formData.append('ambiente', values.ambiente)
      formData.append('tipoCaso', values.tipoCaso)
      formData.append('descripcion', values.descripcion)
      formData.append('telefono', values.telefono || user?.telefono || '0000000000')
      if (values.foto && values.foto.length > 0) {
        formData.append('foto', values.foto[0])
      }

      const response = await crearSolicitud(formData)
      const createdTicket = (response as any)?.solicitud || response

      // Actualización optimista inmediata en memoria para UI instantánea sin layout shifts
      if (createdTicket && createdTicket._id) {
        setSolicitudes((prev) => [createdTicket, ...prev.filter((s) => s._id !== createdTicket._id)])
        setSelectedCaseId(createdTicket._id)
      }

      toast.success('Solicitud radicada con éxito.')
      setLastActionNotice({
        variant: 'success',
        title: 'Incidencia Radicada con Éxito',
        description: 'Tu requerimiento ya se encuentra en la Mesa de Ayuda TIC.',
        nextStep: 'El Líder TIC evaluará el síntoma y asignará al especialista correspondiente.',
      })
      setDrawerOpen(false)
      void fetchHistory()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Responder al técnico cuando la solicitud está en esperando_usuario
  const handleSendReply = async (solicitudId: string, mensaje: string) => {
    try {
      await responderSolicitud(solicitudId, mensaje)
      toast.success('Tu respuesta fue enviada al técnico encargado.')
      setLastActionNotice({
        variant: 'info',
        title: 'Respuesta Entregada al Técnico',
        description: 'Se ha notificado al técnico para que reanude las labores en sitio.',
      })
      await fetchHistory()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  // Confirmar la solución técnica aplicada (Visto bueno)
  const handleConfirmSolution = async (solicitudId: string) => {
    try {
      const response = await confirmarSolucion(solicitudId)
      
      // Actualización optimista inmediata en memoria para UI instantánea
      setSolicitudes((prev) =>
        prev.map((item) =>
          item._id === solicitudId
            ? {
                ...item,
                lifecycleState: 'cerrado',
                displayStatus: 'Cerrada',
                capabilities: {
                  ...item.capabilities,
                  canConfirm: false,
                  canReply: false,
                },
                ...(response?.solicitud || {}),
                estado: 'cerrado',
              }
            : item
        )
      )

      toast.success('Has otorgado tu visto bueno con éxito.')
      setLastActionNotice({
        variant: 'success',
        title: 'Visto Bueno Registrado',
        description: 'El caso ha sido cerrado y formalizado satisfactoriamente en la Mesa de Ayuda TIC.',
      })
      await fetchHistory()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  // Métricas calculadas para el header
  const totalSolicitudes = solicitudes.length
  const enAtencionCount = solicitudes.filter(
    (s) =>
      s.estado === 'asignado' ||
      s.estado === 'en_progreso' ||
      s.estado === 'en_atencion' ||
      s.estado === 'solicitado' ||
      s.estado === 'pendiente' ||
      s.estado === 'nuevo'
  ).length
  const esperandoUsuarioCount = solicitudes.filter(
    (s) => s.estado === 'esperando_usuario' || s.estado === 'requiere_informacion'
  ).length
  const resueltasCount = solicitudes.filter(
    (s) => s.estado === 'resuelto' || s.estado === 'finalizado' || s.estado === 'cerrado'
  ).length

  // Caso actualmente seleccionado para el panel derecho
  const activeSelectedCase =
    solicitudes.find((s) => s._id === selectedCaseId) || solicitudes[0] || null

  return (
    <AppShell subtitleContext="Portal Funcionario">
      <div className="mx-auto w-full max-w-[1520px] px-4 py-5 sm:px-6 lg:px-8 space-y-5">
        
        {/* TOP HEADER: Resumen táctico del funcionario y acción principal de radicar */}
        <FuncionarioHeaderStats
          totalSolicitudes={totalSolicitudes}
          enAtencionCount={enAtencionCount}
          esperandoUsuarioCount={esperandoUsuarioCount}
          resueltasCount={resueltasCount}
          onOpenRadicar={() => setDrawerOpen(true)}
        />

        {/* FEEDBACK BANNER OPERACIONAL GLOBAL */}
        {lastActionNotice ? (
          <FeedbackBanner
            tone={lastActionNotice.variant === 'danger' ? 'danger' : lastActionNotice.variant === 'warning' ? 'warning' : 'success'}
            title={lastActionNotice.title}
            description={lastActionNotice.description}
            nextStep={lastActionNotice.nextStep}
            affectedCaseId={lastActionNotice.affectedCaseId}
            onDismiss={() => setLastActionNotice(null)}
          />
        ) : null}

        {/* ========================================================= */}
        {/* MASTER-DETAIL WORKBENCH: Lista izquierda + Expediente derecho */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          
          {/* COLUMNA IZQUIERDA (5 cols en LG laptop 1280/1366, 4 cols en XL desktop 1440/1920): Bandeja y Cola de Casos */}
          <div className={`lg:col-span-5 xl:col-span-4 ${selectedCaseId ? 'hidden lg:block' : 'block'}`}>
            <FuncionarioCasesQueue
              solicitudes={solicitudes}
              activeCaseId={selectedCaseId}
              loading={loadingHistory}
              error={historyError}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentFilter={queueFilter}
              onFilterChange={setQueueFilter}
              onSelectCase={(caso) => {
                setSelectedCaseId(caso._id)
                // Scroll suave al expediente en mobile/tablet
                if (window.innerWidth < 1024) {
                  window.scrollTo({ top: 120, behavior: 'smooth' })
                }
              }}
              onRetry={() => void fetchHistory()}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={6}
            />
          </div>

          {/* COLUMNA DERECHA (7 cols en LG laptop 1280/1366, 8 cols en XL desktop 1440/1920): Expediente Vivo del Caso Seleccionado */}
          <div className={`lg:col-span-7 xl:col-span-8 ${!selectedCaseId ? 'hidden lg:block' : 'block'}`}>
            {/* Barra de Retorno Rápido en Mobile/Tablet */}
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setSelectedCaseId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-azul-sena hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
                <span>Volver a la lista de solicitudes</span>
              </button>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Expediente Móvil
              </span>
            </div>

            {loadingHistory ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <AdaptiveSkeletonDetail />
              </div>
            ) : activeSelectedCase ? (
              <FuncionarioCaseDetail
                solicitud={activeSelectedCase}
                onOpenPreview={(url) => setPreviewImage(url)}
                onSendReply={handleSendReply}
                onConfirmSolution={handleConfirmSolution}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <span className="material-symbols-outlined !text-[48px] text-slate-300 mx-auto mb-3">
                  support_agent
                </span>
                <h3 className="text-base font-bold text-slate-700">Sin Solicitud Seleccionada</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Selecciona una de tus solicitudes en la lista de la izquierda para ver su expediente y estado de atención en tiempo real.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-verde-sena to-[#2e8800] hover:from-[#329600] hover:to-[#277400] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer select-none"
                  >
                    <span className="flex h-6 w-6 rounded-lg bg-white/20 items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-90">
                      <span className="material-symbols-outlined !text-[16px] text-white">add</span>
                    </span>
                    <span className="tracking-tight">Radicar nueva solicitud</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RADICACIÓN MODAL: Experiencia guiada de alta gama con auto-diagnóstico y drag & drop */}
        <RadicarSolicitudModal
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSubmit={handleRadicarSubmit}
          isSubmitting={isSubmitting}
          ambientes={ambientes}
          tiposCaso={tiposCaso}
          userPhone={user?.telefono}
        />

        {/* Modal de Ampliación de Evidencia */}
        {previewImage ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-3xl overflow-hidden rounded-2xl bg-white p-2">
              <img src={previewImage} alt="Vista ampliada" className="max-h-[85vh] w-full object-contain" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute right-4 top-4 rounded-full bg-slate-900/70 p-1.5 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </AppShell>
  )
}
