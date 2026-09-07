import { describe, expect, it } from 'vitest';
import {
  canResolveCaso,
  filterCasosEnProgreso,
  filterCasosEsperandoConfirmacion,
  filterCasosByQuery,
  filterCasosPorResolver,
  filterCasosTerminados,
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
  it('solo incluye asignado v2 por iniciar', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        { ...dto, _id: 'v2', estado: 'asignado', workflowVersion: 2 },
        { ...dto, _id: 'legacy', estado: 'asignado' },
        { ...dto, _id: 'c2', estado: 'finalizado' },
        { ...dto, _id: 'resuelto', estado: 'resuelto', workflowVersion: 2 },
      ],
    });
    const filtered = filterCasosPorResolver(casos);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('v2');
  });
});

describe('filterCasosEnProgreso', () => {
  it('incluye atención v2 y legacy, y excluye resuelto', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        { ...dto, _id: 'c1', estado: 'asignado' },
        { ...dto, _id: 'c2', estado: 'pendiente' },
        { ...dto, _id: 'c3', estado: 'en_progreso', workflowVersion: 2 },
        { ...dto, _id: 'c4', estado: 'resuelto', workflowVersion: 2 },
        { ...dto, _id: 'c5', estado: 'finalizado' },
      ],
    });
    const filtered = filterCasosEnProgreso(casos);
    expect(filtered.map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
  });
});

describe('filterCasosEsperandoConfirmacion', () => {
  it('incluye resuelto y no en atención', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        { ...dto, _id: 'c3', estado: 'en_progreso', workflowVersion: 2 },
        { ...dto, _id: 'c4', estado: 'resuelto', workflowVersion: 2 },
      ],
    });
    expect(filterCasosEsperandoConfirmacion(casos).map((c) => c.id)).toEqual(['c4']);
    expect(filterCasosEnProgreso(casos).map((c) => c.id)).toEqual(['c3']);
  });
});

describe('filterCasosTerminados', () => {
  it('incluye cerrado, cancelado y finalizado legacy', () => {
    const casos = mapCasosAsignadosResponse({
      solicitudesAsignadas: [
        { ...dto, _id: 'c1', estado: 'cerrado', workflowVersion: 2 },
        { ...dto, _id: 'c2', estado: 'cancelado', workflowVersion: 2 },
        { ...dto, _id: 'c3', estado: 'finalizado' },
        { ...dto, _id: 'c4', estado: 'resuelto', workflowVersion: 2 },
      ],
    });
    expect(filterCasosTerminados(casos).map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
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
