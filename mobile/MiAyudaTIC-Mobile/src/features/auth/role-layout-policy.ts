import {
  canAccessFuncionarioStack,
  canAccessTecnicoStack,
} from '@/features/auth/guards';
import type { AccessResolution } from '@/features/auth/session-types';

export type RoleStack = 'funcionario' | 'tecnico';

/**
 * Role group layouts must not `<Redirect href="/" />`.
 * AppGate (`app/index.tsx`) is the only owner of guest / bootstrap / restore
 * destinations. `Stack.Protected` at root unmounts the role screen so this
 * layout is not left focused dispatching replace() on every navigator update.
 */
export function shouldRenderRoleStack(access: AccessResolution, role: RoleStack): boolean {
  return role === 'funcionario'
    ? canAccessFuncionarioStack(access)
    : canAccessTecnicoStack(access);
}
