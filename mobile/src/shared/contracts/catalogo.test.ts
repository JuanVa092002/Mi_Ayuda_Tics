import { describe, expect, it } from 'vitest';
import { mapAmbiente, mapTipoCaso } from './catalogo';

describe('mapAmbiente', () => {
  it('normaliza DTO a dominio', () => {
    expect(
      mapAmbiente({ _id: 'a1', nombre: 'Lab 1', activo: true, descripcion: 'Desc' }),
    ).toEqual({
      id: 'a1',
      name: 'Lab 1',
      isActive: true,
      description: 'Desc',
    });
  });
});

describe('mapTipoCaso', () => {
  it('normaliza DTO a dominio', () => {
    expect(mapTipoCaso({ _id: 't1', nombre: 'Hardware' })).toEqual({
      id: 't1',
      name: 'Hardware',
      description: undefined,
    });
  });
});
