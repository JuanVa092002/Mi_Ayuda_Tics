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
