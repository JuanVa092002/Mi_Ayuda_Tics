import type { AuthSession } from '@/shared/contracts/auth';
import type { User } from '@/shared/contracts/user';
import { clearSessionSnapshot, saveSessionSnapshot } from '@/shared/storage/session';
import { clearToken, getToken, setToken } from '@/shared/storage/token';
import {
  ApiError,
  isInactiveAccountMessage,
  isPendingTechnicianMessage,
  isUnauthorizedError,
} from '@/shared/api/errors';
import { setUnauthorizedHandler } from '@/shared/api/client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  resetPasswordRequest,
  verifySessionRequest,
} from './api';
import { accessForAuthSession, resolveMobileAccess } from './guards';
import { resolveMobilePersistDecision } from './session-policy';
import type {
  AccessResolution,
  LoginResult,
  RegisterInput,
  RegisterResult,
  SessionStatus,
} from './session-types';
import { registerDeviceForPush, unregisterDeviceForPush } from '@/shared/notifications';
import { clearAuthenticatedSessionMedia } from '@/shared/media/authenticated-media-cache';
import { clearAllWorkflowAttemptKeys } from '@/shared/api/workflow-idempotency';
import { clearSolicitudFormDraft } from '@/features/solicitudes/solicitud-form-draft';
import {
  resolveBackgroundRevalidateFailure,
  resolveBootstrapFailure,
  shouldRevalidateOnForeground,
} from './bootstrap-session-policy';

export type { RegisterInput, LoginResult, RegisterResult, SessionStatus, AccessResolution };

const LIDER_BLOCK_MESSAGE =
  'El rol Líder TIC debe usar la versión web. Esta app es para funcionarios y técnicos.';

const PENDING_APPROVAL_MESSAGE =
  'Su registro se encuentra sujeto a aprobación por parte del Líder TIC. Una vez sea aprobado, podrá ingresar al sistema.';

type CommitMobileSessionResult =
  | { committed: true; access: AccessResolution }
  | { committed: false; access: AccessResolution };

interface AuthContextValue {
  session: SessionStatus;
  access: AccessResolution;
  user: User | null;
  token: string | null;
  bootstrapSession: () => Promise<void>;
  login: (correo: string, password: string) => Promise<LoginResult>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  forgotPassword: (correo: string) => Promise<string>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<string>;
  markSessionExpired: () => Promise<void>;
  resetToGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(session: AuthSession): Promise<void> {
  await setToken(session.token);
  await saveSessionSnapshot({ userId: session.user.id, role: session.user.role });
}

async function wipeSession(): Promise<void> {
  await clearToken();
  await clearSessionSnapshot();
  await unregisterDeviceForPush();
  clearAuthenticatedSessionMedia();
  clearSolicitudFormDraft();
  clearAllWorkflowAttemptKeys();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionStatus>({ state: 'guest' });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const access = useMemo(() => resolveMobileAccess(session), [session]);

  const user = session.state === 'authenticated' ? session.session.user : null;
  const token = session.state === 'authenticated' ? session.session.token : null;

  const markSessionExpired = useCallback(async () => {
    await wipeSession();
    setSession({ state: 'expired' });
  }, []);

  const resetToGuest = useCallback(async () => {
    await wipeSession();
    setSession({ state: 'guest' });
  }, []);

  const commitMobileSession = useCallback(
    async (authSession: AuthSession): Promise<CommitMobileSessionResult> => {
      const decision = resolveMobilePersistDecision(authSession.user);

      if (!decision.persist) {
        await wipeSession();

        if (decision.access.state === 'lider_blocked') {
          setSession({ state: 'access_blocked', reason: 'lider_blocked' });
        } else if (decision.access.state === 'pending_approval') {
          setSession({
            state: 'access_blocked',
            reason: 'pending_approval',
            message: PENDING_APPROVAL_MESSAGE,
          });
        } else {
          setSession({ state: 'guest' });
        }

        return { committed: false, access: decision.access };
      }

      await persistSession(authSession);
      setSession({ state: 'authenticated', session: authSession });
      void registerDeviceForPush('', authSession.token);
      return { committed: true, access: accessForAuthSession(authSession) };
    },
    [],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void markSessionExpired();
    });
    return () => setUnauthorizedHandler(null);
  }, [markSessionExpired]);

  const bootstrapSession = useCallback(async () => {
    const storedToken = await getToken();
    if (!storedToken) {
      setSession({ state: 'guest' });
      return;
    }

    setSession({ state: 'bootstrapping' });

    try {
      const verifiedUser = await verifySessionRequest(storedToken);
      const nextSession: AuthSession = { token: storedToken, user: verifiedUser };
      await commitMobileSession(nextSession);
    } catch (error) {
      const outcome = resolveBootstrapFailure(error);

      if (outcome.kind === 'expired') {
        await wipeSession();
        setSession({ state: 'expired' });
        return;
      }

      if (outcome.kind === 'restore_failed') {
        setSession(outcome.session);
        return;
      }

      await wipeSession();
      setSession({ state: 'guest' });
    }
  }, [commitMobileSession]);

  const revalidateSessionInBackground = useCallback(async () => {
    const current = sessionRef.current;
    if (!shouldRevalidateOnForeground(current)) {
      return;
    }

    const activeToken = current.session.token;

    try {
      const verifiedUser = await verifySessionRequest(activeToken);
      const nextSession: AuthSession = { token: activeToken, user: verifiedUser };
      await commitMobileSession(nextSession);
    } catch (error) {
      const outcome = resolveBackgroundRevalidateFailure(error);

      if (outcome === 'expired') {
        await markSessionExpired();
        return;
      }

      if (outcome === 'guest') {
        await wipeSession();
        setSession({ state: 'guest' });
        return;
      }

      // Red / timeout / 5xx: conservar sesión y navegación actual.
    }
  }, [commitMobileSession, markSessionExpired]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void revalidateSessionInBackground();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [revalidateSessionInBackground]);

  const login = useCallback(
    async (correo: string, password: string): Promise<LoginResult> => {
      try {
        const authSession = await loginRequest(correo, password);
        const result = await commitMobileSession(authSession);

        if (!result.committed) {
          if (result.access.state === 'lider_blocked') {
            return { ok: false, kind: 'lider', message: LIDER_BLOCK_MESSAGE };
          }
          if (result.access.state === 'pending_approval') {
            return {
              ok: false,
              kind: 'pending_approval',
              message: PENDING_APPROVAL_MESSAGE,
            };
          }
          return {
            ok: false,
            kind: 'network',
            message: 'No se pudo completar el inicio de sesión.',
          };
        }

        clearSolicitudFormDraft();
        return { ok: true, access: result.access };
      } catch (error) {
        if (error instanceof ApiError) {
          if (isUnauthorizedError(error)) {
            return {
              ok: false,
              kind: 'invalid_credentials',
              message: error.message,
              code: error.code,
            };
          }
          if (error.code === 'FORBIDDEN') {
            if (isPendingTechnicianMessage(error.message)) {
              return {
                ok: false,
                kind: 'pending_approval',
                message: error.message,
                code: error.code,
              };
            }
            if (isInactiveAccountMessage(error.message)) {
              return { ok: false, kind: 'inactive', message: error.message, code: error.code };
            }
          }
          return { ok: false, kind: 'network', message: error.message, code: error.code };
        }
        return {
          ok: false,
          kind: 'network',
          message: 'No se pudo iniciar sesión. Intenta de nuevo.',
        };
      }
    },
    [commitMobileSession],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<RegisterResult> => {
      try {
        const response = await registerRequest(input);

        if (response.kind === 'tecnico_pending') {
          await resetToGuest();
          return { ok: true, kind: 'tecnico_pending', message: response.message };
        }

        if (response.session.user.role !== 'funcionario') {
          await wipeSession();
          return {
            ok: false,
            message: 'Solo funcionarios pueden iniciar sesión automáticamente tras el registro.',
          };
        }

        const result = await commitMobileSession(response.session);
        if (!result.committed) {
          return {
            ok: false,
            message: 'No se pudo iniciar sesión automáticamente tras el registro.',
          };
        }

        clearSolicitudFormDraft();
        return {
          ok: true,
          kind: 'funcionario_autologin',
          access: result.access,
        };
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'No se pudo completar el registro.';
        return { ok: false, message };
      }
    },
    [commitMobileSession, resetToGuest],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // limpiar sesión local aunque falle el servidor
      }
    }
    await resetToGuest();
  }, [resetToGuest, token]);

  const forgotPassword = useCallback(async (correo: string) => {
    const response = await forgotPasswordRequest(correo);
    return response.message;
  }, []);

  const resetPassword = useCallback(
    async (resetToken: string, password: string, confirmPassword: string) => {
      const response = await resetPasswordRequest(resetToken, password, confirmPassword);
      return response.message;
    },
    [],
  );

  const value = useMemo(
    () => ({
      session,
      access,
      user,
      token,
      bootstrapSession,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      markSessionExpired,
      resetToGuest,
    }),
    [
      session,
      access,
      user,
      token,
      bootstrapSession,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      markSessionExpired,
      resetToGuest,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
