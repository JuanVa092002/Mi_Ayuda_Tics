import { router } from 'expo-router';
import type { AccessResolution } from './session-types';
import { getRouteForAccess } from './guards';

export function navigateForAccess(
  access: AccessResolution,
  options: { replace?: boolean; pendingMessage?: string } = {},
): boolean {
  const route = getRouteForAccess(access);
  if (!route) {
    return false;
  }

  const { replace = false, pendingMessage } = options;

  if (access.state === 'pending_approval' && pendingMessage) {
    const href = {
      pathname: '/(auth)/pending-approval' as const,
      params: { message: pendingMessage },
    };
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
    return true;
  }

  if (replace) {
    router.replace(route);
  } else {
    router.push(route);
  }
  return true;
}
