import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Text } from '@/shared/ui/Text';
import { StyleSheet, View } from 'react-native';
import { TicketHistoryEvent } from './TicketHistoryEvent';
import type { TicketHistoryDayGroup } from './ticket-history-model';

type TicketHistoryGroupProps = {
  group: TicketHistoryDayGroup;
};

export function TicketHistoryGroup({ group }: TicketHistoryGroupProps) {
  return (
    <View style={styles.group}>
      <View style={styles.header} accessibilityRole="header" accessibilityLabel={group.label}>
        <View style={styles.rule} />
        <Text variant="label" color="secondary" style={styles.label}>
          {group.label}
        </Text>
        <View style={styles.rule} />
      </View>
      {group.events.map((event, index) => (
        <TicketHistoryEvent
          key={event.id ?? `${event.type}-${event.createdAt}-${index}`}
          event={event}
          isFirst={index === 0}
          isLast={index === group.events.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: semanticColors.border.default,
  },
  label: {
    letterSpacing: 0.2,
  },
});
