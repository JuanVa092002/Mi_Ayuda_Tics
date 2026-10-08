import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Button, type ButtonVariant } from './Button';

type LegacyVariant = 'green' | 'blue';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: LegacyVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const variantMap: Record<LegacyVariant, ButtonVariant> = {
  green: 'primary',
  blue: 'secondary',
};

export function AppButton({
  label,
  variant = 'blue',
  loading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  return (
    <Button
      label={label}
      variant={variantMap[variant]}
      loading={loading}
      disabled={disabled}
      fullWidth
      style={style}
      {...props}
    />
  );
}
