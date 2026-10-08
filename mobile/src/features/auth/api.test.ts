import { describe, expect, it, vi, beforeEach } from 'vitest';
import { verifySessionRequest } from './api';
import { apiFetch } from '@/shared/api/client';
import { SESSION_VERIFY_TIMEOUT_MS } from '@/shared/config/env';

vi.mock('@/shared/api/client', () => ({
  apiFetch: vi.fn(),
}));

describe('verifySessionRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa timeout corto de sesión en verify-token', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      _id: '1',
      nombre: 'Test',
      correo: 't@test.com',
      rol: 'funcionario',
      activo: true,
      estado: true,
    });

    await verifySessionRequest('tok');

    expect(apiFetch).toHaveBeenCalledWith('/auth/verify-token', {
      token: 'tok',
      notifyUnauthorized: false,
      timeoutMs: SESSION_VERIFY_TIMEOUT_MS,
    });
  });
});
