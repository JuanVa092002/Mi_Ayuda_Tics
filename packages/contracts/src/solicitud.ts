import { z } from 'zod'

export const solicitudCreateFieldsSchema = z.object({
  ambiente: z.string().regex(/^[0-9a-fA-F]{24}$/),
  tipoCaso: z.string().regex(/^[0-9a-fA-F]{24}$/),
  descripcion: z.string().min(10),
  telefono: z.string().min(1),
  usuario: z.string().regex(/^[0-9a-fA-F]{24}$/),
  fotoId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
})

export const solucionCasoFieldsSchema = z.object({
  descripcionSolucion: z.string().min(5),
  tipoCaso: z.string().regex(/^[0-9a-fA-F]{24}$/),
  tipoSolucion: z.enum(['pendiente', 'finalizado']),
})

export type SolicitudCreateFields = z.infer<typeof solicitudCreateFieldsSchema>
export type SolucionCasoFields = z.infer<typeof solucionCasoFieldsSchema>

export const solicitudWorkflowActionFields = {
  assign: z.object({ tecnico: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
  reassign: z.object({
    tecnico: z.string().regex(/^[0-9a-fA-F]{24}$/),
    motivo: z.string().trim().min(3),
  }),
  message: z.object({ mensaje: z.string().trim().min(3) }),
  partialSolution: z.object({
    queSeHizo: z.string().trim().min(3),
    queFalta: z.string().trim().min(3),
    siguienteAccion: z.string().trim().min(3),
    fechaEsperada: z.string().optional(),
  }),
  totalSolution: z.object({
    queSeHizo: z.string().trim().min(3),
    causaIdentificada: z.string().trim().optional(),
  }),
  motivo: z.object({ motivo: z.string().trim().min(3) }),
}

export const CASE_ROLES = [
  'SOLICITANTE',
  'TECNICO_ASIGNADO',
  'MESA_TIC',
  'UNKNOWN',
] as const

export type CaseRole = (typeof CASE_ROLES)[number]

export const caseRoleSchema = z.enum(CASE_ROLES)

export const historialEventAuthorSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  rol: z.enum(['funcionario', 'lider', 'tecnico']),
})

export type HistorialEventAuthor = z.infer<typeof historialEventAuthorSchema>

export const historialEventRecipientSchema = z.object({
  id: z.string(),
  role: caseRoleSchema,
})

export type HistorialEventRecipient = z.infer<typeof historialEventRecipientSchema>

export const publicHistorialEventContractSchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  createdAt: z.string(),
  author: historialEventAuthorSchema.optional(),
  caseRole: caseRoleSchema,
  recipient: historialEventRecipientSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  attachment: z
    .object({
      id: z.string().optional(),
      url: z.string().optional(),
      filename: z.string().optional(),
    })
    .optional(),
})

export type PublicHistorialEventContract = z.infer<typeof publicHistorialEventContractSchema>
