import { describe, expect, it } from 'vitest';
import {
  buildSolicitudTimeline,
  computeSolicitudStats,
  filterSolicitudesByHistorialChip,
  filterSolicitudesByQuery,
  formatSolicitudDate,
  getStatusLabel,
  mapHistorialResponse,
  mapSolicitudDetail,
  mapSolicitudSummary,
  type SolicitudSummary,
} from './solicitud';

const listDto = {
  _id: 's1',
  codigoCaso: 'CASE-001',
  descripcion: 'Problema con red',
  estado: 'asignado',
  fecha: '14-06-2026 10:30',
  telefono: '3001234567',
  usuario: { nombre: 'Juan' },
  tecnico: { nombre: 'Tec' },
  ambiente: { nombre: 'Lab 2' },
  tipoCaso: { _id: 'tipo1', nombre: 'Red' },
  foto: { url: 'https://example.com/foto.jpg', optimizedUrl: 'https://example.com/foto-opt.jpg' },
  solucion: { descripcionSolucion: 'Se reinició el switch' },
};

describe('mapSolicitudSummary', () => {
  it('mapea refs populated', () => {
    const summary = mapSolicitudSummary(listDto);
    expect(summary).toMatchObject({
      id: 's1',
      caseCode: 'CASE-001',
      description: 'Problema con red',
      status: 'asignado',
      createdAtRaw: '14-06-2026 10:30',
      requesterName: 'Juan',
      technicianName: 'Tec',
      environmentName: 'Lab 2',
      caseTypeName: 'Red',
      caseTypeId: 'tipo1',
    });
    expect(summary.photo?.url).toBe('https://example.com/foto.jpg');
    expect(summary.solution?.description).toBe('Se reinició el switch');
  });

  it('tolera refs como string id', () => {
    const summary = mapSolicitudSummary({
      ...listDto,
      usuario: 'userid',
      tecnico: 'tecId',
      tipoCaso: 'tipoId',
    });
    expect(summary.requesterName).toBeUndefined();
    expect(summary.technicianName).toBeUndefined();
    expect(summary.caseTypeName).toBeUndefined();
    expect(summary.caseTypeId).toBe('tipoId');
  });
});

describe('mapSolicitudDetail', () => {
  it('incluye ambiente activo', () => {
    const detail = mapSolicitudDetail(
      {
        descripcion: 'Detalle',
        estado: 'pendiente',
        fecha: '14-06-2026 11:00',
        codigoCaso: 'CASE-002',
        ambiente: { nombre: 'Lab 3', activo: true },
      },
      's2',
    );
    expect(detail.id).toBe('s2');
    expect(detail.status).toBe('pendiente');
    expect(detail.environmentIsActive).toBe(true);
  });
});

describe('mapHistorialResponse', () => {
  it('desenvuelve solicitudesFinalizadas', () => {
    const items = mapHistorialResponse({ solicitudesFinalizadas: [listDto] });
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('s1');
  });
});

describe('computeSolicitudStats', () => {
  const items: SolicitudSummary[] = [
    { ...mapSolicitudSummary({ ...listDto, _id: '1', estado: 'solicitado' }) },
    { ...mapSolicitudSummary({ ...listDto, _id: '2', estado: 'asignado' }) },
    { ...mapSolicitudSummary({ ...listDto, _id: '3', estado: 'finalizado' }) },
    { ...mapSolicitudSummary({ ...listDto, _id: '4', estado: 'pendiente' }) },
  ];

  it('calcula total, pendientes y resueltas', () => {
    expect(computeSolicitudStats(items)).toEqual({
      total: 4,
      pending: 3,
      resolved: 1,
    });
  });
});

describe('helpers', () => {
  it('formatSolicitudDate formatea fecha backend es-CO', () => {
    const formatted = formatSolicitudDate('14-06-2026 10:30');
    expect(formatted).toContain('2026');
    expect(formatted).not.toBe('—');
    expect(formatSolicitudDate('')).toBe('—');
  });

  it('buildSolicitudTimeline marca estado actual', () => {
    const steps = buildSolicitudTimeline({ status: 'pendiente' });
    expect(steps.find((s) => s.status === 'pendiente')?.state).toBe('current');
    expect(steps.find((s) => s.status === 'solicitado')?.state).toBe('completed');
    expect(steps.find((s) => s.status === 'finalizado')?.state).toBe('upcoming');
  });

  it('filterSolicitudesByQuery busca por código o descripción', () => {
    const items = [mapSolicitudSummary(listDto)];
    expect(filterSolicitudesByQuery(items, 'CASE-001')).toHaveLength(1);
    expect(filterSolicitudesByQuery(items, 'red')).toHaveLength(1);
    expect(filterSolicitudesByQuery(items, 'inexistente')).toHaveLength(0);
  });

  it('getStatusLabel mapea estados UX', () => {
    expect(getStatusLabel('solicitado')).toBe('Pendiente de asignación');
    expect(getStatusLabel('asignado')).toBe('Asignado');
    expect(getStatusLabel('pendiente')).toBe('Requiere información');
    expect(getStatusLabel('finalizado')).toBe('Resuelta');
  });

  it('filterSolicitudesByHistorialChip agrupa estados de proceso', () => {
    const items = [
      mapSolicitudSummary({ ...listDto, _id: '1', estado: 'solicitado' }),
      mapSolicitudSummary({ ...listDto, _id: '2', estado: 'asignado' }),
      mapSolicitudSummary({ ...listDto, _id: '3', estado: 'pendiente' }),
      mapSolicitudSummary({ ...listDto, _id: '4', estado: 'finalizado' }),
    ];
    expect(filterSolicitudesByHistorialChip(items, 'Pendientes de asignación')).toHaveLength(1);
    expect(filterSolicitudesByHistorialChip(items, 'En proceso')).toHaveLength(2);
    expect(filterSolicitudesByHistorialChip(items, 'Resueltas')).toHaveLength(1);
  });

  it('no inventa un código de caso con em dash', () => {
    const summary = mapSolicitudSummary({ ...listDto, codigoCaso: undefined });
    expect(summary.caseCode).toBe('');
  });
});
