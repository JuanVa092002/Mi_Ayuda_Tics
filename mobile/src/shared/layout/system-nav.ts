/**
 * Bottom system chrome (Android 3-button vs gesture, iOS home indicator).
 *
 * World-class apps (Rappi, Instagram) pad from WindowInsets, not a fixed height:
 * - 3-button / large inset → more padding → tabs and sheets sit *above* the buttons
 * - gesture / small inset → less padding → chrome sits *lower*, just clear of the handle
 *
 * Transparent Android Modals often paint over the nav bar while the parent
 * SafeAreaProvider still reports bottom = 0. Overlay surfaces therefore use a
 * 3-button fallback when the inset is missing.
 */

export type NavSurface = 'tabBar' | 'overlay';

export type SystemNavPlatform = 'ios' | 'android' | 'web';

export type SystemNavInput = {
  platform: SystemNavPlatform;
  bottomInset: number;
  surface: NavSurface;
};

/** Typical Android 3-button navigation bar height (dp). */
export const ANDROID_THREE_BUTTON_HEIGHT = 48;

/** Insets at or above this are treated as 3-button (or equivalent) chrome. */
export const THREE_BUTTON_INSET_MIN = 40;

const TAB_COMFORT_THREE_BUTTON = 8;
const TAB_COMFORT_GESTURE = 4;
const TAB_COMFORT_LEGACY = 16;
const OVERLAY_COMFORT = 12;
const IOS_MIN_TAB = 8;

export function resolveBottomChromePadding({
  platform,
  bottomInset,
  surface,
}: SystemNavInput): number {
  const inset = Math.max(0, bottomInset);

  if (platform !== 'android') {
    if (surface === 'overlay') {
      return Math.max(inset, IOS_MIN_TAB) + OVERLAY_COMFORT;
    }
    return Math.max(inset, IOS_MIN_TAB);
  }

  if (surface === 'tabBar') {
    if (inset >= THREE_BUTTON_INSET_MIN) {
      return inset + TAB_COMFORT_THREE_BUTTON;
    }
    if (inset > 0) {
      return inset + TAB_COMFORT_GESTURE;
    }
    return TAB_COMFORT_LEGACY;
  }

  if (inset > 0) {
    return inset + OVERLAY_COMFORT;
  }
  return ANDROID_THREE_BUTTON_HEIGHT + OVERLAY_COMFORT;
}
