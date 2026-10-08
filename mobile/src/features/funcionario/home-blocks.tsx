import type { HomeAttention, HomeInsight, HomeMetricKey } from '@/features/funcionario/home-model';
import { firstNameFrom, getTimeBasedGreeting, initialsFromName } from '@/features/funcionario/home-model';
import { motion } from '@/shared/theme/motion';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import { getTicketStatePaint } from '@/shared/ui/ticket-state';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

function usePressScale() {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  return {
    scaleValue,
    onPressIn: () => {
      if (reduceMotion) return;
      Animated.timing(scaleValue, {
        toValue: motion.cardPressScale,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }).start();
    },
    onPressOut: () => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }).start();
    },
  };
}

export function HomeHeader({ fullName, scanLine, onProfile }: { fullName: string; scanLine: string; onProfile: () => void }) {
  const firstName = firstNameFrom(fullName);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <BrandTitle size="small" showSubtitle />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir cuenta de ${fullName}`}
          accessibilityHint="Abre tu información de cuenta"
          onPress={onProfile}
          style={({ pressed }) => [styles.profileButton, pressed && styles.profileButtonPressed]}
        >
          <View style={styles.avatar} accessible={false}>
            <Text style={styles.avatarText}>{initialsFromName(fullName)}</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.heroCopy}>
        <Text variant="h1" color="primary" style={styles.heroTitle}>
          {getTimeBasedGreeting()}, {firstName}
        </Text>
        <Text variant="p2" color="secondary">
          {scanLine}
        </Text>
      </View>
    </View>
  );
}

export function HomeCreateCta({ onPress }: { onPress: () => void }) {
  return (
    <Button
      label="Crear solicitud"
      variant="primary"
      fullWidth
      leftIcon={<Feather name="plus" size={18} color={semanticColors.text.inverse} />}
      onPress={onPress}
    />
  );
}

export function HomeMetrics({
  insight,
  onSelect,
}: {
  insight: HomeInsight;
  onSelect: (key: HomeMetricKey) => void;
}) {
  const percent = Math.round(insight.progress * 100);

  return (
    <View style={styles.metricsBlock} accessibilityRole="summary" accessibilityLabel={insight.scanLine}>
      <View style={styles.metricsRow}>
        <MetricTile
          value={insight.unassigned}
          label="Por asignar"
          onPress={() => onSelect('unassigned')}
        />
        <MetricTile
          value={insight.inProgress}
          label="En proceso"
          emphasized={insight.yourTurn > 0}
          onPress={() => onSelect('inProgress')}
        />
        <MetricTile
          value={insight.closed}
          label="Cerradas"
          success
          onPress={() => onSelect('closed')}
        />
      </View>
      {insight.total > 0 ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text variant="caption" color="secondary">
            {insight.closed} de {insight.total} cerradas
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function MetricTile({
  value,
  label,
  emphasized = false,
  success = false,
  onPress,
}: {
  value: number;
  label: string;
  emphasized?: boolean;
  success?: boolean;
  onPress: () => void;
}) {
  const { scaleValue, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={[styles.metricAnim, { transform: [{ scale: scaleValue }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${value} ${label}`}
        accessibilityHint="Abre tus solicitudes con este filtro"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.metricTile,
          emphasized && styles.metricTileEmphasized,
          success && styles.metricTileSuccess,
          pressed && styles.metricPressed,
        ]}
      >
        <Text
          style={[
            styles.metricValue,
            emphasized && styles.metricValueEmphasized,
            success && styles.metricValueSuccess,
          ]}
        >
          {value}
        </Text>
        <Text variant="caption" color="secondary" style={styles.metricLabel}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function HomeAttentionCard({
  attention,
  onPress,
}: {
  attention: HomeAttention;
  onPress: () => void;
}) {
  const warning = attention.kind === 'reply';
  const { scaleValue, onPressIn, onPressOut } = usePressScale();
  const paint = getTicketStatePaint(warning ? 'esperando_usuario' : 'resuelto', { variant: 'tint' });

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${attention.title}. ${attention.detail}. ${attention.cta}`}
        accessibilityHint="Abre el caso que requiere tu acción"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.attentionCard,
          {
            backgroundColor: paint.tintBackground,
            borderColor: paint.accent,
          },
          pressed && styles.metricPressed,
        ]}
      >
        <View style={[styles.attentionIcon, { borderColor: paint.accent }]}>
          <Feather
            name={warning ? 'alert-triangle' : 'check-circle'}
            size={20}
            color={paint.icon}
          />
        </View>
        <View style={styles.attentionCopy}>
          <Text variant="h3">{attention.title}</Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {attention.detail}
          </Text>
        </View>
        <View style={styles.attentionCta}>
          <Text variant="caption" color="brandBlue" style={styles.attentionCtaLabel}>
            {attention.cta}
          </Text>
          <Feather name="chevron-right" size={16} color={semanticColors.brand.blue} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function HomeRecentHeader({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="h2">Recientes</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver todas las solicitudes"
        onPress={onPress}
        style={styles.viewAllButton}
      >
        <Text variant="p2" color="link" style={styles.viewAllText}>
          Ver todas
        </Text>
        <Feather name="arrow-up-right" size={16} color={semanticColors.brand.blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[5] },
  headerTop: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileButton: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  profileButtonPressed: { backgroundColor: semanticColors.surface.well },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.brand.blue,
  },
  avatarText: { ...typography.caption, color: semanticColors.text.inverse, fontWeight: '700' },
  heroCopy: { gap: spacing[1] },
  heroTitle: { maxWidth: 345 },
  metricsBlock: { gap: spacing[3] },
  metricsRow: { flexDirection: 'row', gap: spacing[2] },
  metricAnim: { flex: 1 },
  metricTile: {
    minHeight: 88,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  metricTileEmphasized: {
    backgroundColor: semanticColors.state.warningBg,
    borderColor: semanticColors.state.warning,
  },
  metricTileSuccess: {
    backgroundColor: semanticColors.state.successBg,
    borderColor: semanticColors.state.successBg,
  },
  metricPressed: { opacity: motion.pressOpacity },
  metricValue: {
    fontVariant: ['tabular-nums'],
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: semanticColors.text.primary,
  },
  metricValueEmphasized: { color: semanticColors.state.warningText },
  metricValueSuccess: { color: semanticColors.brand.green },
  metricLabel: { textAlign: 'center' },
  progressBlock: { gap: spacing[2] },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: semanticColors.surface.well,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: semanticColors.brand.green,
  },
  attentionCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  attentionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.surface.card,
    borderWidth: 1.5,
  },
  attentionCopy: { flex: 1, gap: 2, minWidth: 0 },
  attentionCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  attentionCtaLabel: { fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  viewAllButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingLeft: spacing[2] },
  viewAllText: { fontWeight: '700' },
});
