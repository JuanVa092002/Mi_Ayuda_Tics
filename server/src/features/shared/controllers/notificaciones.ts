import { Request, Response } from 'express'
import Notificacion from '../models/notificaciones'
import { addSseClient } from '../../../shared/services/sseBroadcaster'

/**
 * Endpoint de streaming Server-Sent Events (SSE) para notificaciones y novedades en vivo.
 * Mantiene la conexión abierta con keep-alive sin sobrecargar el servidor.
 */
export const streamNotificaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.usuario!._id.toString()

    // Encabezados HTTP requeridos por el estándar SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()

    // Notificar al cliente que la conexión fue aceptada
    res.write(`event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`)

    // Registrar cliente en el broadcaster con su rol
    const userRole = req.usuario?.rol || 'funcionario'
    const removeClient = addSseClient(userId, res, userRole)

    // Heartbeat de 25 segundos para evitar timeouts de proxies/balanceadores
    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n')
      } catch {
        clearInterval(pingInterval)
        removeClient()
      }
    }, 25000)

    req.on('close', () => {
      clearInterval(pingInterval)
      removeClient()
      res.end()
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message })
  }
}

export const getNotificaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.usuario!._id
    const notificaciones = await Notificacion.find({
      usuario: userId,
      leido: false,
    }).sort({ createdAt: -1 })

    res.status(200).json(notificaciones)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message })
  }
}

export const marcarComoLeida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.usuario!._id.toString()

    const notificacion = await Notificacion.findById(id)
    if (!notificacion) {
      res.status(404).json({ message: 'Notificación no encontrada' })
      return
    }

    if (notificacion.usuario.toString() !== userId) {
      res.status(403).json({ message: 'No autorizado para modificar esta notificación' })
      return
    }

    notificacion.leido = true
    await notificacion.save()

    res.status(200).json(notificacion)
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message })
  }
}

export const marcarTodasComoLeidas = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.usuario!._id
    await Notificacion.updateMany({ usuario: userId, leido: false }, { leido: true })

    res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: err.message })
  }
}
