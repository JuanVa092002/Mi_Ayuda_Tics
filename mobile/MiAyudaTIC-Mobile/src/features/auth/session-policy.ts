import { isMobileAllowedUser, type User } from '@/shared/contracts/user';
import type { AccessResolution } from './session-types';

export type MobilePersistDecision =
  | { persist: true }
  | { persist: false; access: AccessResolution };

/**
 * Invariant: solo usuarios mobile-allowed pueden persistir token y sesión local.
 */
export function shouldPersistMobileSession(user: User): boolean {
  return isMobileAllowedUser(user);
}

export function getMobileAccessBlock(
  user: User,
): Extract<AccessResolution, { state: 'lider_blocked' | 'pending_approval' }> | null {
  if (user.role === 'lider') {
    return { state: 'lider_blocked' };
  }
  if (user.role === 'tecnico' && !user.isApproved) {
    return { state: 'pending_approval' };
  }
  return null;
}

export function resolveMobilePersistDecision(user: User): MobilePersistDecision {
  if (shouldPersistMobileSession(user)) {
    return { persist: true };
  }

  const block = getMobileAccessBlock(user);
  if (block) {
    return { persist: false, access: block };
  }

  return { persist: false, access: { state: 'guest' } };
}
