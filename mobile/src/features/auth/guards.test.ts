import { describe, expect, it } from 'vitest';
import {
  accessForAuthSession,
  canAccessFuncionarioStack,
  canAccessTecnicoStack,
  getRouteForAccess,
  resolveMobileAccess,
} from './guards';
import type { AuthSession } from '@/shared/contracts/auth';

const funcionarioSession: AuthSession = {
  token: 'tok',
  user: {
    id: '1',
    fullName: 'Func',
    email: 'f@test.com',
    role: 'funcionario',
    isApproved: true,
  },
};

describe('resolveMobileAccess', () => {
  it('resuelve guest y expired', () => {
    expect(resolveMobileAccess({ state: 'guest' })).toEqual({ state: 'guest' });
    expect(resolveMobileAccess({ state: 'expired' })).toEqual({ state: 'expired' });
  });

  it('resuelve restore_failed', () => {
    expect(resolveMobileAccess({ state: 'restore_failed', reason: 'network' })).toEqual({
      state: 'restore_failed',
      reason: 'network',
    });
  });

  it('permite funcionario autenticado', () => {
    const access = accessForAuthSession(funcionarioSession);
    expect(access.state).toBe('allow_funcionario');
    expect(getRouteForAccess(access)).toBe('/(funcionario)/(tabs)/(home)');
  });

  it('bloquea líder sin requerir sesión autenticada persistida', () => {
    const access = resolveMobileAccess({
      state: 'authenticated',
      session: {
        ...funcionarioSession,
        user: { ...funcionarioSession.user, role: 'lider' },
      },
    });
    expect(access.state).toBe('lider_blocked');
    expect(getRouteForAccess(access)).toBe('/(auth)/lider-not-supported');
  });

  it('no expone ruta para restore_failed (permanece en AppGate)', () => {
    expect(getRouteForAccess({ state: 'restore_failed', reason: 'timeout' })).toBeNull();
  });

  it('no expone ruta durante bootstrapping (welcome + banner en AppGate)', () => {
    expect(getRouteForAccess({ state: 'bootstrapping' })).toBeNull();
  });

  it('access_blocked líder redirige sin sesión autenticada', () => {
    const access = resolveMobileAccess({ state: 'access_blocked', reason: 'lider_blocked' });
    expect(access.state).toBe('lider_blocked');
    expect(getRouteForAccess(access)).toBe('/(auth)/lider-not-supported');
  });

  it('access_blocked técnico pendiente redirige sin sesión autenticada', () => {
    const access = resolveMobileAccess({
      state: 'access_blocked',
      reason: 'pending_approval',
      message: 'Pendiente',
    });
    expect(access.state).toBe('pending_approval');
    expect(getRouteForAccess(access)).toBe('/(auth)/pending-approval');
  });
});

describe('stack guards (rutas privadas)', () => {
  it('funcionario stack solo con allow_funcionario', () => {
    const funcionario = accessForAuthSession(funcionarioSession);
    expect(canAccessFuncionarioStack(funcionario)).toBe(true);
    expect(canAccessTecnicoStack(funcionario)).toBe(false);
  });

  it('tecnico stack solo con allow_tecnico aprobado', () => {
    const tecnico = accessForAuthSession({
      ...funcionarioSession,
      user: { ...funcionarioSession.user, role: 'tecnico', isApproved: true },
    });
    expect(canAccessTecnicoStack(tecnico)).toBe(true);
    expect(canAccessFuncionarioStack(tecnico)).toBe(false);
  });

  it('guest no accede a stacks privados', () => {
    expect(canAccessFuncionarioStack({ state: 'guest' })).toBe(false);
    expect(canAccessTecnicoStack({ state: 'guest' })).toBe(false);
  });
});
