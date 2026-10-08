import { useState, type ReactNode } from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { semanticColors } from '../theme/semantic-colors';
import { layout, spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';
import { Icon, type IconName } from './Icon';
import { PasswordToggle } from './PasswordToggle';
import { Text } from './Text';

export type TextInputState = 'empty' | 'focus' | 'filled' | 'error';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: IconName;
  rightElement?: ReactNode;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
  helperText?: string;
}

function resolveState(value: string, focused: boolean, hasError: boolean): TextInputState {
  if (hasError) return 'error';
  if (focused) return 'focus';
  if (value.length > 0) return 'filled';
  return 'empty';
}

export function TextInput({
  label,
  errorMessage,
  containerStyle,
  leftIcon,
  rightElement,
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
  helperText,
  value = '',
  editable = true,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage);
  const state = resolveState(String(value ?? ''), focused, hasError);

  const borderColor =
    state === 'error'
      ? semanticColors.state.error
      : state === 'focus'
        ? semanticColors.border.focus
        : semanticColors.border.default;

  const iconColor = state === 'error' ? 'error' : state === 'focus' ? 'brandGreen' : 'secondary';

  const trailing =
    rightElement ??
    (showPasswordToggle && onTogglePassword ? (
      <PasswordToggle
        visible={Boolean(passwordVisible)}
        onToggle={onTogglePassword}
        disabled={!editable}
      />
    ) : null);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text variant="label" color="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            borderColor,
            borderWidth: state === 'focus' || state === 'error' ? 2 : 1,
            opacity: editable ? 1 : 0.6,
          },
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIcon}>
            <Icon name={leftIcon} size={20} color={iconColor} />
          </View>
        ) : null}
        <RNTextInput
          placeholderTextColor={semanticColors.text.tertiary}
          style={[styles.input, leftIcon ? styles.inputWithIcon : null, style]}
          value={value}
          editable={editable}
          secureTextEntry={secureTextEntry}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {trailing ? <View style={styles.right}>{trailing}</View> : null}
      </View>
      {errorMessage ? (
        <View style={styles.feedbackRow}>
          <Icon name="alert-circle" size={14} color="error" />
          <Text variant="caption" color="error" style={styles.feedbackText}>
            {errorMessage}
          </Text>
        </View>
      ) : helperText ? (
        <View style={styles.feedbackRow}>
          <Icon name="info" size={14} color="tertiary" />
          <Text variant="caption" color="secondary" style={styles.feedbackText}>
            {helperText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.inputHeight,
    borderRadius: radius.pill,
    backgroundColor: semanticColors.surface.muted,
    paddingHorizontal: spacing[4],
  },
  leftIcon: {
    marginRight: spacing[3],
  },
  input: {
    flex: 1,
    ...typography.p2,
    color: semanticColors.text.primary,
    paddingVertical: spacing[3],
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  right: {
    marginLeft: spacing[2],
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[2],
    paddingHorizontal: spacing[1],
  },
  feedbackText: {
    flex: 1,
  },
});
