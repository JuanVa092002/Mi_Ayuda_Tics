import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { handleHttpError } from '../../../shared/utils/handleError'
import { logError, logWarn } from '../../../shared/utils/logger'
import { sendMail } from '../../../shared/utils/handleEmail'
import { buildCasoAsignadoEmail, getEmailFrom } from '../../../shared/emails'
import {
  emitNotificacion,
  emitSolicitudUpdate,
  emitTecnicoUpdate,
} from '../../../shared/services/realtime'
import { enrichSolicitudFoto } from '../../../shared/utils/enrichMediaResponse'
import { saveUploadedFile } from '../../../shared/services/mediaStorage'
import models from '../../../core/models'
import Notificacion from '../../shared/models/notificaciones'
import {
  applySolicitudWorkflowAction,
  isWorkflowHttpError,
  loadPublicHistorial,
  type WorkflowActionPayload,
} from '../domain/solicitud-workflow'
import { toSolicitudDetail } from '../domain/solicitud-dto'
import { WORKFLOW_V2, type SolicitudActor, type SolicitudWorkflowAction } from '../domain/solicitud-lifecycle'
import { requireClientOperationId } from '../domain/workflow-idempotency'

const { solicitudModel, usuarioModel, storageModel } = models

function actorFromRequest(req: Request): SolicitudActor {
  return {
    id: String(req.usuario!._id),
    rol: req.usuario!.rol as SolicitudActor['rol'],
  }
}

function jsonDoc(doc: unknown): Record<string, unknown> {
  const record = doc as { toObject?: () => Record<string, unknown> }
  return (record.toObject?.() ?? doc) as Record<string, unknown>
}

async function optionalEvidenceId(req: Request): Promise<Types.ObjectId | undefined> {
  const file = req.file
  if (!file) return undefined
  const fileData = await saveUploadedFile(file, 'evidencias')
  const saved = await storageModel.create(fileData)
  return saved._id
}

async function notifyStatus(solicitud: {
  _id: unknown
  usuario: unknown
  tecnico?: unknown
  codigoCaso: string
  estado: string
}) {
  const notificacion = await Notificacion.create({
    usuario: solicitud.usuario,
    mensaje: `Tu solicitud #${solicitud.codigoCaso} cambió a "${solicitud.estado}"`,
    tipo: 'estado_ticket',
    ticketId: solicitud._id,
    leido: false,
  })
  emitSolicitudUpdate(String(solicitud.usuario), solicitud)
  emitNotificacion(String(solicitud.usuario), notificacion)
  if (solicitud.tecnico) {
    emitSolicitudUpdate(String(solicitud.tecnico), solicitud)
  }
}

function readOperationId(req: Request): string | undefined {
  const header = req.get('Idempotency-Key')?.trim()
  const body = typeof req.body?.operationId === 'string' ? req.body.operationId.trim() : ''
  return header || body || undefined
}

function sendWorkflowError(res: Response, error: { status: number; message: string; code?: string }): void {
  if (error.code) {
    res.status(error.status).json({ code: error.code, message: error.message })
    return
  }
  handleHttpError(res, error.message, error.status)
}

async function runAction(
  req: Request,
  res: Response,
  action: SolicitudWorkflowAction,
  payload: WorkflowActionPayload,
): Promise<void> {
  try {
    const solicitud = await solicitudModel.findById(req.params.id)
    if (!solicitud) {
      handleHttpError(res, 'solicitud no encontrada', 404)
      return
    }

    const operationId = requireClientOperationId(readOperationId(req))
    const result = await applySolicitudWorkflowAction({
      solicitud,
      action,
      actor: actorFromRequest(req),
      payload: { ...payload, operationId },
    })

    if (!result.idempotent) {
      await notifyStatus(result.solicitud)
    }

    const historial = await loadPublicHistorial(result.solicitud._id)
    res.status(200).json({
      message: result.idempotent ? 'La solicitud ya estaba en este estado' : 'Acción registrada',
      solicitud: toSolicitudDetail(
        jsonDoc(enrichSolicitudFoto(result.solicitud)),
        actorFromRequest(req),
        { historial: historial.items, historialNextCursor: historial.nextCursor },
      ),
      event: result.event,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    if (isWorkflowHttpError(error)) {
      sendWorkflowError(res, error)
      return
    }
    handleHttpError(res, 'Error al actualizar la solicitud')
  }
}

export async function reasignarTecnicoSolicitud(req: Request, res: Response): Promise<void> {
  const tecnico = await usuarioModel.findOne({
    _id: req.body.tecnico,
    rol: 'tecnico',
    estado: true,
  })
  if (!tecnico) {
    handleHttpError(res, 'Técnico no encontrado o no aprobado', 404)
    return
  }
  await runAction(req, res, 'reassign', {
    tecnicoId: String(req.body.tecnico),
    tecnicoNombre: tecnico.nombre,
    motivo: req.body.motivo,
  })
}

export async function iniciarAtencionSolicitud(req: Request, res: Response): Promise<void> {
  await runAction(req, res, 'start', {})
}

export async function agregarActualizacionSolicitud(req: Request, res: Response): Promise<void> {
  try {
    const attachmentId = await optionalEvidenceId(req)
    await runAction(req, res, 'update', {
      mensaje: req.body.mensaje,
      attachmentId,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    handleHttpError(res, 'Error al registrar la actualización')
  }
}

export async function solicitarInformacionSolicitud(req: Request, res: Response): Promise<void> {
  await runAction(req, res, 'wait_for_requester', { mensaje: req.body.mensaje })
}

export async function responderInformacionSolicitud(req: Request, res: Response): Promise<void> {
  try {
    const attachmentId = await optionalEvidenceId(req)
    await runAction(req, res, 'requester_reply', {
      mensaje: req.body.mensaje,
      attachmentId,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    handleHttpError(res, 'Error al responder la solicitud')
  }
}

export async function registrarSolucionParcial(req: Request, res: Response): Promise<void> {
  try {
    const attachmentId = await optionalEvidenceId(req)
    await runAction(req, res, 'partial_solution', {
      queSeHizo: req.body.queSeHizo,
      queFalta: req.body.queFalta,
      siguienteAccion: req.body.siguienteAccion,
      fechaEsperada: req.body.fechaEsperada,
      attachmentId,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    handleHttpError(res, 'Error al registrar la solución parcial')
  }
}

export async function registrarSolucionTotal(req: Request, res: Response): Promise<void> {
  try {
    const attachmentId = await optionalEvidenceId(req)
    await runAction(req, res, 'resolve', {
      queSeHizo: req.body.queSeHizo,
      causaIdentificada: req.body.causaIdentificada,
      attachmentId,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA') {
      res.status(415).json({ code: 'UNSUPPORTED_MEDIA', message: 'Tipo de archivo no permitido' })
      return
    }
    handleHttpError(res, 'Error al registrar la solución total')
  }
}

export async function confirmarSolucionSolicitud(req: Request, res: Response): Promise<void> {
  await runAction(req, res, 'confirm', {})
}

export async function reabrirSolicitud(req: Request, res: Response): Promise<void> {
  await runAction(req, res, 'reopen', { motivo: req.body.motivo })
}

export async function cancelarSolicitud(req: Request, res: Response): Promise<void> {
  await runAction(req, res, 'cancel', { motivo: req.body.motivo })
}

export async function assignWorkflowV2(req: Request, res: Response): Promise<boolean> {
  const { id } = req.params
  const { tecnico } = req.body
  const solicitud = await solicitudModel.findById(id)
  if (!solicitud) {
    handleHttpError(res, 'Solicitud no encontrada', 404)
    return true
  }

  if (solicitud.workflowVersion !== WORKFLOW_V2) {
    return false
  }

  const tecnicoAsignado = await usuarioModel.findOne({ _id: tecnico, rol: 'tecnico', estado: true })
  if (!tecnicoAsignado) {
    handleHttpError(res, 'Técnico no encontrado o no aprobado', 404)
    return true
  }

  try {
    const result = await applySolicitudWorkflowAction({
      solicitud,
      action: 'assign',
      actor: actorFromRequest(req),
      payload: {
        tecnicoId: String(tecnico),
        operationId: requireClientOperationId(readOperationId(req)),
      },
    })

    if (!result.idempotent) {
      const notificacion = await Notificacion.create({
        usuario: result.solicitud.usuario,
        mensaje: `Tu solicitud #${result.solicitud.codigoCaso} cambió a "Asignado"`,
        tipo: 'estado_ticket',
        ticketId: result.solicitud._id,
        leido: false,
      })
      emitSolicitudUpdate(String(result.solicitud.usuario), result.solicitud)
      emitSolicitudUpdate(String(tecnico), result.solicitud)
      emitNotificacion(String(result.solicitud.usuario), notificacion)
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
        codigoCaso: result.solicitud.codigoCaso,
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
    }

    res.status(200).json({
      message: 'Técnico asignado exitosamente',
      solicitud: toSolicitudDetail(jsonDoc(result.solicitud), actorFromRequest(req)),
    })
    return true
  } catch (error) {
    if (isWorkflowHttpError(error)) {
      sendWorkflowError(res, error)
      return true
    }
    handleHttpError(res, 'Error al asignar técnico')
    return true
  }
}

export function logDeprecatedDelete(req: Request): void {
  logWarn('deprecated_delete_solicitud', {
    endpoint: 'DELETE /api/solicitud/:id',
    solicitudId: req.params.id,
    actorId: String(req.usuario?._id ?? ''),
    actorRol: req.usuario?.rol,
  })
}
