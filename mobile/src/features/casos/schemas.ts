import { z } from 'zod';

export const resolveCasoSchema = z.object({
  caseTypeId: z.string().min(1, 'Selecciona un tipo de caso'),
  solutionDescription: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres'),
  solutionType: z.enum(['pendiente', 'finalizado'], {
    message: 'Selecciona el tipo de solución',
  }),
});

export type ResolveCasoFormValues = z.infer<typeof resolveCasoSchema>;
