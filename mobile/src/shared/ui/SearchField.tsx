import { Feather } from '@expo/vector-icons';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

type SearchFieldProps = Omit<TextInputProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  variant?: 'outline' | 'filled';
};

export function SearchField({
  style,
  compact = false,
  variant = 'outline',
  placeholder = 'Buscar...',
  ...props
}: SearchFieldProps) {
  const hasValue = Boolean(props.value);

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        variant === 'filled' && styles.containerFilled,
        style,
      ]}
    >
      <Feather name="search" size={20} color={semanticColors.text.tertiary} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={semanticColors.text.tertiary}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder}
        style={styles.input}
        {...props}
      />
      {hasValue && props.onChangeText ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          onPress={() => props.onChangeText?.('')}
          style={styles.clear}
        >
          <Feather name="x-circle" size={18} color={semanticColors.text.tertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  containerCompact: {
    minHeight: 44,
    paddingHorizontal: spacing[3],
  },
  containerFilled: {
    backgroundColor: semanticColors.surface.well,
    borderWidth: 0,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    paddingVertical: spacing[2],
    fontSize: 15,
    lineHeight: 20,
    color: semanticColors.text.primary,
  },
  clear: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
