import { z } from 'zod'
import { handleValidator } from '../../../shared/utils/handleValidator'

export const ambienteBodySchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del ambiente debe tener al menos 2 caracteres').max(100, 'Nombre demasiado largo'),
  sede: z.string().trim().max(100).optional(),
  activo: z.boolean().optional(),
})

export const ambienteUpdateSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del ambiente debe tener al menos 2 caracteres').max(100, 'Nombre demasiado largo').optional(),
  sede: z.string().trim().max(100).optional(),
  activo: z.boolean().optional(),
})

export const validarCrearAmbiente = handleValidator(ambienteBodySchema)
export const validarActualizarAmbiente = handleValidator(ambienteUpdateSchema)
