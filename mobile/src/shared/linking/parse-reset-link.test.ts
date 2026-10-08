import { describe, expect, it } from 'vitest';
import {
  extractResetTokenFromUrl,
  isValidResetTokenFormat,
  resolveResetTokenFromRouteParam,
} from './parse-reset-link';

const VALID_TOKEN = 'a'.repeat(64);

describe('isValidResetTokenFormat', () => {
  it('accepts 64-char hex', () => {
    expect(isValidResetTokenFormat(VALID_TOKEN)).toBe(true);
  });

  it('rejects short tokens', () => {
    expect(isValidResetTokenFormat('abc')).toBe(false);
    expect(isValidResetTokenFormat(null)).toBe(false);
  });
});

describe('resolveResetTokenFromRouteParam', () => {
  it('accepts valid string param', () => {
    expect(resolveResetTokenFromRouteParam(VALID_TOKEN)).toBe(VALID_TOKEN);
  });

  it('rejects malformed param', () => {
    expect(resolveResetTokenFromRouteParam('TEST_TOKEN_SMOKE')).toBeNull();
    expect(resolveResetTokenFromRouteParam(undefined)).toBeNull();
  });

  it('accepts first valid entry in array', () => {
    expect(resolveResetTokenFromRouteParam(['bad', VALID_TOKEN])).toBe(VALID_TOKEN);
  });
});

describe('extractResetTokenFromUrl', () => {
  it('parses canonical auth path', () => {
    expect(
      extractResetTokenFromUrl(`/(auth)/reset-password/${VALID_TOKEN}`),
    ).toBe(VALID_TOKEN);
  });

  it('parses HTTPS App Link', () => {
    expect(
      extractResetTokenFromUrl(
        `https://miayudatics.vercel.app/restablecerPassword/${VALID_TOKEN}`,
      ),
    ).toBe(VALID_TOKEN);
  });

  it('parses HTTPS with trailing slash', () => {
    expect(
      extractResetTokenFromUrl(
        `https://miayudatics.vercel.app/restablecerPassword/${VALID_TOKEN}/`,
      ),
    ).toBe(VALID_TOKEN);
  });

  it('parses custom scheme', () => {
    expect(
      extractResetTokenFromUrl(`miayudatics://restablecerPassword/${VALID_TOKEN}`),
    ).toBe(VALID_TOKEN);
  });

  it('parses relative path', () => {
    expect(extractResetTokenFromUrl(`/restablecerPassword/${VALID_TOKEN}`)).toBe(VALID_TOKEN);
  });

  it('parses path without leading slash', () => {
    expect(extractResetTokenFromUrl(`restablecerPassword/${VALID_TOKEN}`)).toBe(VALID_TOKEN);
  });

  it('rejects invalid token length', () => {
    expect(
      extractResetTokenFromUrl('https://miayudatics.vercel.app/restablecerPassword/short'),
    ).toBeNull();
  });

  it('rejects empty input', () => {
    expect(extractResetTokenFromUrl('')).toBeNull();
    expect(extractResetTokenFromUrl('   ')).toBeNull();
  });

  it('rejects unrelated URLs', () => {
    expect(extractResetTokenFromUrl('https://miayudatics.vercel.app/login')).toBeNull();
  });

  it('handles encoded token segments', () => {
    const token = `${'b'.repeat(63)}%41`;
    expect(
      extractResetTokenFromUrl(`https://miayudatics.vercel.app/restablecerPassword/${token}`),
    ).toBe(`${'b'.repeat(63)}A`);
  });
});
