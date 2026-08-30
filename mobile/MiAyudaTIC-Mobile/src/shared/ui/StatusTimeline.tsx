import type { TimelineStep } from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { typography } from '@/shared/theme/typography';
import { StyleSheet, Text, View } from 'react-native';

type StatusTimelineProps = {
  steps: TimelineStep[];
};

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento del caso</Text>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const dotColor =
          step.state === 'completed'
            ? semanticColors.brand.green
            : step.state === 'current'
              ? semanticColors.brand.blue
              : semanticColors.border.default;

        return (
          <View key={step.status} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {!isLast ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.content}>
              <Text
                style={[
                  styles.label,
                  step.state === 'current' && styles.labelCurrent,
                  step.state === 'upcoming' && styles.labelUpcoming,
                ]}
              >
                {step.label}
              </Text>
              {step.state === 'current' ? (
                <Text style={styles.hint}>Estado actual</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 0,
  },
  title: {
    ...typography.h3,
    color: semanticColors.text.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    minHeight: 44,
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: semanticColors.border.default,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 12,
    paddingLeft: 8,
  },
  label: {
    ...typography.p2,
    color: semanticColors.text.secondary,
  },
  labelCurrent: {
    color: semanticColors.text.primary,
    fontWeight: '800',
  },
  labelUpcoming: {
    color: semanticColors.text.tertiary,
  },
  hint: {
    ...typography.caption,
    color: semanticColors.text.secondary,
    marginTop: 2,
  },
});
