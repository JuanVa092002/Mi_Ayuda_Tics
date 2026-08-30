import { describe, expect, it } from 'vitest';
import { shouldRenderRoleStack } from './role-layout-policy';
import type { AccessResolution } from './session-types';
import type { User } from '@/shared/contracts/user';

const funcionario: User = {
  id: '1',
  fullName: 'Func',
  email: 'f@test.com',
  role: 'funcionario',
  isApproved: true,
};

const tecnico: User = {
  ...funcionario,
  role: 'tecnico',
};

describe('shouldRenderRoleStack', () => {
  it('funcionario solo con allow_funcionario', () => {
    expect(shouldRenderRoleStack({ state: 'allow_funcionario', user: funcionario }, 'funcionario')).toBe(
      true,
    );
    expect(shouldRenderRoleStack({ state: 'allow_tecnico', user: tecnico }, 'funcionario')).toBe(false);
  });

  it('tecnico solo con allow_tecnico', () => {
    expect(shouldRenderRoleStack({ state: 'allow_tecnico', user: tecnico }, 'tecnico')).toBe(true);
    expect(shouldRenderRoleStack({ state: 'allow_funcionario', user: funcionario }, 'tecnico')).toBe(
      false,
    );
  });

  it.each([
    { state: 'guest' },
    { state: 'bootstrapping' },
    { state: 'expired' },
    { state: 'restore_failed', reason: 'network' },
    { state: 'lider_blocked' },
    { state: 'pending_approval' },
  ] satisfies AccessResolution[])('guest y bloqueos no renderizan stacks de rol (%s)', (access) => {
    expect(shouldRenderRoleStack(access, 'funcionario')).toBe(false);
    expect(shouldRenderRoleStack(access, 'tecnico')).toBe(false);
  });
});
