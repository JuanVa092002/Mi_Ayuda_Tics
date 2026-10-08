import { describe, expect, it } from 'vitest';
import type { User } from '@/shared/contracts/user';
import {
  getMobileAccessBlock,
  resolveMobilePersistDecision,
  shouldPersistMobileSession,
} from './session-policy';

const funcionario: User = {
  id: '1',
  fullName: 'Func',
  email: 'f@test.com',
  role: 'funcionario',
  isApproved: true,
};

const tecnicoAprobado: User = {
  id: '2',
  fullName: 'Tec',
  email: 't@test.com',
  role: 'tecnico',
  isApproved: true,
};

const tecnicoPendiente: User = {
  id: '3',
  fullName: 'Tec Pend',
  email: 'tp@test.com',
  role: 'tecnico',
  isApproved: false,
};

const lider: User = {
  id: '4',
  fullName: 'Lider',
  email: 'l@test.com',
  role: 'lider',
  isApproved: true,
};

describe('shouldPersistMobileSession', () => {
  it('funcionario persiste', () => {
    expect(shouldPersistMobileSession(funcionario)).toBe(true);
  });

  it('técnico aprobado persiste', () => {
    expect(shouldPersistMobileSession(tecnicoAprobado)).toBe(true);
  });

  it('técnico pendiente no persiste', () => {
    expect(shouldPersistMobileSession(tecnicoPendiente)).toBe(false);
  });

  it('líder no persiste', () => {
    expect(shouldPersistMobileSession(lider)).toBe(false);
  });
});

describe('resolveMobilePersistDecision', () => {
  it('bootstrap verify 200 + líder no persiste', () => {
    const decision = resolveMobilePersistDecision(lider);
    expect(decision).toEqual({ persist: false, access: { state: 'lider_blocked' } });
  });

  it('bootstrap verify 200 + técnico pendiente no persiste', () => {
    const decision = resolveMobilePersistDecision(tecnicoPendiente);
    expect(decision).toEqual({ persist: false, access: { state: 'pending_approval' } });
  });

  it('funcionario y técnico aprobado persisten', () => {
    expect(resolveMobilePersistDecision(funcionario)).toEqual({ persist: true });
    expect(resolveMobilePersistDecision(tecnicoAprobado)).toEqual({ persist: true });
  });
});

describe('getMobileAccessBlock', () => {
  it('devuelve bloqueo correcto por rol', () => {
    expect(getMobileAccessBlock(lider)).toEqual({ state: 'lider_blocked' });
    expect(getMobileAccessBlock(tecnicoPendiente)).toEqual({ state: 'pending_approval' });
    expect(getMobileAccessBlock(funcionario)).toBeNull();
  });
});
