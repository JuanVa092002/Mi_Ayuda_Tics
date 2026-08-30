import { getPasswordRuleStatus } from '@/features/auth/password-recovery-errors';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import { useEffect } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PasswordRuleChecklistProps = {
  password: string;
  confirmPassword: string;
};

const RULES = [
  { key: 'minLength' as const, label: 'Mínimo 8 caracteres', primary: true },
  { key: 'hasLetter' as const, label: 'Al menos una letra', primary: false },
  { key: 'hasNumber' as const, label: 'Al menos un número', primary: false },
  { key: 'matches' as const, label: 'Las contraseñas coinciden', primary: true },
];

export function PasswordRuleChecklist({ password, confirmPassword }: PasswordRuleChecklistProps) {
  const status = getPasswordRuleStatus(password, confirmPassword);
  const metCount = RULES.filter((rule) => status[rule.key]).length;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [status.minLength, status.hasLetter, status.hasNumber, status.matches]);

  return (
    <View style={styles.container} accessibilityRole="list">
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon name="shield" size={18} color="brandBlue" />
        </View>
        <View style={styles.headerCopy}>
          <Text variant="label" color="primary">
            Seguridad de la contraseña
          </Text>
          <Text variant="caption" color="secondary">
            {metCount} de {RULES.length} requisitos cumplidos
          </Text>
        </View>
      </View>

      <View style={styles.rules}>
        {RULES.map((rule) => {
          const met = status[rule.key];
          const accessibilityLabel = met ? `Cumplida: ${rule.label}` : `Pendiente: ${rule.label}`;

          return (
            <View
              key={rule.key}
              style={[styles.row, rule.primary && styles.rowPrimary, met && styles.rowMet]}
              accessibilityRole="text"
              accessibilityLabel={accessibilityLabel}
              accessibilityState={{ checked: met }}
            >
              <Icon
                name={met ? 'check-circle' : 'circle'}
                size={rule.primary ? 20 : 18}
                color={met ? 'success' : 'tertiary'}
              />
              <Text
                variant={rule.primary ? 'p2' : 'caption'}
                style={met ? styles.metText : styles.pendingText}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[5],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.muted,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.default,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: semanticColors.state.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: spacing[1],
  },
  rules: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 28,
    paddingVertical: spacing[1],
  },
  rowPrimary: {
    minHeight: 32,
  },
  rowMet: {
    opacity: 1,
  },
  metText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  pendingText: {
    color: semanticColors.text.secondary,
  },
});
