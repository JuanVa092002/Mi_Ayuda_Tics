import {
  isFuncionarioRegisterResponse,
  mapLoginResponse,
  mapRegisterSession,
  mapVerifyUser,
  type LoginResponseDto,
  type RegisterResponseDto,
} from '@/shared/contracts/auth';
import type { UserDto } from '@/shared/contracts/user';
import { apiFetch } from '@/shared/api/client';
import { mapUnknownFetchError } from '@/shared/api/fetch-error';
import { appendImageToFormData } from '@/shared/api/multipart-image';
import { SESSION_VERIFY_TIMEOUT_MS } from '@/shared/config/env';
import type { ApiMessage } from '@/shared/contracts/common';
import type { RegisterInput } from './session-types';

export async function loginRequest(correo: string, password: string) {
  const dto = await apiFetch<LoginResponseDto>('/auth/login', {
    method: 'POST',
    body: { correo, password },
    notifyUnauthorized: false,
  });
  return mapLoginResponse(dto);
}

export async function verifySessionRequest(token: string) {
  const dto = await apiFetch<UserDto>('/auth/verify-token', {
    token,
    notifyUnauthorized: false,
    timeoutMs: SESSION_VERIFY_TIMEOUT_MS,
  });
  return mapVerifyUser(dto);
}

export async function logoutRequest(token: string): Promise<ApiMessage> {
  return apiFetch<ApiMessage>('/auth/logout', {
    method: 'POST',
    token,
    notifyUnauthorized: false,
  });
}

export async function forgotPasswordRequest(correo: string): Promise<ApiMessage> {
  return apiFetch<ApiMessage>('/recuperarPassword', {
    method: 'POST',
    body: { correo },
    notifyUnauthorized: false,
  });
}

export async function resetPasswordRequest(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<ApiMessage> {
  return apiFetch<ApiMessage>(`/restablecerPassword/${token}`, {
    method: 'POST',
    body: { password, confirmPassword },
    notifyUnauthorized: false,
  });
}

export async function registerRequest(input: RegisterInput): Promise<
  | { kind: 'funcionario'; session: ReturnType<typeof mapRegisterSession> }
  | { kind: 'tecnico_pending'; message: string }
> {
  try {
    const { fotoUri, ...fields } = input;

    let dto: RegisterResponseDto;

    if (fotoUri) {
      const formData = new FormData();
      formData.append('nombre', fields.nombre);
      formData.append('correo', fields.correo);
      formData.append('rol', fields.rol);
      formData.append('telefono', fields.telefono);
      formData.append('password', fields.password);
      formData.append('confirmPassword', fields.confirmPassword);
      await appendImageToFormData(formData, 'foto', {
        uri: fotoUri,
        mimeType: 'image/jpeg',
        fileName: 'profile.jpg',
      });

      dto = await apiFetch<RegisterResponseDto>('/auth/register', {
        method: 'POST',
        formData,
        notifyUnauthorized: false,
      });
    } else {
      dto = await apiFetch<RegisterResponseDto>('/auth/register', {
        method: 'POST',
        body: fields,
        notifyUnauthorized: false,
      });
    }

    if (isFuncionarioRegisterResponse(dto)) {
      return { kind: 'funcionario', session: mapRegisterSession(dto) };
    }

    return { kind: 'tecnico_pending', message: dto.message };
  } catch (error) {
    throw mapUnknownFetchError(error);
  }
}
