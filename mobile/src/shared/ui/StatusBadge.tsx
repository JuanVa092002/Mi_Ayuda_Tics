import type { SolicitudStatus } from '@/shared/contracts/solicitud';
import { getStatusLabel } from '@/shared/contracts/solicitud';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { motion } from '@/shared/theme/motion';
import { typography } from '@/shared/theme/typography';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Appearance, StyleSheet, Text, View } from 'react-native';
import {
  getTicketStateConfig,
  getTicketStatePaint,
  type TicketStateSize,
  type TicketStateVariant,
} from './ticket-state';

type StatusBadgeProps = {
  status: SolicitudStatus | string;
  label?: string;
  workflowVersion?: number | null;
  variant?: TicketStateVariant;
  size?: TicketStateSize;
};

const ICON_SIZE: Record<TicketStateSize, number> = {
  small: 11,
  medium: 13,
  large: 15,
};

export function StatusBadge({
  status,
  label,
  workflowVersion,
  variant,
  size = 'small',
}: StatusBadgeProps) {
  const config = getTicketStateConfig(status, workflowVersion);
  const scheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  const paint = getTicketStatePaint(status, { workflowVersion, variant, scheme });
  const text = label ?? (size === 'small' ? config.compactLabel : config.label);
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const previousStatus = useRef(status);

  useEffect(() => {
    if (previousStatus.current === status) return;
    previousStatus.current = status;
    if (reduceMotion) return;
    opacity.setValue(0.55);
    Animated.timing(opacity, {
      toValue: 1,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion, status]);

  return (
    <Animated.View
      style={[
        styles.badge,
        size === 'medium' && styles.medium,
        size === 'large' && styles.large,
        {
          backgroundColor: paint.background,
          borderColor: paint.border,
          borderWidth: (variant ?? config.variant) === 'outline' ? 1.5 : 0,
          opacity,
        },
      ]}
      accessibilityLabel={'Estado: ' + text}
      accessibilityRole="text"
    >
      <Feather name={config.icon} size={ICON_SIZE[size]} color={paint.icon} accessible={false} />
      <Text style={[styles.text, size !== 'small' && styles.textMedium, { color: paint.text }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: '100%',
  },
  medium: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  text: {
    ...typography.badge,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    fontWeight: '700',
    flexShrink: 1,
  },
  textMedium: {
    fontSize: 12,
    lineHeight: 16,
  },
});
