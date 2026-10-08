import type { ReactNode } from 'react';
import { colors } from '@/shared/theme/colors';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * @deprecated Use native Stack screenOptions instead.
 * ScreenScaffold is kept for Tecnico migration. For Funcionario, use:
 * - SafeAreaView + ScrollView for screen content
 * - Stack.Screen options for header (headerShown, headerBackVisible, headerTitle)
 * This component will be removed in a future update.
 */

type ScreenScaffoldProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
};

export function ScreenScaffold({ title, subtitle, onBack, children }: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGreen,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brandBlue,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
