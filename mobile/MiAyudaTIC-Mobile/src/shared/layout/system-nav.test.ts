import { describe, expect, it } from 'vitest';
import { resolveBottomChromePadding } from './system-nav';

describe('resolveBottomChromePadding', () => {
  it('levanta el tab bar sobre 3-button (inset grande) y deja holgura', () => {
    expect(
      resolveBottomChromePadding({
        platform: 'android',
        bottomInset: 48,
        surface: 'tabBar',
      }),
    ).toBe(56);
  });

  it('deja el tab bar más bajo en gesture (inset pequeño)', () => {
    const gesture = resolveBottomChromePadding({
      platform: 'android',
      bottomInset: 16,
      surface: 'tabBar',
    });
    const threeButton = resolveBottomChromePadding({
      platform: 'android',
      bottomInset: 48,
      surface: 'tabBar',
    });
    expect(gesture).toBe(20);
    expect(gesture).toBeLessThan(threeButton);
  });

  it('añade un respiro en ventanas Android sin inset (3-button clásico)', () => {
    expect(
      resolveBottomChromePadding({
        platform: 'android',
        bottomInset: 0,
        surface: 'tabBar',
      }),
    ).toBe(16);
  });

  it('en overlays Android sin inset reserva la barra de 3 botones', () => {
    expect(
      resolveBottomChromePadding({
        platform: 'android',
        bottomInset: 0,
        surface: 'overlay',
      }),
    ).toBe(60);
  });

  it('en overlays con inset de gesture no usa el fallback de 48', () => {
    expect(
      resolveBottomChromePadding({
        platform: 'android',
        bottomInset: 16,
        surface: 'overlay',
      }),
    ).toBe(28);
  });

  it('en iOS respeta el home indicator', () => {
    expect(
      resolveBottomChromePadding({
        platform: 'ios',
        bottomInset: 34,
        surface: 'tabBar',
      }),
    ).toBe(34);
    expect(
      resolveBottomChromePadding({
        platform: 'ios',
        bottomInset: 34,
        surface: 'overlay',
      }),
    ).toBe(46);
  });
});
