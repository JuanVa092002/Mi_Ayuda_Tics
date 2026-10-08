import { Feather } from '@expo/vector-icons';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle} accessibilityRole="image">
        <Feather name="alert-circle" size={28} color={semanticColors.state.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button label={retryLabel} variant="secondary" size="medium" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: semanticColors.state.errorBg,
    borderRadius: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.surface.card,
  },
  title: {
    ...typography.h3,
    color: semanticColors.state.error,
    textAlign: 'center',
  },
  message: {
    ...typography.p2,
    color: semanticColors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
});
