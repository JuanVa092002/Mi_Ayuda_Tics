import { afterEach, describe, expect, it } from 'vitest';
import {
  buildSolicitudFormDefaultValues,
  clearSolicitudFormDraft,
  errorsToRestore,
  getSolicitudFormDraft,
  snapshotSolicitudFormErrors,
  subscribeSolicitudFormDraft,
  writeSolicitudFormDraft,
} from './solicitud-form-draft';

describe('solicitud-form-draft', () => {
  afterEach(() => {
    clearSolicitudFormDraft();
  });

  it('escribe y lee en memoria de forma síncrona, sin disco', () => {
    writeSolicitudFormDraft({
      environmentId: 'amb-1',
      caseTypeId: 'tipo-1',
      description: 'El proyector no enciende',
      phone: '3001234567',
      photo: { uri: 'file:///cache/a.jpg', origin: 'camera' },
    });

    const stored = getSolicitudFormDraft();
    expect(stored?.environmentId).toBe('amb-1');
    expect(stored?.caseTypeId).toBe('tipo-1');
    expect(stored?.description).toBe('El proyector no enciende');
    expect(stored?.phone).toBe('3001234567');
    expect(stored?.photo?.uri).toBe('file:///cache/a.jpg');
    expect(stored?.photo?.origin).toBe('camera');
  });

  it('clear deja el draft inaccesible', () => {
    writeSolicitudFormDraft({
      environmentId: 'amb-1',
      caseTypeId: 'tipo-1',
      description: 'El proyector no enciende',
      phone: '3001234567',
    });
    clearSolicitudFormDraft();
    expect(getSolicitudFormDraft()).toBeNull();
  });

  it('buildSolicitudFormDefaultValues usa el draft en un remount', () => {
    writeSolicitudFormDraft({
      environmentId: 'amb-1',
      caseTypeId: 'tipo-1',
      description: 'El proyector no enciende',
      phone: '3009999999',
    });
    expect(buildSolicitudFormDefaultValues(getSolicitudFormDraft(), '3000000000')).toEqual({
      environmentId: 'amb-1',
      caseTypeId: 'tipo-1',
      description: 'El proyector no enciende',
      phone: '3009999999',
    });
  });

  it('snapshot de errores no incluye token ni campos vacíos', () => {
    const errors = snapshotSolicitudFormErrors({
      environmentId: { type: 'too_small', message: 'Selecciona un ambiente' },
      description: { type: 'too_small', message: 'La descripción debe tener al menos 10 caracteres' },
    });
    expect(errors).toEqual({
      environmentId: 'Selecciona un ambiente',
      description: 'La descripción debe tener al menos 10 caracteres',
    });
    expect(JSON.stringify(errors)).not.toMatch(/bearer|eyJ/i);
  });

  it('emit notifica listeners (foto tras remount durante cámara)', () => {
    let calls = 0;
    const stop = subscribeSolicitudFormDraft(() => {
      calls += 1;
    });
    writeSolicitudFormDraft(
      {
        environmentId: 'amb-1',
        caseTypeId: 'tipo-1',
        description: 'El proyector no enciende',
        phone: '3001234567',
        photo: { uri: 'file:///cache/b.jpg', origin: 'gallery' },
      },
      { emit: true },
    );
    expect(calls).toBe(1);
    expect(getSolicitudFormDraft()?.photo?.uri).toBe('file:///cache/b.jpg');
    stop();
    writeSolicitudFormDraft(
      {
        environmentId: 'amb-1',
        caseTypeId: 'tipo-1',
        description: 'El proyector no enciende',
        phone: '3001234567',
      },
      { emit: true },
    );
    expect(calls).toBe(1);
  });

  it('logout deja un flujo vacío para el siguiente usuario', () => {
    writeSolicitudFormDraft({
      environmentId: 'amb-a',
      caseTypeId: 'tipo-a',
      description: 'Draft del funcionario A con foto',
      phone: '3002000001',
      photo: { uri: 'file:///cache/a.jpg', origin: 'camera' },
      errors: { description: 'La descripción debe tener al menos 10 caracteres' },
    });
    clearSolicitudFormDraft();
    expect(getSolicitudFormDraft()).toBeNull();
    expect(buildSolicitudFormDefaultValues(null, '3002000003')).toEqual({
      environmentId: '',
      caseTypeId: '',
      description: '',
      phone: '3002000003',
    });
    expect(
      errorsToRestore(null, buildSolicitudFormDefaultValues(null, '3002000003')),
    ).toBeUndefined();
  });

  it('no restaura un error si el campo ya cambió', () => {
    writeSolicitudFormDraft({
      environmentId: '',
      caseTypeId: 'tipo-1',
      description: 'corto',
      phone: '3002000001',
      errors: {
        environmentId: 'Selecciona un ambiente',
        description: 'La descripción debe tener al menos 10 caracteres',
      },
    });
    const restored = errorsToRestore(getSolicitudFormDraft(), {
      environmentId: '',
      caseTypeId: 'tipo-1',
      description: 'Descripción válida de más de diez',
      phone: '3002000001',
    });
    expect(restored).toEqual({
      environmentId: 'Selecciona un ambiente',
    });
  });
});
