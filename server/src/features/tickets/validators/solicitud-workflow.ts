import { z } from 'zod'
import { handleValidator } from '../../../shared/utils/handleValidator'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'El ID no es válido')
const requiredText = (label: string) => z.string().trim().min(3, `${label} es obligatorio`)

const operationId = z.string().trim().min(8).max(80).optional()

export const asignarTecnicoBodySchema = z.object({
  tecnico: objectId,
  operationId,
})

export const reasignarTecnicoBodySchema = z.object({
  tecnico: objectId,
  motivo: requiredText('El motivo'),
  operationId,
})

export const mensajeBodySchema = z.object({
  mensaje: requiredText('El mensaje'),
  operationId,
})

export const solucionParcialBodySchema = z.object({
  queSeHizo: requiredText('Qué se hizo'),
  queFalta: requiredText('Qué falta'),
  siguienteAccion: requiredText('La siguiente acción'),
  fechaEsperada: z.string().optional(),
  operationId,
})

export const solucionTotalBodySchema = z.object({
  queSeHizo: requiredText('Qué se hizo'),
  causaIdentificada: z.string().trim().optional(),
  operationId,
})

export const motivoBodySchema = z.object({
  motivo: requiredText('El motivo'),
  operationId,
})

export const validarAsignarTecnico = handleValidator(asignarTecnicoBodySchema)
export const validarReasignarTecnico = handleValidator(reasignarTecnicoBodySchema)
export const validarMensajeWorkflow = handleValidator(mensajeBodySchema)
export const validarSolucionParcial = handleValidator(solucionParcialBodySchema)
export const validarSolucionTotal = handleValidator(solucionTotalBodySchema)
export const validarMotivoWorkflow = handleValidator(motivoBodySchema)
