import { describe, expect, it } from 'vitest';
import { parseJsonMessage } from './http';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('parseJsonMessage', () => {
  it('usa message del backend', async () => {
    const message = await parseJsonMessage(
      jsonResponse(400, { message: 'El ambiente seleccionado no está activo o no existe' }),
    );
    expect(message).toBe('El ambiente seleccionado no está activo o no existe');
  });

  it('usa el primer error de validación 422', async () => {
    const message = await parseJsonMessage(
      jsonResponse(422, { errors: [{ message: 'La descripción debe tener al menos 10 caracteres' }] }),
    );
    expect(message).toBe('La descripción debe tener al menos 10 caracteres');
  });
});
