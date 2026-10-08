import { Request, Response } from 'express'
import { handleHttpError } from '../../../shared/utils/handleError'
import models from '../../../core/models'

const { tipoCasoModel, solicitudModel } = models

export const getTipoCaso = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await tipoCasoModel.find({})
    res.send({ data })
  } catch (_error) {
    handleHttpError(res, 'error al obtener datos')
  }
}

export const getTipoCasoId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = await tipoCasoModel.findById(id)
    if (!data) {
      handleHttpError(res, 'tipo de caso no encontrado')
      return
    }
    res.send({ message: 'tipo de caso consultado exitosamente', data })
  } catch (_error) {
    handleHttpError(res, 'Error al consultar el tipo de caso')
  }
}

export const postTipoCaso = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  try {
    const data = await tipoCasoModel.create(body)
    res.send({ message: 'tipo de caso registrado exitosamente', data })
  } catch (_error) {
    handleHttpError(res, 'Error al registrar el tipo de caso')
  }
}

export const updateTipoCaso = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  const { body } = req
  try {
    const updateData = { ...body }
    const data = await tipoCasoModel.findOneAndUpdate({ _id: id }, updateData, { new: true })
    res.send({ message: `tipo de caso ${id} actualizado exitosamente`, data })
  } catch (_error) {
    handleHttpError(res, 'error al actualizar tipo de caso')
  }
}

export const deleteTipoCaso = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  try {
    const inUse = await solicitudModel.exists({ tipoCaso: id })
    if (inUse) {
      handleHttpError(res, 'No se puede eliminar: existen solicitudes vinculadas a esta categoría', 409)
      return
    }

    const data = await tipoCasoModel.findByIdAndDelete({ _id: id })
    if (!data) {
      handleHttpError(res, 'tipo de caso no encontrado', 404)
      return
    }
    res.send({ message: `tipo de caso ${id} eliminado` })
  } catch (_error) {
    handleHttpError(res, 'Error al eliminar tipo de caso')
  }
}

