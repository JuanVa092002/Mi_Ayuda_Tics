import { StyleSheet, View } from 'react-native';
import { semanticColors } from '../theme/semantic-colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Text } from './Text';

interface BrandTitleProps {
  size?: 'large' | 'default' | 'small';
  showSubtitle?: boolean;
}

const sizeStyles = {
  large: { fontSize: 26, lineHeight: 32, letterSpacing: 0.6 },
  default: { fontSize: 20, lineHeight: 26, letterSpacing: 0.4 },
  small: { fontSize: 17, lineHeight: 22, letterSpacing: 0.3 },
} as const;

export function BrandTitle({ size = 'default', showSubtitle = false }: BrandTitleProps) {
  const resolvedSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'default';
  const metrics = sizeStyles[resolvedSize];

  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.wordmark}>
        <Text
          style={[styles.wordmarkBase, metrics]}
          accessibilityLabel="MIAYUDATICS"
        >
          <Text style={[styles.segment, metrics, styles.blue]}>MI</Text>
          <Text style={[styles.segment, metrics, styles.green]}>AYUDA</Text>
          <Text style={[styles.segment, metrics, styles.blue]}>TICS</Text>
        </Text>
      </View>
      {showSubtitle ? (
        <Text variant="caption" color="secondary" style={styles.subtitle}>
          Regional Cauca
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wordmark: {
    paddingHorizontal: spacing[2],
  },
  wordmarkBase: {
    ...typography.h1,
    textAlign: 'center',
  },
  segment: {
    ...typography.h1,
  },
  blue: {
    color: semanticColors.brand.blue,
  },
  green: {
    color: semanticColors.brand.green,
  },
  subtitle: {
    marginTop: spacing[2],
  },
});
