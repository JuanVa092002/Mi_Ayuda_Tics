import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getNotificaciones,
  marcarComoLeida as serviceMarcarLeida,
  marcarTodasComoLeidas as serviceMarcarTodas,
} from '@/features/notifications/api/notifications.service'
import { resolveApiBaseUrl } from '@/shared/api/axios'
import { getSessionToken } from '@/shared/api/sessionToken'
import type { Notificacion } from '@/shared/types'
import { toast } from '@/shared/ui'

interface UseNotificacionesResult {
  notificaciones: Notificacion[]
  noLeidas: number
  marcarLeida: (id: string) => Promise<void>
  marcarTodas: () => Promise<void>
  refresh: () => Promise<void>
  isLive: boolean
}

export function useNotificaciones(enabled: boolean): UseNotificacionesResult {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchNotificaciones = useCallback(async (): Promise<void> => {
    if (!enabled) return
    try {
      const response = await getNotificaciones()
      setNotificaciones(response.data)
      setNoLeidas(response.data.length)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al cargar notificaciones', error)
      }
    }
  }, [enabled])

  // Carga inicial
  useEffect(() => {
    void fetchNotificaciones()
  }, [fetchNotificaciones])

  // Canal SSE de Tiempo Real (Push sin recargar)
  useEffect(() => {
    if (!enabled) {
      setIsLive(false)
      return
    }

    const baseUrl = resolveApiBaseUrl()
    const token = getSessionToken()
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : ''
    const sseUrl = `${baseUrl}/notificaciones/stream${tokenQuery}`

    let sse: EventSource | null = null
    let reconnectTimer: NodeJS.Timeout | null = null

    const connectSSE = () => {
      try {
        sse = new EventSource(sseUrl, { withCredentials: true })
        eventSourceRef.current = sse

        sse.onopen = () => {
          setIsLive(true)
        }

        // Nueva notificación en tiempo real
        sse.addEventListener('nuevaNotificacion', (event: MessageEvent) => {
          try {
            const newNotif = JSON.parse(event.data) as Notificacion
            setNotificaciones((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)])
            setNoLeidas((prev) => prev + 1)

            // Feedback háptico/toast al instante
            toast.info(newNotif.mensaje, {
              icon: () => '🔔',
              autoClose: 5000,
            })
          } catch {
            void fetchNotificaciones()
          }
        })

        // Novedad en estado de ticket (ej. asignado, en_atencion, resuelto)
        sse.addEventListener('actualizarSolicitud', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data)
            // Despachar evento del sistema para que las vistas activas (Funcionario/Técnico) se refresquen sin recargar
            window.dispatchEvent(new CustomEvent('ticket:updated', { detail: data }))
          } catch {
            // Silencioso
          }
          void fetchNotificaciones()
        })

        sse.onerror = () => {
          setIsLive(false)
          sse?.close()
          eventSourceRef.current = null
          // Reintento con backoff en 5s
          reconnectTimer = setTimeout(connectSSE, 5000)
        }
      } catch {
        setIsLive(false)
      }
    }

    connectSSE()

    // Polling de respaldo de baja frecuencia (cada 60s) en caso de corte de red prolongado
    const backupInterval = setInterval(() => {
      void fetchNotificaciones()
    }, 60000)

    return () => {
      setIsLive(false)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      clearInterval(backupInterval)
      if (sse) sse.close()
      eventSourceRef.current = null
    }
  }, [enabled, fetchNotificaciones])

  const marcarLeida = async (id: string): Promise<void> => {
    try {
      await serviceMarcarLeida(id)
      setNotificaciones((prev) => prev.filter((n) => n._id !== id))
      setNoLeidas((prev) => Math.max(0, prev - 1))
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al marcar como leída', error)
      }
    }
  }

  const marcarTodas = async (): Promise<void> => {
    try {
      await serviceMarcarTodas()
      setNotificaciones([])
      setNoLeidas(0)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al marcar todas como leídas', error)
      }
    }
  }

  return {
    notificaciones,
    noLeidas,
    marcarLeida,
    marcarTodas,
    refresh: fetchNotificaciones,
    isLive,
  }
}
