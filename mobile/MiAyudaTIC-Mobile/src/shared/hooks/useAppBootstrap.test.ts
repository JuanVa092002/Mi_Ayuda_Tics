import { describe, expect, it } from 'vitest';
import type { SessionStatus } from '@/features/auth/session-types';

function deriveBootstrapFlags(session: SessionStatus) {
  return {
    isBootstrapping: session.state === 'bootstrapping',
    isValidatingSession: session.state === 'bootstrapping',
    isRestoreFailed: session.state === 'restore_failed',
  };
}

describe('useAppBootstrap flags', () => {
  it('sin token (guest) no valida sesión', () => {
    expect(deriveBootstrapFlags({ state: 'guest' })).toEqual({
      isBootstrapping: false,
      isValidatingSession: false,
      isRestoreFailed: false,
    });
  });

  it('bootstrapping expone isValidatingSession', () => {
    expect(deriveBootstrapFlags({ state: 'bootstrapping' })).toEqual({
      isBootstrapping: true,
      isValidatingSession: true,
      isRestoreFailed: false,
    });
  });

  it('restore_failed expone bandera de error recuperable', () => {
    expect(deriveBootstrapFlags({ state: 'restore_failed', reason: 'network' })).toEqual({
      isBootstrapping: false,
      isValidatingSession: false,
      isRestoreFailed: true,
    });
  });
});
