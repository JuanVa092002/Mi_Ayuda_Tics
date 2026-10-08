import { z } from 'zod'
import { handleValidator } from '../../../shared/utils/handleValidator'

export const tipoCasoBodySchema = z.object({
  nombre: z.string().trim().min(3, 'El nombre del tipo de caso debe tener al menos 3 caracteres').max(100, 'Nombre demasiado largo'),
  descripcion: z.string().trim().min(3, 'La descripción debe tener al menos 3 caracteres').max(500, 'Descripción demasiado larga'),
})

export const tipoCasoUpdateSchema = z.object({
  nombre: z.string().trim().min(3, 'El nombre del tipo de caso debe tener al menos 3 caracteres').max(100, 'Nombre demasiado largo').optional(),
  descripcion: z.string().trim().min(3, 'La descripción debe tener al menos 3 caracteres').max(500, 'Descripción demasiado larga').optional(),
})

export const validarCrearTipoCaso = handleValidator(tipoCasoBodySchema)
export const validarActualizarTipoCaso = handleValidator(tipoCasoUpdateSchema)
