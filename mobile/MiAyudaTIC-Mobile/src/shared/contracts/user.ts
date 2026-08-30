export type AppRole = 'funcionario' | 'tecnico' | 'lider';

export type UserDto = {
  _id: string;
  nombre: string;
  correo: string;
  rol: string;
  telefono?: string;
  activo?: boolean;
  estado?: boolean;
  foto?: { url?: string; filename?: string } | string | null;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  /** Técnico: aprobado por líder (`estado`). Funcionario: cuenta activa. */
  isApproved: boolean;
  telefono?: string;
  photoUrl?: string;
};

const MOBILE_ROLES: AppRole[] = ['funcionario', 'tecnico', 'lider'];

export function normalizeRole(raw: string): AppRole {
  const normalized = raw.toLowerCase() as AppRole;
  if (!MOBILE_ROLES.includes(normalized)) {
    throw new Error(`Rol no soportado: ${raw}`);
  }
  return normalized;
}

export function mapUserDto(dto: UserDto): User {
  const role = normalizeRole(dto.rol);
  const photoUrl =
    typeof dto.foto === 'object' && dto.foto !== null ? dto.foto.url : undefined;

  const isApproved =
    role === 'tecnico'
      ? dto.estado === true
      : dto.activo !== false && dto.estado !== false;

  return {
    id: dto._id,
    fullName: dto.nombre,
    email: dto.correo,
    role,
    isApproved,
    telefono: dto.telefono,
    photoUrl,
  };
}

export function isMobileAllowedUser(user: User): boolean {
  if (user.role === 'lider') return false;
  if (user.role === 'tecnico' && !user.isApproved) return false;
  return true;
}
