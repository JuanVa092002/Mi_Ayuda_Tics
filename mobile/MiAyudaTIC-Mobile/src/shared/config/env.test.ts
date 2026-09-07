import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_RENDER_API_ORIGIN,
  describeApiRuntimeHost,
  getApiBaseUrl,
  isLocalApiHostname,
  resolvePublicApiOrigin,
} from './env';

describe('describeApiRuntimeHost', () => {
  it('clasifica loopback de teléfono como local', () => {
    expect(describeApiRuntimeHost('http://127.0.0.1:18080')).toEqual({
      scheme: 'http',
      hostname: '127.0.0.1',
      port: '18080',
      kind: 'local',
    });
  });

  it('clasifica alias del emulador como local', () => {
    expect(describeApiRuntimeHost('http://10.0.2.2:18080')).toEqual({
      scheme: 'http',
      hostname: '10.0.2.2',
      port: '18080',
      kind: 'local',
    });
  });

  it('clasifica Render HTTPS como remoto', () => {
    expect(describeApiRuntimeHost(DEFAULT_RENDER_API_ORIGIN)).toEqual({
      scheme: 'https',
      hostname: 'miayudatics-v1-0.onrender.com',
      port: '443',
      kind: 'remote',
    });
  });

  it('no trata el hostname de Render como local', () => {
    expect(isLocalApiHostname('miayudatics-v1-0.onrender.com')).toBe(false);
  });
});

describe('resolvePublicApiOrigin', () => {
  const previousUrl = process.env.EXPO_PUBLIC_API_URL;
  const previousAllow = process.env.EXPO_PUBLIC_ALLOW_LOCAL_API;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = previousUrl;
    process.env.EXPO_PUBLIC_ALLOW_LOCAL_API = previousAllow;
  });

  it('acepta Render HTTPS', () => {
    expect(resolvePublicApiOrigin(DEFAULT_RENDER_API_ORIGIN)).toBe(DEFAULT_RENDER_API_ORIGIN);
  });

  it('falla si falta la URL', () => {
    expect(() => resolvePublicApiOrigin(undefined)).toThrow(/no está configurada/i);
    expect(() => resolvePublicApiOrigin('   ')).toThrow(/no está configurada/i);
  });

  it('falla si la URL está malformada', () => {
    expect(() => resolvePublicApiOrigin('not-a-url')).toThrow(/no es una URL válida/i);
  });

  it('bloquea loopback sin opt-in', () => {
    delete process.env.EXPO_PUBLIC_ALLOW_LOCAL_API;
    expect(() => resolvePublicApiOrigin('http://127.0.0.1:18080')).toThrow(/host local/i);
    expect(() => resolvePublicApiOrigin('http://10.0.2.2:18080')).toThrow(/host local/i);
  });

  it('permite loopback solo con EXPO_PUBLIC_ALLOW_LOCAL_API=1', () => {
    process.env.EXPO_PUBLIC_ALLOW_LOCAL_API = '1';
    expect(resolvePublicApiOrigin('http://127.0.0.1:18080')).toBe('http://127.0.0.1:18080');
  });

  it('rechaza HTTP remoto inseguro', () => {
    expect(() => resolvePublicApiOrigin('http://miayudatics-v1-0.onrender.com')).toThrow(/HTTPS/i);
  });

  it('getApiBaseUrl concatena /api sobre Render', () => {
    process.env.EXPO_PUBLIC_API_URL = DEFAULT_RENDER_API_ORIGIN;
    delete process.env.EXPO_PUBLIC_ALLOW_LOCAL_API;
    expect(getApiBaseUrl()).toBe(`${DEFAULT_RENDER_API_ORIGIN}/api`);
  });
});
