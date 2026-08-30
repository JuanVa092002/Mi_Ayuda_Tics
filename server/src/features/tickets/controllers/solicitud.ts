import { Request, Response } from 'express'
import { handleHttpError } from '../../../shared/utils/handleError'
import { sendMail } from '../../../shared/utils/handleEmail'
import { logError } from '../../../shared/utils/logger'
import {
  buildSolicitudRegistradaEmail,
  buildCasoAsignadoEmail,
  getEmailFrom,
} from '../../../shared/emails'
import {
  emitSolicitudUpdate,
  emitTecnicoUpdate,
  emitNotificacion,
} from '../../../shared/services/realtime'
import { isSolicitudFotoRequired } from '../../../shared/config/media'
import { enrichSolicitudList, enrichSolicitudFoto } from '../../../shared/utils/enrichMediaResponse'
import { postConsecutivoCaso } from './consecutivoCaso'
import models from '../../../core/models'
import { Types } from 'mongoose'
import Notificacion from '../../shared/models/notificaciones'
import { entityIdsEqual, isFuncionarioOwner } from '../../../shared/utils/entity-id'
import { isDuplicateKeyError } from '../../../shared/utils/mongo-duplicate'

const { solicitudModel, storageModel, usuarioModel, ambienteModel } = models
import { saveUploadedFile } from '../../../shared/services/mediaStorage'

export const getSolicitud = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await solicitudModel
      .find({})
      .select('descripcion fecha estado codigoCaso')
      .populate('usuario', 'nombre')
      .populate('ambiente', 'nombre')
      .populate('tecnico', 'nombre')
      .populate('foto', 'url filename')
      .populate({
        path: 'solucion',
        select: 'descripcionSolucion evidencia',
        populate: { path: 'evidencia', select: 'url' },
      })

    res.status(200).json({ message: 'solicitudes consultadas exitosamente', data: enrichSolicitudList(data) })
  } catch (_error) {
    handleHttpError(res, 'error al obtener datos')
  }
}

export const getHistorialSolicitud = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await solicitudModel
      .find({ estado: { $ne: 'solicitado' } })
      .select('descripcion fecha estado codigoCaso')
      .populate('usuario', 'nombre')
      .populate('ambiente', 'nombre')
      .populate('tecnico', 'nombre')
      .populate('foto', 'url filename')
      .populate({ path: 'solucion', select: 'descripcionSolucion' })

    res.status(200).json({ message: 'Solicitudes consultadas exitosamente', data: enrichSolicitudList(data) })
  } catch (_error) {
    handleHttpError(res, 'Error al obtener datos')
  }
}

export const getSolicitudId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const solicitud = await solicitudModel.findById(id).select('usuario tecnico')

    if (!solicitud) {
      handleHttpError(res, 'solicitud no encontrada', 404)
      return
    }

    const usuario = req.usuario!
    if (usuario.rol === 'funcionario' && !entityIdsEqual(solicitud.usuario, usuario._id)) {
      handleHttpError(res, 'No autorizado', 403)
      return
    }
    if (usuario.rol === 'tecnico' && !entityIdsEqual(solicitud.tecnico, usuario._id)) {
      handleHttpError(res, 'No autorizado', 403)
      return
    }

    const funcionarioOwner = isFuncionarioOwner(usuario.rol, usuario._id, solicitud.usuario)
    const detailSelect = funcionarioOwner
      ? 'descripcion fecha estado codigoCaso tipoCaso telefono'
      : 'descripcion fecha estado codigoCaso tipoCaso'

    const data = await solicitudModel
      .findById(id)
      .select(detailSelect)
      .populate('usuario', 'nombre')
      .populate('ambiente', 'nombre activo')
      .populate('tipoCaso', 'nombre')
      .populate('tecnico', 'nombre')
      .populate('foto', 'url filename')
      .populate({
        path: 'solucion',
        select: 'descripcionSolucion evidencia',
        populate: { path: 'evidencia', select: 'url' },
      })

    if (!data) {
      handleHttpError(res, 'solicitud no encontrada', 404)
      return
    }
    res.status(200).json({ message: 'solicitud consultada exitosamente', data: enrichSolicitudFoto(data) })
  } catch (_error) {
    handleHttpError(res, 'Error al consultar la solicitud')
  }
}

export const deleteSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = await solicitudModel.findByIdAndDelete(id)
    if (!data) {
      handleHttpError(res, 'solicitud no encontrada', 404)
      return
    }
    res.status(200).json({ message: 'Solicitud eliminada exitosamente', data })
  } catch (_error) {
    handleHttpError(res, 'Error al eliminar solicitud')
  }
}

export const getSolicitudesPendientes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await solicitudModel
      .find({ estado: 'solicitado' })
      .select('descripcion fecha estado codigoCaso')
      .populate('usuario', 'nombre')
      .populate('ambiente', 'nombre')
      .populate('foto', 'url filename')

    res.status(200).json({ message: 'Solicitudes pendientes consultadas', data: enrichSolicitudList(data) })
  } catch (_error) {
    handleHttpError(res, 'Error al obtener solicitudes pendientes')
  }
}

export const crearSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario!._id
    const { body } = req
    const file = req.file

    const ambienteActivo = await ambienteModel.findOne({ _id: body.ambiente, activo: true })
    if (!ambienteActivo) {
      handleHttpError(res, 'El ambiente seleccionado no está activo o no existe', 400)
      return
    }

    let fotoId: Types.ObjectId | undefined

    if (file) {
      const fileData = await saveUploadedFile(file, 'evidencias')
      const fileSaved = await storageModel.create(fileData)
      fotoId = fileSaved._id
    } else if (body.fotoId) {
      const existing = await storageModel.findById(body.fotoId)
      if (!existing) {
        handleHttpError(res, 'La foto referenciada no existe', 400)
        return
      }
      fotoId = existing._id
    }

    if (isSolicitudFotoRequired() && !fotoId) {
      handleHttpError(res, 'La foto es obligatoria para registrar la solicitud', 400)
      return
    }

    const codigoCaso = await postConsecutivoCaso()

    const dataSolicitud = {
      ...body,
      usuario: usuarioId,
      foto: fotoId,
      codigoCaso,
      estado: 'solicitado',
    }

    delete dataSolicitud.fotoId

    const solicitudCreada = await solicitudModel.create(dataSolicitud)
    res.status(201).send({ message: 'Registro de solicitud exitoso', solicitud: solicitudCreada })

    const usuario = await usuarioModel.findById(dataSolicitud.usuario)
    if (usuario) {
      const { html, text } = buildSolicitudRegistradaEmail({
        nombre: usuario.nombre,
        codigoCaso,
      })
      await sendMail({
        from: getEmailFrom(),
        to: usuario.correo,
        subject: 'Registro Solicitud — AyudaTIC',
        html,
        text,
      })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    if (isDuplicateKeyError(error, 'codigoCaso')) {
      handleHttpError(res, 'No se pudo asignar un código único a la solicitud', 409, error)
      return
    }
    handleHttpError(res, 'Error al registrar solicitud')
  }
}

export const historialSolicitudesCreadas = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = req.usuario!._id
  const usuario = await usuarioModel.findById(usuarioId)

  try {
    const solicitudesFinalizadas = await solicitudModel
      .find({ usuario: usuarioId })
      .select('descripcion fecha estado codigoCaso')
      .sort({ fecha: -1, _id: -1 })
      .populate('ambiente', 'nombre')
      .populate('tipoCaso', 'nombre')
      .populate('tecnico', 'nombre')
      .populate('foto', 'url filename')
      .populate({ path: 'solucion', select: 'descripcionSolucion' })

    res.status(200).json({
      message: `Historial Solicitudes finalizadas ${usuario?.nombre ?? ''}`,
      solicitudesFinalizadas: enrichSolicitudList(solicitudesFinalizadas),
    })
  } catch (_error) {
    handleHttpError(res, 'error al obtener datos')
  }
}

export const asignarTecnicoSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { tecnico } = req.body

    const solicitud = await solicitudModel.findById(id)
    if (!solicitud) {
      res.status(404).json({ message: 'Solicitud no encontrada' })
      return
    }

    const tecnicoAsignado = await usuarioModel.findOne({ _id: tecnico, rol: 'tecnico', estado: true })
    if (!tecnicoAsignado) {
      res.status(404).json({ message: 'Técnico no encontrado o no aprobado' })
      return
    }

    if (solicitud.estado !== 'solicitado') {
      res.status(409).json({
        message: 'Solo se pueden asignar solicitudes en estado solicitado',
      })
      return
    }

    const solicitudActualizada = await solicitudModel.findByIdAndUpdate(
      id,
      { 
        tecnico, 
        estado: 'asignado' 
      },
      { new: true, runValidators: false }
    )

    if (!solicitudActualizada) {
      res.status(404).json({ message: 'Error al actualizar la solicitud' })
      return
    }

    const notificacion = await Notificacion.create({
      usuario: solicitudActualizada.usuario,
      mensaje: `Tu solicitud #${solicitudActualizada.codigoCaso} cambió a "Asignado"`,
      tipo: 'estado_ticket',
      ticketId: solicitudActualizada._id,
      leido: false
    })

    emitSolicitudUpdate(String(solicitudActualizada.usuario), solicitudActualizada)
    emitSolicitudUpdate(String(tecnico), solicitudActualizada)
    emitNotificacion(String(solicitudActualizada.usuario), notificacion)

    const solicitudesAsignadas = await solicitudModel.countDocuments({
      tecnico,
      estado: 'asignado',
    })

    emitTecnicoUpdate(String(tecnico), {
      tecnicoId: String(tecnico),
      numeroSolicitudesAsignadas: solicitudesAsignadas,
    })

    const { html, text } = buildCasoAsignadoEmail({
      nombre: tecnicoAsignado.nombre,
      codigoCaso: solicitudActualizada.codigoCaso,
    })
    try {
      await sendMail({
        from: getEmailFrom(),
        to: tecnicoAsignado.correo,
        subject: 'Asignación de caso — AyudaTIC',
        html,
        text,
      })
    } catch (error) {
      logError('Error al enviar correo de asignación de caso', error, {
        solicitudId: id,
        tecnicoId: String(tecnico),
      })
    }

    res.status(200).json({ message: 'Técnico asignado exitosamente', solicitud: solicitudActualizada })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ message: 'Error al asignar técnico', error: err.message })
  }
}

export const getSolicitudesAsignadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const tecnicoId = req.usuario!._id
    const tecnico = await usuarioModel.findById(tecnicoId)

    const solicitudesAsignadas = await solicitudModel
      .find({ tecnico: tecnicoId, estado: { $ne: 'finalizado' } })
      .select('descripcion telefono fecha estado codigoCaso')
      .populate('usuario', 'nombre')
      .populate('ambiente', 'nombre')
      .populate('foto', 'url filename')

    // Evita respuestas condicionales 304 sin body para esta consulta de técnico.
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')

    res.status(200).json({
      message: `solicitudes asignadas tecnico ${tecnico?.nombre ?? ''}`,
      solicitudesAsignadas: enrichSolicitudList(solicitudesAsignadas),
    })
  } catch (_error) {
    handleHttpError(res, 'Error al obtener datos')
  }
}

export const getSolicitudesFinalizadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const tecnicoId = req.usuario!._id
    const tecnico = await usuarioModel.findById(tecnicoId)

    const solicitudesFinalizadas = await solicitudModel
      .find({ tecnico: tecnicoId, estado: 'finalizado' })
      .select('descripcion fecha codigoCaso')
      .populate('usuario', 'nombre')
      .populate('ambiente', 'nombre')
      .populate('foto', 'url filename')
      .populate({
        path: 'solucion',
        select: 'descripcionSolucion evidencia',
        populate: { path: 'evidencia', select: 'url' },
      })

    res.status(200).json({
      message: `Solicitudes finalizadas del técnico ${tecnico?.nombre ?? ''}`,
      solicitudesFinalizadas: enrichSolicitudList(solicitudesFinalizadas),
    })
  } catch (_error) {
    handleHttpError(res, 'Error al obtener solicitudes finalizadas')
  }
}


