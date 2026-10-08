import { Request, Response } from 'express'
import { handleHttpError } from '../../../shared/utils/handleError'
import { sendMail } from '../../../shared/utils/handleEmail'
import { logError } from '../../../shared/utils/logger'
import {
  buildTecnicoAprobadoEmail,
  buildTecnicoDenegadoEmail,
  getEmailFrom,
} from '../../../shared/emails'
import models from '../../../core/models'
import { Types } from 'mongoose'
import { deleteStoredMedia } from '../../../shared/services/mediaStorage'
import { isDefaultAvatar } from '../../../shared/constants/media'

const { usuarioModel, storageModel, solicitudModel } = models

/** Shape of a lean tecnico document augmented with solicitudes count */
interface TecnicoConSolicitudes {
  _id: Types.ObjectId
  nombre: string
  correo: string
  telefono: string
  numeroSolicitudesAsignadas?: number
}

export const listaTecnicosPendientes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tecnicosFalse = await usuarioModel
      .find({ rol: 'tecnico', estado: false })
      .select('nombre correo estado telefono')

    if (!tecnicosFalse) {
      res.status(500).send({ message: 'no hay tecnicos pendientes de aprobación' })
      return
    }
    res.status(200).json({ message: 'lista de tecnicos pendientes de aprobacion', tecnicosFalse })
  } catch (_error) {
    handleHttpError(res, 'Error al listar tecnicos pendientes de aprobacion', 500)
  }
}

export const aprobarTecnico = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  try {
    const tecnico = await usuarioModel.findOneAndUpdate(
      { _id: id, rol: 'tecnico', estado: false },
      { estado: true, activo: true },
      { new: true }
    )
    if (!tecnico) {
      res.status(404).send({ message: 'Técnico no encontrado' })
      return
    }

    res.status(200).send({ message: 'Técnico aprobado exitosamente', tecnico })

    const { html, text } = buildTecnicoAprobadoEmail({ nombre: tecnico.nombre })
    try {
      await sendMail({
        from: getEmailFrom(),
        to: tecnico.correo,
        subject: 'Ya puedes salir a campo — MiAyudaTics',
        html,
        text,
      })
    } catch (error) {
      logError('Error al enviar correo de aprobación de técnico', error, { tecnicoId: id })
    }
  } catch (_error) {
    handleHttpError(res, 'Error al aprobar técnico', 500)
  }
}

export const denegarTecnico = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  try {
    const tecnico = await usuarioModel
      .findOne({ _id: id, rol: 'tecnico', estado: false })
      .populate<{ foto: { _id: Types.ObjectId; filename: string; url: string } | null }>('foto')

    if (!tecnico) {
      res.status(404).send({ message: 'tecnico no encontrado' })
      return
    }

    if (tecnico.foto && !isDefaultAvatar(tecnico.foto.filename)) {
      await storageModel.findByIdAndDelete(tecnico.foto._id)
      await deleteStoredMedia(tecnico.foto)
    }

    const { html, text } = buildTecnicoDenegadoEmail({ nombre: tecnico.nombre })
    try {
      await sendMail({
        from: getEmailFrom(),
        to: tecnico.correo,
        subject: 'Tu registro no quedó habilitado — MiAyudaTics',
        html,
        text,
      })
    } catch (error) {
      logError('Error al enviar correo de denegación de técnico', error, { tecnicoId: id })
    }

    await usuarioModel.findByIdAndDelete(id)

    res.send({
      message: `tecnico ${id} ha sido denegado, eliminando sus datos de registro y su foto asociada`,
    })
  } catch (_error) {
    handleHttpError(res, 'Error al eliminar el usuario', 500)
  }
}

export const listaTecnicosAprobados = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tecnicos = await usuarioModel
      .find({ rol: 'tecnico', estado: true, activo: true }, 'nombre correo telefono')
      .lean<TecnicoConSolicitudes[]>()

    for (const tecnico of tecnicos) {
      tecnico.numeroSolicitudesAsignadas = await solicitudModel.countDocuments({
        tecnico: tecnico._id,
        estado: 'asignado',
      })
    }

    res.status(200).json({ message: 'Lista de técnicos con registro aprobado', tecnicos })
  } catch (_error) {
    handleHttpError(res, 'Error al listar técnicos con registro aprobado', 500)
  }
}

