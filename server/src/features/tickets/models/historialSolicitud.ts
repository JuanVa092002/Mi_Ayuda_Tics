import { Schema, model, Model, Types } from 'mongoose'

export const HISTORIAL_EVENT_TYPES = [
  'created',
  'assigned',
  'reassigned',
  'started',
  'updated',
  'waiting_for_requester',
  'partial_solution',
  'resolved',
  'reopened',
  'closed',
  'cancelled',
] as const

export type HistorialEventType = (typeof HISTORIAL_EVENT_TYPES)[number]

export interface IHistorialSolicitud {
  solicitud: Types.ObjectId
  type: HistorialEventType
  author?: Types.ObjectId
  message: string
  metadata?: {
    previousStatus?: string
    nextStatus?: string
    assignedTechnicianId?: string
    previousTechnicianId?: string
    resolutionType?: 'partial' | 'total'
    nextAction?: string
    nextActionAt?: Date | null
    pendingWork?: string
    whatWasDone?: string
    reason?: string
    identifiedCause?: string
  }
  attachment?: Types.ObjectId
  operationId?: string
  actionType?: string
  payloadHash?: string
  createdAt?: Date
  updatedAt?: Date
}

const historialSolicitudSchema = new Schema<IHistorialSolicitud>(
  {
    solicitud: {
      type: Schema.Types.ObjectId,
      ref: 'Solicitud',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: HISTORIAL_EVENT_TYPES,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      previousStatus: String,
      nextStatus: String,
      assignedTechnicianId: String,
      previousTechnicianId: String,
      resolutionType: { type: String, enum: ['partial', 'total'] },
      nextAction: String,
      nextActionAt: Date,
      pendingWork: String,
      whatWasDone: String,
      reason: String,
      identifiedCause: String,
    },
    attachment: {
      type: Schema.Types.ObjectId,
      ref: 'Storage',
      required: false,
    },
    operationId: {
      type: String,
      required: false,
    },
    actionType: {
      type: String,
      required: false,
    },
    payloadHash: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

historialSolicitudSchema.index({ solicitud: 1, createdAt: 1 })
/**
 * Unique `{ solicitud, operationId }` is NOT declared here.
 * Mongoose autoIndex would create it on boot in every environment, including production.
 * Created only by `migrate:historial-operation-id` as `uniq_historial_solicitud_operationId`.
 */

const HistorialSolicitud = model<IHistorialSolicitud, Model<IHistorialSolicitud>>(
  'HistorialSolicitud',
  historialSolicitudSchema
)

export default HistorialSolicitud
