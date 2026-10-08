import {
  Text as RNText,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { semanticColors } from '../theme/semantic-colors';
import { typography, type TypographyVariant } from '../theme/typography';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'brandBlue' | 'brandGreen' | 'error';

const colorMap: Record<TextColor, string> = {
  primary: semanticColors.text.primary,
  secondary: semanticColors.text.secondary,
  tertiary: semanticColors.text.tertiary,
  inverse: semanticColors.text.inverse,
  link: semanticColors.text.link,
  brandBlue: semanticColors.brand.blue,
  brandGreen: semanticColors.brand.green,
  error: semanticColors.state.error,
};

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

export function Text({
  variant = 'p2',
  color = 'primary',
  align,
  style,
  ...props
}: AppTextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colorMap[color] }, align ? { textAlign: align } : null, style]}
      {...props}
    />
  );
}
