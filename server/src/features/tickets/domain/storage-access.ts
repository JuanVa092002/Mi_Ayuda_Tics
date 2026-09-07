import { Types } from 'mongoose'
import { entityIdsEqual } from '../../../shared/utils/entity-id'
import { isDefaultAvatar } from '../../../shared/constants/media'
import HistorialSolicitud from '../models/historialSolicitud'
import Solicitud from '../models/solicitud'
import SolucionCaso from '../models/solucionCaso'
import Usuario from '../../users/models/usuarios'
import type { ActorRole } from './solicitud-lifecycle'

export type StorageActor = {
  id: string
  rol: ActorRole
}

function isValidStorageId(storageId: string): boolean {
  return Types.ObjectId.isValid(storageId) && String(new Types.ObjectId(storageId)) === storageId
}

async function findLinkedTicket(storageObjectId: Types.ObjectId) {
  const historial = await HistorialSolicitud.findOne({ attachment: storageObjectId })
    .select('solicitud')
    .lean()
  const solucion = await SolucionCaso.findOne({ evidencia: storageObjectId }).select('solicitud').lean()

  const ticketQuery: Record<string, unknown>[] = [{ foto: storageObjectId }]
  if (historial?.solicitud) ticketQuery.push({ _id: historial.solicitud })
  if (solucion?.solicitud) ticketQuery.push({ _id: solucion.solicitud })

  return Solicitud.findOne({ $or: ticketQuery }).select('usuario tecnico').lean()
}

function canViewLinkedTicket(
  actor: StorageActor,
  ticket: { usuario?: unknown; tecnico?: unknown },
): boolean {
  if (actor.rol === 'lider') return true
  if (actor.rol === 'funcionario') return entityIdsEqual(ticket.usuario, actor.id)
  if (actor.rol === 'tecnico') return entityIdsEqual(ticket.tecnico, actor.id)
  return false
}

/**
 * Access is based on current ticket linkage, not file authorship.
 * A valid ObjectId or filename alone never grants ticket evidence access.
 */
export async function actorCanAccessStorage(
  actor: StorageActor,
  storageId: string,
  filename?: string,
): Promise<boolean> {
  if (filename && isDefaultAvatar(filename)) return true
  if (!isValidStorageId(storageId)) return false

  const idFilter = new Types.ObjectId(storageId)
  const ticket = await findLinkedTicket(idFilter)
  if (ticket) return canViewLinkedTicket(actor, ticket)

  const ownAvatar = await Usuario.exists({ _id: actor.id, foto: idFilter })
  return Boolean(ownAvatar)
}
