import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/client';
import { UploadFileError } from '@/shared/media/create-upload-file';

vi.mock('@/shared/api/client', async () => {
  const errors = await import('@/shared/api/errors');
  return {
    apiFetch: vi.fn(),
    ApiError: errors.ApiError,
  };
});

vi.mock('@/shared/api/multipart-image', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api/multipart-image')>();
  return {
    ...actual,
    appendImageToFormData: vi.fn(),
  };
});

import { apiFetch } from '@/shared/api/client';
import { appendImageToFormData } from '@/shared/api/multipart-image';
import { createSolicitud } from './api';

const payload = {
  userId: '64a000000000000000000001',
  environmentId: '64a000000000000000000002',
  caseTypeId: '64a000000000000000000003',
  description: 'El proyector no enciende en el aula',
  phone: '3001234567',
};

const successDto = {
  message: 'Registro de solicitud exitoso',
  solicitud: {
    _id: '64a000000000000000000099',
    codigoCaso: '42',
    descripcion: payload.description,
    estado: 'solicitado',
    fecha: '21-08-2026',
  },
};

describe('createSolicitud', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(appendImageToFormData).mockReset();
    vi.mocked(appendImageToFormData).mockResolvedValue(undefined);
  });

  it('envía FormData sin foto con los campos del contrato', async () => {
    vi.mocked(apiFetch).mockResolvedValue(successDto);

    const result = await createSolicitud('tok', payload);

    expect(result.id).toBe('64a000000000000000000099');
    expect(appendImageToFormData).not.toHaveBeenCalled();
    expect(apiFetch).toHaveBeenCalledWith(
      '/solicitud',
      expect.objectContaining({ method: 'POST', token: 'tok' }),
    );
    const formData = vi.mocked(apiFetch).mock.calls[0][1]?.formData as FormData;
    expect(formData.get('usuario')).toBe(payload.userId);
    expect(formData.get('ambiente')).toBe(payload.environmentId);
    expect(formData.get('tipoCaso')).toBe(payload.caseTypeId);
    expect(formData.get('descripcion')).toBe(payload.description);
    expect(formData.get('telefono')).toBe(payload.phone);
    expect(formData.get('foto')).toBeNull();
  });

  it('adjunta foto válida en el campo foto', async () => {
    vi.mocked(apiFetch).mockResolvedValue(successDto);
    vi.mocked(appendImageToFormData).mockImplementation(async (formData, field) => {
      formData.append(field, 'file-placeholder');
    });

    await createSolicitud('tok', {
      ...payload,
      photo: { uri: 'file:///cache/a.jpg', mimeType: 'image/jpeg', fileName: 'a.jpg' },
    });

    expect(appendImageToFormData).toHaveBeenCalledWith(
      expect.any(FormData),
      'foto',
      expect.objectContaining({ uri: 'file:///cache/a.jpg' }),
    );
    const formData = vi.mocked(apiFetch).mock.calls[0][1]?.formData as FormData;
    expect(formData.get('foto')).toBe('file-placeholder');
  });

  it('no traduce Unsupported FormDataPart como red: lo propaga desde apiFetch', async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError(
        'No se pudo adjuntar la foto. Vuelve a tomarla o elígela de la galería.',
        'VALIDATION_ERROR',
        0,
      ),
    );

    await expect(
      createSolicitud('tok', {
        ...payload,
        photo: { uri: 'file:///cache/a.jpg' },
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: expect.stringMatching(/foto/i),
    });
  });

  it('propaga 400/413/415/401 con el mensaje del backend', async () => {
    const cases = [
      [400, 'VALIDATION_ERROR', 'El ambiente seleccionado no está activo o no existe'],
      [413, 'VALIDATION_ERROR', 'Archivo demasiado grande'],
      [415, 'VALIDATION_ERROR', 'Tipo de archivo no permitido'],
      [401, 'UNAUTHORIZED', 'error en inicio de sesion, no cuenta con token'],
    ] as const;

    for (const [status, code, message] of cases) {
      vi.mocked(apiFetch).mockRejectedValueOnce(new ApiError(message, code, status));
      await expect(createSolicitud('tok', payload)).rejects.toMatchObject({
        code,
        status,
        message,
      });
    }
  });

  it('propaga fallo de red real', async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError('No hay conexión con el servidor. Verifica tu internet.', 'NETWORK_ERROR', 0),
    );
    await expect(createSolicitud('tok', payload)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  it('timeout de crear solicitud no reintenta apiFetch', async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError('El servicio está tardando en responder. Intenta nuevamente en unos segundos.', 'TIMEOUT', 408),
    );
    await expect(createSolicitud('tok', payload)).rejects.toMatchObject({ code: 'TIMEOUT' });
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('falla con error específico si el helper de upload rechaza el archivo', async () => {
    vi.mocked(appendImageToFormData).mockRejectedValue(
      new UploadFileError('Tipo de archivo no permitido', 'UNSUPPORTED_MIME'),
    );
    await expect(
      createSolicitud('tok', { ...payload, photo: { uri: 'file:///cache/x.bin' } }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
      message: 'Tipo de archivo no permitido',
    });
  });
});
