import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  resolveBottomChromePadding,
  type SystemNavPlatform,
} from './system-nav';

function platformFromOs(): SystemNavPlatform {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Bottom padding for tab bars and modal sheets, derived from live WindowInsets.
 */
export function useSystemNavInset() {
  const insets = useSafeAreaInsets();
  const platform = platformFromOs();

  return {
    top: insets.top,
    rawBottom: insets.bottom,
    tabBarPadding: resolveBottomChromePadding({
      platform,
      bottomInset: insets.bottom,
      surface: 'tabBar',
    }),
    overlayPadding: resolveBottomChromePadding({
      platform,
      bottomInset: insets.bottom,
      surface: 'overlay',
    }),
  };
}
