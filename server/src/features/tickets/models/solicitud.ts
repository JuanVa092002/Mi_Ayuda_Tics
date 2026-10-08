import { Schema, model, Model, Types } from 'mongoose'
import { DateTime } from 'luxon'

export const SOLICITUD_ESTADOS = [
  'solicitado',
  'asignado',
  'pendiente',
  'finalizado',
  'nuevo',
  'en_progreso',
  'esperando_usuario',
  'resuelto',
  'cerrado',
  'cancelado',
] as const

export type SolicitudEstado = (typeof SOLICITUD_ESTADOS)[number]

export interface ISolicitud {
  usuario: Types.ObjectId
  ambiente: Types.ObjectId
  tipoCaso: Types.ObjectId
  descripcion: string
  telefono: string
  fecha: Date
  codigoCaso: string
  estado: SolicitudEstado
  workflowVersion?: 1 | 2
  tecnico?: Types.ObjectId
  solucion?: Types.ObjectId
  foto?: Types.ObjectId
  resolvedAt?: Date
  closedAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  proximaAccion?: string
  proximaAccionAt?: Date
  workflowRevision?: number
  lastWorkflowOperationId?: string
  createdAt?: Date
  updatedAt?: Date
}

const solicitudSchema = new Schema<ISolicitud>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    ambiente: {
      type: Schema.Types.ObjectId,
      ref: 'Ambiente',
      required: true,
    },
    tipoCaso: {
      type: Schema.Types.ObjectId,
      ref: 'TipoDeCaso',
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    codigoCaso: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      enum: SOLICITUD_ESTADOS,
      required: true,
      default: 'solicitado',
    },
    workflowVersion: {
      type: Number,
      enum: [1, 2],
      required: false,
    },
    resolvedAt: {
      type: Date,
      required: false,
    },
    closedAt: {
      type: Date,
      required: false,
    },
    cancelledAt: {
      type: Date,
      required: false,
    },
    cancelReason: {
      type: String,
      required: false,
    },
    proximaAccion: {
      type: String,
      required: false,
    },
    proximaAccionAt: {
      type: Date,
      required: false,
    },
    workflowRevision: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    lastWorkflowOperationId: {
      type: String,
      required: false,
    },
    tecnico: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
    solucion: {
      type: Schema.Types.ObjectId,
      ref: 'SolucionCaso',
      required: false,
    },
    foto: {
      type: Schema.Types.ObjectId,
      ref: 'Storage',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ;(ret as { fecha?: Date | string }).fecha = DateTime.fromJSDate(ret.fecha)
          .setLocale('es')
          .toFormat('dd-MM-yyyy HH:mm')
        return ret
      },
    },
  }
)

solicitudSchema.index({ usuario: 1, fecha: -1, _id: -1 })
solicitudSchema.index({ tecnico: 1, estado: 1 })
solicitudSchema.index({ estado: 1, createdAt: -1 })
solicitudSchema.index({ fecha: -1 })
solicitudSchema.index({ tipoCaso: 1 })
solicitudSchema.index({ codigoCaso: 1 }, { unique: true, sparse: true })

const Solicitud = model<ISolicitud, Model<ISolicitud>>('Solicitud', solicitudSchema)
export default Solicitud

