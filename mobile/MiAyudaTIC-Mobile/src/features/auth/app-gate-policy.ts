import { getRouteForAccess, resolveMobileAccess } from './guards';
import type { SessionStatus } from './session-types';

export type AppGateView = 'redirect' | 'welcome' | 'welcome_validating' | 'restore_failed';

/** Vista que debe mostrar AppGate según sesión (sin render RN). */
export function resolveAppGateView(session: SessionStatus): AppGateView {
  const access = resolveMobileAccess(session);

  if (access.state === 'restore_failed') {
    return 'restore_failed';
  }

  const destination = getRouteForAccess(access);
  if (destination) {
    return 'redirect';
  }

  if (session.state === 'bootstrapping') {
    return 'welcome_validating';
  }

  return 'welcome';
}
