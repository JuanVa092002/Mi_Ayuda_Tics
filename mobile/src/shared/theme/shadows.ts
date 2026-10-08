import { Platform, type ViewStyle } from 'react-native';
import { semanticColors } from './semantic-colors';

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: semanticColors.brand.blue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
} as const;
