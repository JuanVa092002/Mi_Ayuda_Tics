import { describe, expect, it } from 'vitest';
import { getCompactStatusLabel, getStatusTone } from './status-visual';

describe('status-visual', () => {
  it('separa cierre, espera, solución y cancelación', () => {
    expect(getStatusTone('cerrado')).toBe('neutral');
    expect(getStatusTone('resuelto')).toBe('success');
    expect(getStatusTone('esperando_usuario')).toBe('warning');
    expect(getStatusTone('cancelado')).toBe('danger');
    expect(getStatusTone('en_progreso')).toBe('info');
  });

  it('acorta etiquetas largas para listas', () => {
    expect(getCompactStatusLabel('pendiente', 'Seguimiento pendiente del equipo TIC')).toBe(
      'En seguimiento',
    );
    expect(getCompactStatusLabel('esperando_usuario', 'Requiere tu información')).toBe('Falta info');
    expect(getCompactStatusLabel('resuelto', 'Solución aplicada')).toBe('Por confirmar');
  });
});
