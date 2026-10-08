import type { SolicitudSummary } from '@/shared/contracts/solicitud';
import { formatSolicitudDate } from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { getStatusToneColors } from './status-visual';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useRef } from 'react';
import { motion } from '@/shared/theme/motion';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

type SolicitudListItemProps = {
  item: SolicitudSummary;
  onPress: () => void;
  variant?: 'flush' | 'card';
  showDivider?: boolean;
};

export function SolicitudListItem({
  item,
  onPress,
  variant = 'flush',
  showDivider = true,
}: SolicitudListItemProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  const tone = getStatusToneColors(item.status, item.workflowVersion);

  const handlePressIn = () => {
    if (reduceMotion) return;
    Animated.timing(scaleValue, {
      toValue: motion.cardPressScale,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Solicitud ${item.caseCode}, ${item.displayStatus}`}
        accessibilityHint="Abre el detalle y el seguimiento de la solicitud"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.row,
          variant === 'card' ? styles.rowCard : styles.rowFlush,
          variant === 'flush' && !showDivider && styles.rowFlushLast,
          pressed && styles.pressed,
        ]}
      >
        {variant === 'card' ? <View style={[styles.statusAccent, { backgroundColor: tone.dot }]} /> : null}
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.code}>{item.caseCode}</Text>
            <StatusBadge status={item.status} workflowVersion={item.workflowVersion} />
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.date} numberOfLines={1}>
            {formatSolicitudDate(item.createdAtRaw)}
            {item.environmentName ? ` · ${item.environmentName}` : ''}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={semanticColors.text.tertiary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 72,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  rowFlush: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: semanticColors.border.default,
  },
  rowFlushLast: {
    borderBottomWidth: 0,
  },
  rowCard: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    overflow: 'hidden',
    paddingLeft: spacing[4] + 4,
  },
  statusAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  pressed: {
    backgroundColor: semanticColors.surface.muted,
  },
  body: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
  },
  code: {
    ...typography.caption,
    color: semanticColors.text.secondary,
    fontWeight: '700',
    flexShrink: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  date: {
    fontSize: 12,
    lineHeight: 16,
    color: semanticColors.text.tertiary,
  },
});
