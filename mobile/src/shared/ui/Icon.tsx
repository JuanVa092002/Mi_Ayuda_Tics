import Feather from '@expo/vector-icons/Feather';
import type { StyleProp, TextStyle } from 'react-native';
import { semanticColors } from '../theme/semantic-colors';

export type IconName = React.ComponentProps<typeof Feather>['name'];

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'brandBlue'
  | 'brandGreen'
  | 'inverse'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

const colorMap: Record<IconColor, string> = {
  primary: semanticColors.text.primary,
  secondary: semanticColors.text.secondary,
  tertiary: semanticColors.text.tertiary,
  brandBlue: semanticColors.brand.blue,
  brandGreen: semanticColors.brand.green,
  inverse: semanticColors.text.inverse,
  error: semanticColors.state.error,
  success: semanticColors.state.success,
  warning: semanticColors.state.warning,
  info: semanticColors.state.info,
};

type IconProps = {
  name: IconName;
  size?: number;
  color?: IconColor;
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 20, color = 'secondary', accessibilityLabel, style }: IconProps) {
  return (
    <Feather
      name={name}
      size={size}
      color={colorMap[color]}
      accessibilityLabel={accessibilityLabel}
      style={style}
    />
  );
}
