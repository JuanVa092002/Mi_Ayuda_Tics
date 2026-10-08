import { z } from 'zod';

const passwordRule = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
    'La contraseña debe contener al menos una letra y un número',
  );

export const loginSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  password: passwordRule,
});

export const registerSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    correo: z.string().email('Correo electrónico inválido'),
    rol: z.enum(['funcionario', 'tecnico'], { message: 'Selecciona un rol válido' }),
    telefono: z
      .string()
      .min(1, 'El teléfono es requerido')
      .regex(/^\d+$/, 'El teléfono debe contener solo números'),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
        'La contraseña debe contener al menos una letra y un número',
      ),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
