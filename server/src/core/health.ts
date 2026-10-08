import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { isCloudinaryEnabled } from '../shared/config/cloudinary'
import { getActiveSocketConnections } from '../shared/utils/handleSocket'

function isBrevoConfigured(): boolean {
  if (process.env.BREVO_API_KEY?.trim()) return true
  return Boolean(process.env.BREVO_USER?.trim() && process.env.BREVO_PASSWORD?.trim())
}

/**
 * Liveness probe for Render/Vercel. Must always return HTTP 2xx so platform
 * health checks pass during boot (MongoDB may still be connecting).
 */
export const healthCheck = (_req: Request, res: Response): void => {
  const dbOk = mongoose.connection.readyState === 1

  res.status(200).json({
    status: dbOk ? 'ok' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'local-dev',
    backendUrl: `http://localhost:${process.env.PORT || 8000}`,
    uptime: process.uptime(),
    database: dbOk ? 'connected' : 'disconnected',
    integrations: {
      cloudinary: isCloudinaryEnabled() ? 'configured' : 'local',
      brevo: isBrevoConfigured() ? 'configured' : 'missing',
      socket: { connections: getActiveSocketConnections() },
    },
    timestamp: new Date().toISOString(),
  })
}
