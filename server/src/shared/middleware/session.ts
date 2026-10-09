import { Request, Response, NextFunction } from 'express'
import { handleHttpError } from '../utils/handleError'
import { verifyToken } from '../utils/handleJwt'
import { assertAccountActive } from './accountStatus'
import { extractAuthToken } from '../utils/extractAuthToken'
import models from '../../core/models'

const { usuarioModel } = models

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractAuthToken({
      authorizationHeader: req.headers.authorization,
      cookies: req.cookies as { token?: string },
      cookieHeader: req.headers.cookie,
      queryParamToken: req.query?.token,
    })

    if (!token) {
      handleHttpError(res, 'Se requiere autenticación para acceder a este recurso', 401)
      return
    }

    const dataToken = await verifyToken(token)
    if (!dataToken?._id) {
      handleHttpError(res, 'Token inválido. Por favor, inicia sesión nuevamente', 401)
      return
    }

    const usuario = await usuarioModel.findById(dataToken._id)
    if (!usuario) {
      handleHttpError(res, 'Usuario no encontrado', 401)
      return
    }

    if (!assertAccountActive(res, usuario)) {
      return
    }

    req.usuario = usuario
    next()
  } catch {
    handleHttpError(res, 'Sesión expirada. Por favor, inicia sesión nuevamente', 401)
  }
}
