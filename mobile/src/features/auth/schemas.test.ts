import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, resetPasswordSchema } from './schemas';

describe('forgotPasswordSchema', () => {
  it('acepta correo válido', () => {
    const result = forgotPasswordSchema.safeParse({ correo: 'user@sena.edu.co' });
    expect(result.success).toBe(true);
  });

  it('rechaza correo inválido', () => {
    const result = forgotPasswordSchema.safeParse({ correo: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('acepta contraseña válida y coincidencia', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Segura12',
      confirmPassword: 'Segura12',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza contraseña corta', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Ab1',
      confirmPassword: 'Ab1',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza sin número', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza mismatch', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Segura12',
      confirmPassword: 'Segura13',
    });
    expect(result.success).toBe(false);
  });
});
