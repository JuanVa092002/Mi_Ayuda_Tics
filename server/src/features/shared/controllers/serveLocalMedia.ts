import mongoose from 'mongoose'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { getStorageDir } from '../../../shared/config/storagePaths'
import { isDefaultAvatar } from '../../../shared/constants/media'
import models from '../../../core/models'
import { actorCanAccessStorage } from '../../tickets/domain/storage-access'
import type { ActorRole } from '../../tickets/domain/solicitud-lifecycle'

const { storageModel } = models

export function isSafeMediaFilename(filename: string): boolean {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false
  }
  return /^[a-zA-Z0-9._-]+$/.test(filename)
}

export const serveLocalMedia = async (req: Request, res: Response): Promise<void> => {
  const raw = req.params.filename
  const filename = Array.isArray(raw) ? raw[0] : raw

  if (!isSafeMediaFilename(filename)) {
    res.status(400).json({ message: 'Nombre de archivo inválido' })
    return
  }

  const filePath = path.join(getStorageDir(), filename)
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Archivo no encontrado' })
    return
  }

  const usuario = req.usuario
  if (!usuario) {
    res.status(401).json({ message: 'No autorizado' })
    return
  }

  if (isDefaultAvatar(filename)) {
    res.sendFile(filePath)
    return
  }

  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'No se pudo autorizar el archivo' })
    return
  }

  try {
    const stored = await storageModel.findOne({ filename }).select('_id filename')
    if (!stored) {
      res.status(404).json({ message: 'Archivo no encontrado' })
      return
    }

    const allowed = await actorCanAccessStorage(
      { id: String(usuario._id), rol: usuario.rol as ActorRole },
      String(stored._id),
      stored.filename,
    )
    if (!allowed) {
      res.status(403).json({ message: 'No autorizado' })
      return
    }
  } catch {
    res.status(503).json({ message: 'No se pudo autorizar el archivo' })
    return
  }

  res.sendFile(filePath)
}
