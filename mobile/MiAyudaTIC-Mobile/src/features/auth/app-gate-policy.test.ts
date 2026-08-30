import { describe, expect, it } from 'vitest';
import { resolveAppGateView } from './app-gate-policy';
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

describe('resolveAppGateView', () => {
  it('guest muestra welcome sin loader bloqueante', () => {
    expect(resolveAppGateView({ state: 'guest' })).toBe('welcome');
  });

  it('bootstrapping muestra welcome con banner de validación', () => {
    expect(resolveAppGateView({ state: 'bootstrapping' })).toBe('welcome_validating');
  });

  it('restore_failed muestra pantalla de reintento', () => {
    expect(resolveAppGateView({ state: 'restore_failed', reason: 'timeout' })).toBe(
      'restore_failed',
    );
  });

  it('sesión válida redirige al stack correcto', () => {
    expect(
      resolveAppGateView({ state: 'authenticated', session: funcionarioSession }),
    ).toBe('redirect');
  });

  it('no queda en loading infinito: bootstrapping siempre tiene vista útil', () => {
    const view = resolveAppGateView({ state: 'bootstrapping' });
    expect(['welcome_validating', 'redirect', 'restore_failed']).toContain(view);
    expect(view).not.toBe('redirect');
  });
});
