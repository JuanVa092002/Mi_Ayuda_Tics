import { describe, expect, it } from 'vitest';
import { mapUserDto, isMobileAllowedUser } from './user';

describe('mapUserDto', () => {
  it('mapea campos del backend al dominio', () => {
    const user = mapUserDto({
      _id: 'abc123',
      nombre: 'Ana Pérez',
      correo: 'ana@test.com',
      rol: 'funcionario',
      telefono: '3001234567',
    });

    expect(user).toEqual({
      id: 'abc123',
      fullName: 'Ana Pérez',
      email: 'ana@test.com',
      role: 'funcionario',
      isApproved: true,
      telefono: '3001234567',
      photoUrl: undefined,
    });
  });

  it('marca técnico no aprobado con isApproved false', () => {
    const user = mapUserDto({
      _id: 't1',
      nombre: 'Técnico',
      correo: 'tec@test.com',
      rol: 'tecnico',
      estado: false,
    });

    expect(user.isApproved).toBe(false);
    expect(isMobileAllowedUser(user)).toBe(false);
  });

  it('marca técnico aprobado como permitido en mobile', () => {
    const user = mapUserDto({
      _id: 't2',
      nombre: 'Técnico OK',
      correo: 'tec2@test.com',
      rol: 'tecnico',
      estado: true,
    });

    expect(user.isApproved).toBe(true);
    expect(isMobileAllowedUser(user)).toBe(true);
  });
});
