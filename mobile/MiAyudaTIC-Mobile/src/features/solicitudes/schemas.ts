import { z } from 'zod';

export const createSolicitudSchema = z.object({
  environmentId: z.string().min(1, 'Selecciona un ambiente'),
  caseTypeId: z.string().min(1, 'Selecciona un tipo de caso'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
});

export type CreateSolicitudFormValues = z.infer<typeof createSolicitudSchema>;
