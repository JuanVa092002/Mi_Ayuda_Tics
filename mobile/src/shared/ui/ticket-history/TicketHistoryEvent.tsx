import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Text } from '@/shared/ui/Text';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { TicketHistoryEvidence } from './TicketHistoryEvidence';
import {
  buildEventCopy,
  eventAccessibilityLabel,
  formatEventTime,
  getEventVisual,
  type TicketHistoryEventData,
  type TicketHistoryIconName,
} from './ticket-history-model';

const ICON_SIZE: Record<TicketHistoryIconName, number> = {
  'file-text': 15,
  'user-plus': 15,
  'refresh-cw': 14,
  'play-circle': 16,
  'message-circle': 14,
  clock: 14,
  tool: 14,
  'check-circle': 16,
  'rotate-ccw': 14,
  flag: 14,
  'x-circle': 16,
};

type TicketHistoryEventProps = {
  event: TicketHistoryEventData;
  isFirst: boolean;
  isLast: boolean;
};

export function TicketHistoryEvent({ event, isFirst, isLast }: TicketHistoryEventProps) {
  const visual = getEventVisual(event.type);
  const copy = buildEventCopy(event);
  const time = formatEventTime(event.createdAt);
  const prominent = visual.prominence === 'prominent';
  const nodeSize = prominent ? 32 : 24;

  return (
    <View style={styles.row}>
      <View style={styles.rail} importantForAccessibility="no-hide-descendants">
        <View style={[styles.line, styles.lineTop, isFirst && styles.lineHidden]} />
        <View
          style={[
            styles.node,
            {
              width: nodeSize,
              height: nodeSize,
              backgroundColor: visual.background,
              borderColor: visual.color,
            },
          ]}
        >
          <Feather name={visual.icon} size={ICON_SIZE[visual.icon]} color={visual.color} />
        </View>
        <View style={[styles.line, styles.lineBottom, isLast && styles.lineHidden]} />
      </View>

      <View style={[styles.body, prominent && styles.bodyProminent, prominent && { backgroundColor: visual.background }]}>
        <View style={styles.identity} accessibilityElementsHidden>
          <View style={[styles.avatar, { backgroundColor: visual.color }]}>
            <Text variant="badge" color="inverse" style={styles.initials}>
              {copy.initials}
            </Text>
          </View>
          <View style={styles.identityCopy}>
            <Text variant="caption" color="primary" numberOfLines={1}>
              {copy.authorName}
            </Text>
            <Text variant="caption" color="tertiary" numberOfLines={1}>
              {copy.roleLabel}
            </Text>
          </View>
          {time ? (
            <Text variant="caption" color="tertiary" style={styles.time}>
              {time}
            </Text>
          ) : null}
        </View>

        <Text
          variant={prominent ? 'p2' : 'caption'}
          color="primary"
          style={styles.headline}
          accessibilityRole="text"
          accessibilityLabel={eventAccessibilityLabel(event, copy)}
        >
          {copy.headline}
        </Text>

        {copy.detail ? (
          <Text variant="caption" color="secondary" style={styles.detail}>
            {copy.detail}
          </Text>
        ) : null}

        <TicketHistoryEvidence attachment={event.attachment} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing[3],
  },
  rail: {
    width: 32,
    alignItems: 'center',
  },
  line: {
    width: 2,
    flexGrow: 1,
    backgroundColor: 'rgba(4, 50, 77, 0.16)',
  },
  lineTop: {
    minHeight: 2,
  },
  lineBottom: {
    minHeight: 10,
  },
  lineHidden: {
    backgroundColor: 'transparent',
  },
  node: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingBottom: spacing[4],
    minWidth: 0,
  },
  bodyProminent: {
    borderRadius: radius.sm,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.2,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  time: {
    flexShrink: 0,
    marginTop: 1,
  },
  headline: {
    lineHeight: 20,
  },
  detail: {
    marginTop: spacing[1],
    lineHeight: 18,
  },
});
