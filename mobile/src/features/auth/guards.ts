import type { Href } from 'expo-router';
import type { AuthSession } from '@/shared/contracts/auth';
import type { AccessResolution, RestoreFailedReason, SessionStatus } from './session-types';

export function resolveMobileAccess(session: SessionStatus): AccessResolution {
  if (session.state === 'bootstrapping') {
    return { state: 'bootstrapping' };
  }
  if (session.state === 'guest') {
    return { state: 'guest' };
  }
  if (session.state === 'expired') {
    return { state: 'expired' };
  }
  if (session.state === 'restore_failed') {
    return { state: 'restore_failed', reason: session.reason };
  }
  if (session.state === 'access_blocked') {
    if (session.reason === 'lider_blocked') {
      return { state: 'lider_blocked' };
    }
    return { state: 'pending_approval', message: session.message };
  }

  const { user } = session.session;

  if (user.role === 'lider') {
    return { state: 'lider_blocked' };
  }

  if (user.role === 'tecnico' && !user.isApproved) {
    return { state: 'pending_approval' };
  }

  if (user.role === 'funcionario') {
    return { state: 'allow_funcionario', user };
  }

  if (user.role === 'tecnico') {
    return { state: 'allow_tecnico', user };
  }

  return { state: 'guest' };
}

export function accessForAuthSession(session: AuthSession): AccessResolution {
  return resolveMobileAccess({ state: 'authenticated', session });
}

export function getRouteForAccess(access: AccessResolution): Href | null {
  switch (access.state) {
    case 'bootstrapping':
    case 'guest':
    case 'restore_failed':
      return null;
    case 'expired':
      return '/(auth)/session-expired';
    case 'lider_blocked':
      return '/(auth)/lider-not-supported';
    case 'pending_approval':
      return '/(auth)/pending-approval';
    case 'allow_funcionario':
      return '/(funcionario)/(tabs)/(home)';
    case 'allow_tecnico':
      return '/(tecnico)/home';
    default:
      return null;
  }
}

export function getRestoreFailedMessage(reason: RestoreFailedReason): {
  title: string;
  message: string;
} {
  switch (reason) {
    case 'timeout':
      return {
        title: 'Tiempo de espera agotado',
        message:
          'No pudimos validar tu sesión a tiempo. Revisa tu conexión e intenta de nuevo.',
      };
    case 'server':
      return {
        title: 'Servidor no disponible',
        message:
          'El servidor no respondió correctamente. Tu sesión sigue guardada; intenta de nuevo en unos momentos.',
      };
    default:
      return {
        title: 'Sin conexión',
        message:
          'No se pudo conectar al servidor. Tu sesión sigue guardada; verifica tu red e intenta de nuevo.',
      };
  }
}

export function isPublicAuthRoute(segment: string): boolean {
  return [
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'pending-approval',
    'lider-not-supported',
    'session-expired',
  ].includes(segment);
}

export function canAccessFuncionarioStack(access: AccessResolution): boolean {
  return access.state === 'allow_funcionario';
}

export function canAccessTecnicoStack(access: AccessResolution): boolean {
  return access.state === 'allow_tecnico';
}
