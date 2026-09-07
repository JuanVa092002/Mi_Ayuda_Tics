import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { handleHttpError } from '../../../shared/utils/handleError'
import models from '../../../core/models'
import { deleteStoredMedia, saveUploadedFile } from '../../../shared/services/mediaStorage'
import { isDefaultAvatar } from '../../../shared/constants/media'
import { actorCanAccessStorage } from '../../tickets/domain/storage-access'
import type { ActorRole } from '../../tickets/domain/solicitud-lifecycle'

const { storageModel } = models

function isExactObjectId(id: string | undefined): id is string {
  return Boolean(id && Types.ObjectId.isValid(id) && String(new Types.ObjectId(id)) === id)
}

export const createStorage = async (req: Request, res: Response): Promise<void> => {
  const { file } = req
  if (!file) {
    res.status(400).send({ message: 'archivo no cargado' })
    return
  }

  try {
    const fileData = await saveUploadedFile(file, 'storage')
    const data = await storageModel.create(fileData)
    res.status(201).send({ message: 'archivo creado exitosamente', file: data })
  } catch (error) {
    handleHttpError(res, 'Error al crear archivo', 500, error)
  }
}

export const getStorage = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await storageModel.find({})
    res.send({ data })
  } catch (error) {
    handleHttpError(res, 'error al obtener datos', 500, error)
  }
}

export const getStorageId = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  if (!isExactObjectId(id)) {
    handleHttpError(res, 'Archivo no encontrado', 404)
    return
  }
  try {
    const data = await storageModel.findById(id)
    if (!data) {
      handleHttpError(res, 'Archivo no encontrado', 404)
      return
    }
    const usuario = req.usuario
    if (!usuario) {
      handleHttpError(res, 'No autorizado', 401)
      return
    }
    const allowed = await actorCanAccessStorage(
      { id: String(usuario._id), rol: usuario.rol as ActorRole },
      String(data._id),
      data.filename,
    )
    if (!allowed) {
      handleHttpError(res, 'No autorizado', 403)
      return
    }
    res.send({ data })
  } catch (error) {
    handleHttpError(res, 'error al obtener datos', 500, error)
  }
}

export const updateStorage = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  const { body } = req
  const file = req.file

  try {
    const storageData = await storageModel.findById(id)
    if (!storageData) {
      handleHttpError(res, 'Archivo no encontrado', 404)
      return
    }

    const updateData: Record<string, string> = { ...body }

    if (file) {
      if (!isDefaultAvatar(storageData.filename)) {
        await deleteStoredMedia(storageData)
      }
      const uploaded = await saveUploadedFile(file, 'storage')
      updateData.filename = uploaded.filename
      updateData.url = uploaded.url
    }

    const data = await storageModel.findOneAndUpdate({ _id: id }, updateData, { new: true })
    res.send({ message: `Archivo ${id} actualizado exitosamente`, data })
  } catch (error) {
    handleHttpError(res, 'Error al actualizar archivo', 500, error)
  }
}

export const deleteStorage = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  try {
    const data = await storageModel.findByIdAndDelete(id)
    if (!data) {
      handleHttpError(res, 'Archivo no encontrado', 404)
      return
    }

    if (!isDefaultAvatar(data.filename)) {
      await deleteStoredMedia(data)
    }

    res.send({ message: `Archivo ${id} eliminado correctamente` })
  } catch (error) {
    handleHttpError(res, 'Error al eliminar la imagen', 500, error)
  }
}
