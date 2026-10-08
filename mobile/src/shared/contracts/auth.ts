import { mapUserDto, type User, type UserDto } from './user';

export type AuthSession = {
  token: string;
  user: User;
};

export type LoginResponseDto = {
  message?: string;
  dataUser: {
    token: string;
    user: UserDto;
    expiresIn?: number;
  };
};

export type RegisterFuncionarioResponseDto = {
  message: string;
  data: {
    token: string;
    user: UserDto;
    expiresIn?: number;
  };
};

export type RegisterTecnicoResponseDto = {
  message: string;
};

export type RegisterResponseDto = RegisterFuncionarioResponseDto | RegisterTecnicoResponseDto;

export function mapLoginResponse(dto: LoginResponseDto): AuthSession {
  const token = dto.dataUser?.token;
  const userDto = dto.dataUser?.user;
  if (!token || !userDto?._id) {
    throw new Error('Respuesta de login incompleta');
  }
  return { token, user: mapUserDto(userDto) };
}

export function mapVerifyUser(dto: UserDto): User {
  if (!dto._id) {
    throw new Error('Usuario de sesión inválido');
  }
  return mapUserDto(dto);
}

export function isFuncionarioRegisterResponse(
  dto: RegisterResponseDto,
): dto is RegisterFuncionarioResponseDto {
  return 'data' in dto && Boolean(dto.data?.token);
}

export function mapRegisterSession(dto: RegisterFuncionarioResponseDto): AuthSession {
  const token = dto.data.token;
  const userDto = dto.data.user;
  if (!token || !userDto?._id) {
    throw new Error('Respuesta de registro incompleta');
  }
  return { token, user: mapUserDto(userDto) };
}
