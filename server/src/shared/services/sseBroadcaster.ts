import type { Response } from 'express'

interface SseClient {
  userId: string
  rol: string
  res: Response
}

// Mapa de conexiones activas por usuario y rol
const clients: SseClient[] = []

/**
 * Registra un nuevo cliente SSE para recibir eventos push unidireccionales
 */
export function addSseClient(userId: string, res: Response, rol = 'funcionario'): () => void {
  const client: SseClient = { userId, rol, res }
  clients.push(client)

  return () => {
    const index = clients.indexOf(client)
    if (index !== -1) {
      clients.splice(index, 1)
    }
  }
}

/**
 * Envía un evento con datos tipados a todas las conexiones activas de un usuario específico
 */
export function broadcastToUser(userId: string, eventName: string, data: unknown): void {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`
  for (const client of clients) {
    if (client.userId === userId) {
      try {
        client.res.write(payload)
      } catch {
        // En caso de socket roto el cleanup del request req.on('close') lo removerá
      }
    }
  }
}

/**
 * Emite a todos los usuarios conectados con un rol específico (ej. 'lider', 'admin', 'tecnico')
 */
export function broadcastToRole(rol: string, eventName: string, data: unknown): void {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`
  for (const client of clients) {
    if (client.rol === rol || (rol === 'lider' && client.rol === 'admin')) {
      try {
        client.res.write(payload)
      } catch {
        // En caso de socket roto el cleanup del request req.on('close') lo removerá
      }
    }
  }
}

/**
 * Emite a múltiples usuarios (ej. funcionario y técnico)
 */
export function broadcastToUsers(userIds: string[], eventName: string, data: unknown): void {
  for (const uid of userIds) {
    if (uid) broadcastToUser(uid, eventName, data)
  }
}
