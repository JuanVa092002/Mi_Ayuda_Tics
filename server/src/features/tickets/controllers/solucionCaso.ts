import { Request, Response } from 'express'
import { handleHttpError } from '../../../shared/utils/handleError'
import { sendMail } from '../../../shared/utils/handleEmail'
import { logError } from '../../../shared/utils/logger'
import { buildCasoCerradoEmail, getEmailFrom } from '../../../shared/emails'
import { emitSolicitudUpdate, emitNotificacion } from '../../../shared/services/realtime'
import models from '../../../core/models'
import { Types } from 'mongoose'
import Notificacion from '../../shared/models/notificaciones'

const { solicitudModel, storageModel, usuarioModel, solucionCasoModel } = models
import { saveUploadedFile } from '../../../shared/services/mediaStorage'

export const solucionCaso = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { body } = req
  const file = req.file

  try {
    const solicitud = await solicitudModel.findById(id)
    if (!solicitud) {
      res.status(404).send({ message: 'Solicitud no encontrada' })
      return
    }

    const tecnicoId = req.usuario!._id.toString()
    if (!solicitud.tecnico || solicitud.tecnico.toString() !== tecnicoId) {
      res.status(403).send({ message: 'No autorizado para resolver esta solicitud' })
      return
    }

    if (solicitud.workflowVersion === 2) {
      res.status(409).send({
        message: 'Esta solicitud usa el flujo actual. Registra la solución parcial o total desde las acciones del ticket.',
      })
      return
    }

    if (solicitud.estado === 'finalizado') {
      res.status(409).send({ message: 'La solicitud ya está finalizada' })
      return
    }

    if (!['asignado', 'pendiente'].includes(solicitud.estado)) {
      res.status(409).send({ message: 'Estado inválido para registrar solución' })
      return
    }

    const { tipoSolucion } = body as { tipoSolucion: 'pendiente' | 'finalizado' }

    if (tipoSolucion === 'finalizado' && solicitud.solucion) {
      res.status(409).send({ message: 'La solicitud ya tiene una solución registrada' })
      return
    }

    let fotoId: Types.ObjectId | undefined

    if (file) {
      const fileData = await saveUploadedFile(file, 'evidencias')
      const fileSaved = await storageModel.create(fileData)
      fotoId = fileSaved._id
    }

    if (tipoSolucion === 'pendiente') {
      solicitud.estado = 'pendiente'
    } else if (tipoSolucion === 'finalizado') {
      solicitud.estado = 'finalizado'

      const usuario = await usuarioModel.findById(solicitud.usuario)
      if (usuario) {
        const { html, text } = buildCasoCerradoEmail({
          nombre: usuario.nombre,
          codigoCaso: solicitud.codigoCaso,
        })
        try {
          await sendMail({
            from: getEmailFrom(),
            to: usuario.correo,
            subject: 'Caso Cerrado — AyudaTIC',
            html,
            text,
          })
        } catch (error) {
          logError('Error al enviar correo de caso cerrado', error, {
            solicitudId: id,
            usuarioId: String(solicitud.usuario),
          })
        }
      }
    }

    const dataSolucion = {
      ...body,
      solicitud: solicitud._id,
      evidencia: fotoId,
    }

    const solucion = await solucionCasoModel.create(dataSolucion)
    const solicitudActualizada = await solicitudModel.findByIdAndUpdate(
      id,
      { 
        solucion: solucion._id,
        estado: solicitud.estado 
      },
      { new: true, runValidators: false }
    )

    if (!solicitudActualizada) {
      res.status(404).json({ message: 'Error al actualizar la solicitud' })
      return
    }

    const mensajeNotif = solicitudActualizada.estado === 'finalizado' 
      ? `Tu solicitud #${solicitudActualizada.codigoCaso} cambió a "Finalizado"`
      : `Tu solicitud #${solicitudActualizada.codigoCaso} cambió a "Pendiente"`

    const notificacion = await Notificacion.create({
      usuario: solicitudActualizada.usuario,
      mensaje: mensajeNotif,
      tipo: 'estado_ticket',
      ticketId: solicitudActualizada._id,
      leido: false
    })

    emitSolicitudUpdate(String(solicitudActualizada.usuario), solicitudActualizada)
    emitNotificacion(String(solicitudActualizada.usuario), notificacion)
    if (solicitudActualizada.tecnico) {
      emitSolicitudUpdate(String(solicitudActualizada.tecnico), solicitudActualizada)
    }

    const message =
      tipoSolucion === 'finalizado'
        ? 'Caso cerrado exitosamente'
        : 'La solución del caso está pendiente y será resuelto próximamente.'

    res.status(200).send({ message, solucionCaso: solucion })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    handleHttpError(res, 'Error al registrar la solución del caso')
  }
}
