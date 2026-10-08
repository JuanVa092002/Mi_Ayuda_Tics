import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { semanticColors } from '../theme/semantic-colors';
import { layout } from '../theme/spacing';
import { radius } from '../theme/radius';
import { motion } from '../theme/motion';
import { typography } from '../theme/typography';
import { Text } from './Text';
import * as Haptics from 'expo-haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'default' | 'medium' | 'small';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: semanticColors.brand.green, text: semanticColors.text.inverse },
  secondary: { bg: semanticColors.brand.blue, text: semanticColors.text.inverse },
  outline: { bg: 'transparent', text: semanticColors.brand.blue, border: semanticColors.brand.blue },
  ghost: { bg: 'transparent', text: semanticColors.brand.blue },
  destructive: { bg: semanticColors.state.error, text: semanticColors.text.inverse },
};

const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  default: { height: layout.buttonHeight, paddingHorizontal: 32, fontSize: 15 },
  medium: { height: 48, paddingHorizontal: 32, fontSize: 15 },
  small: { height: 40, paddingHorizontal: 24, fontSize: 14 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  fullWidth = false,
  leftIcon,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const palette = variantStyles[variant];
  const sizing = sizeStyles[size];
  const isDisabled = disabled || loading;

  const handlePress: NonNullable<PressableProps['onPress']> = (event) => {
    if (variant === 'primary') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress?.(event);
  };

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          height: sizing.height,
          paddingHorizontal: sizing.paddingHorizontal,
          borderColor: palette.border,
          borderWidth: palette.border ? 1.5 : 0,
          opacity: pressed || isDisabled ? motion.pressOpacity : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            style={[
              typography.button,
              {
                color: palette.text,
                fontSize: sizing.fontSize,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: -2,
  },
});
