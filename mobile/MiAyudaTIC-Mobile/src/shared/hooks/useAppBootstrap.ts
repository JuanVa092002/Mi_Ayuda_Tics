import { useAuth } from '@/features/auth/auth-context';
import { getRouteForAccess } from '@/features/auth/guards';

/**
 * Hook de arranque: expone sesión, acceso resuelto y ruta destino del AppGate.
 */
export function useAppBootstrap() {
  const { session, access, bootstrapSession } = useAuth();
  const destination = getRouteForAccess(access);

  return {
    session,
    access,
    destination,
    isBootstrapping: session.state === 'bootstrapping',
    isValidatingSession: session.state === 'bootstrapping',
    isRestoreFailed: session.state === 'restore_failed',
    bootstrapSession,
  };
}
