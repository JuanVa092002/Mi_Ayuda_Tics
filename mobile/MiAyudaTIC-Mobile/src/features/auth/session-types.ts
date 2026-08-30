import type { AuthSession } from '@/shared/contracts/auth';
import type { User } from '@/shared/contracts/user';

export type RestoreFailedReason = 'network' | 'timeout' | 'server';

export type MobileAccessBlockReason = 'lider_blocked' | 'pending_approval';

export type SessionStatus =
  | { state: 'bootstrapping' }
  | { state: 'guest' }
  | { state: 'authenticated'; session: AuthSession }
  | { state: 'expired' }
  | { state: 'restore_failed'; reason: RestoreFailedReason }
  | { state: 'access_blocked'; reason: MobileAccessBlockReason; message?: string };

export type AccessResolution =
  | { state: 'bootstrapping' }
  | { state: 'guest' }
  | { state: 'expired' }
  | { state: 'restore_failed'; reason: RestoreFailedReason }
  | { state: 'allow_funcionario'; user: User }
  | { state: 'allow_tecnico'; user: User }
  | { state: 'pending_approval'; message?: string }
  | { state: 'lider_blocked' };

export type RegisterInput = {
  nombre: string;
  correo: string;
  rol: 'funcionario' | 'tecnico';
  telefono: string;
  password: string;
  confirmPassword: string;
  fotoUri?: string | null;
};

export type LoginResult =
  | { ok: true; access: AccessResolution }
  | {
      ok: false;
      kind: 'invalid_credentials' | 'pending_approval' | 'inactive' | 'lider' | 'network';
      message: string;
    };

export type RegisterResult =
  | { ok: true; kind: 'funcionario_autologin'; access: AccessResolution }
  | { ok: true; kind: 'tecnico_pending'; message: string }
  | { ok: false; message: string };
