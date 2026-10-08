import { Feather } from '@expo/vector-icons';
import { useSystemNavInset } from '@/shared/layout/useSystemNavInset';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { radius } from '@/shared/theme/radius';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

function SelectSheet({
  label,
  value,
  options,
  onChange,
  onClose,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const { overlayPadding } = useSystemNavInset();

  return (
    <View style={styles.backdropRoot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        style={styles.backdropDismiss}
        onPress={onClose}
      >
        <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" />
      </Pressable>
      <View style={[styles.sheet, { paddingBottom: overlayPadding }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{label}</Text>
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {isSelected ? (
                  <Feather name="check" size={20} color={semanticColors.brand.green} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export function SelectField({
  label,
  value,
  options,
  placeholder = 'Seleccionar',
  error,
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[styles.trigger, error ? styles.triggerError : null]}
      >
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={semanticColors.text.secondary} />
      </Pressable>
      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={semanticColors.state.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
          <SelectSheet
            label={label}
            value={value}
            options={options}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    fontWeight: '700',
    color: semanticColors.text.primary,
  },
  trigger: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    paddingHorizontal: spacing[4],
  },
  triggerError: {
    borderWidth: 2,
    borderColor: semanticColors.state.error,
  },
  value: {
    ...typography.p2,
    flex: 1,
    color: semanticColors.text.primary,
  },
  placeholder: {
    ...typography.p2,
    flex: 1,
    color: semanticColors.text.tertiary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: -spacing[1],
  },
  error: {
    ...typography.caption,
    color: semanticColors.state.error,
  },
  backdropRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: semanticColors.overlay.scrim,
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: semanticColors.surface.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '60%',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: semanticColors.border.default,
    marginBottom: spacing[4],
  },
  sheetTitle: {
    ...typography.h2,
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: semanticColors.border.default,
  },
  optionPressed: {
    backgroundColor: semanticColors.surface.muted,
  },
  optionText: {
    ...typography.p2,
    flex: 1,
    color: semanticColors.text.primary,
  },
  optionTextSelected: {
    color: semanticColors.brand.green,
    fontWeight: '700',
  },
});
