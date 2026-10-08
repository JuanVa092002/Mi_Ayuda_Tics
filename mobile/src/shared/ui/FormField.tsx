import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { formStyles } from './form-styles';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...props }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const isMultiline = Boolean(props.multiline);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={semanticColors.text.tertiary}
        accessibilityLabel={label}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          isMultiline && styles.multiline,
          focused && styles.focused,
          error && styles.errorInput,
          style,
        ]}
      />
      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={semanticColors.state.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = {
  field: {
    gap: spacing[2],
  },
  label: {
    ...typography.label,
    color: semanticColors.text.primary,
    fontWeight: '700' as const,
  },
  input: {
    minHeight: 56,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.card,
    color: semanticColors.text.primary,
    fontSize: 15,
    lineHeight: 21,
  },
  multiline: {
    minHeight: 128,
    borderRadius: radius.md,
    textAlignVertical: 'top' as const,
  },
  focused: {
    borderWidth: 2,
    borderColor: semanticColors.border.focus,
  },
  errorInput: {
    borderWidth: 2,
    borderColor: semanticColors.state.error,
  },
  errorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing[1],
  },
  error: {
    ...formStyles.error,
    color: semanticColors.state.error,
    marginTop: 0,
    marginBottom: 0,
  },
};
