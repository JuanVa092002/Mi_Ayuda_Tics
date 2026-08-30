import { describe, expect, it } from 'vitest';
import {
  canResolveCaso,
  filterCasosEnProgreso,
  filterCasosByQuery,
  filterCasosPorResolver,
  mapCasoSummary,
  mapCasosAsignadosResponse,
  sortCasosByMostRecent,
} from './caso';

const dto = {
  _id: 'c1',
  codigoCaso: 'CASE-100',
  descripcion: 'PC no enciende',
  estado: 'asignado',
  fecha: '14-06-2026 09:00',
  telefono: '3001112233',
  usuario: { nombre: 'Ana' },
  ambiente: { nombre: 'Aula 5' },
  foto: { url: 'https://example.com/img.jpg' },
};

describe('mapCasoSummary', () => {
  it('mapea a dominio técnico', () => {
    expect(mapCasoSummary(dto)).toMatchObject({
      id: 'c1',
      caseCode: 'CASE-100',
      requesterName: 'Ana',
      environmentName: 'Aula 5',
      photoUrl: 'https://example.com/img.jpg',
    });
  });
});

describe('filterCasosPorResolver', () => {
  it('excluye finalizados', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        dto,
        { ...dto, _id: 'c2', estado: 'finalizado' },
      ],
    });
    const filtered = filterCasosPorResolver(casos);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('c1');
  });
});

describe('filterCasosEnProgreso', () => {
  it('solo incluye asignado y pendiente', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        dto,
        { ...dto, _id: 'c2', estado: 'pendiente' },
        { ...dto, _id: 'c3', estado: 'finalizado' },
      ],
    });
    const filtered = filterCasosEnProgreso(casos);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(['c1', 'c2']);
  });
});

describe('filterCasosByQuery', () => {
  it('filtra por código o descripción', () => {
    const casos = mapCasosAsignadosResponse({ solicitudesAsignadas: [dto] });
    expect(filterCasosByQuery(casos, 'CASE-100')).toHaveLength(1);
    expect(filterCasosByQuery(casos, 'enciende')).toHaveLength(1);
    expect(filterCasosByQuery(casos, 'zzz')).toHaveLength(0);
  });
});

describe('sortCasosByMostRecent', () => {
  it('invierte orden para mostrar recientes primero', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        { ...dto, _id: 'old' },
        { ...dto, _id: 'new' },
      ],
    });
    const sorted = sortCasosByMostRecent(casos);
    expect(sorted[0]?.id).toBe('new');
  });
});

describe('canResolveCaso', () => {
  it('permite asignado y pendiente', () => {
    expect(canResolveCaso({ status: 'asignado' })).toBe(true);
    expect(canResolveCaso({ status: 'pendiente' })).toBe(true);
    expect(canResolveCaso({ status: 'solicitado' })).toBe(false);
    expect(canResolveCaso({ status: 'finalizado' })).toBe(false);
  });
});
