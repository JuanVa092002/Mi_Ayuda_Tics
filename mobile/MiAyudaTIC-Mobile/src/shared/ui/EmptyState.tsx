import { Feather } from '@expo/vector-icons';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Feather.glyphMap;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'inbox',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle} accessibilityRole="image">
        <Feather name={icon} size={28} color={semanticColors.brand.blue} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="outline" size="medium" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: semanticColors.surface.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.state.infoBg,
    marginBottom: spacing[1],
  },
  title: {
    ...typography.h3,
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
  description: {
    ...typography.p2,
    color: semanticColors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
