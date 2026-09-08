import { useIniciarAtencion } from '@/features/casos/hooks';
import { ctaForCaso, relativeWaitLabel, type TecnicoQueueTab } from '@/features/tecnico/home-model';
import type { CasoSummary } from '@/shared/contracts/caso';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { motion } from '@/shared/theme/motion';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Button } from '@/shared/ui/Button';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Text } from '@/shared/ui/Text';
import { getStatusToneColors } from '@/shared/ui/status-visual';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

type TechnicianTicketCardProps = {
  item: CasoSummary;
  queue: TecnicoQueueTab;
  onOpen: () => void;
  onUpdate?: () => void;
  onStarted?: (queued: boolean) => void;
};

function StartCta({
  casoId,
  label,
  onStarted,
}: {
  casoId: string;
  label: string;
  onStarted?: (queued: boolean) => void;
}) {
  const start = useIniciarAtencion(casoId);
  return (
    <Button
      label={label}
      size="small"
      loading={start.isPending}
      accessibilityHint="Inicia la atención de este caso"
      onPress={() => {
        start.mutate(undefined, {
          onSuccess: (result) => onStarted?.(Boolean(result?.queued)),
        });
      }}
    />
  );
}

export const TechnicianTicketCard = memo(function TechnicianTicketCard({
  item,
  queue,
  onOpen,
  onUpdate,
  onStarted,
}: TechnicianTicketCardProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  const tone = getStatusToneColors(item.status, item.workflowVersion);
  const cta = ctaForCaso(item, queue);
  const wait =
    queue === 'esperando_funcionario' || queue === 'esperando_confirmacion'
      ? relativeWaitLabel(item.createdAtRaw)
      : undefined;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <View style={styles.card}>
        <View style={[styles.accent, { backgroundColor: tone.dot }]} />
        <View style={styles.body}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.caseCode}. ${item.description}. ${item.displayStatus}`}
            accessibilityHint="Abre el detalle del caso"
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
              onOpen();
            }}
            onPressIn={() => {
              if (reduceMotion) return;
              Animated.timing(scaleValue, {
                toValue: motion.cardPressScale,
                duration: motion.duration.fast,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.timing(scaleValue, {
                toValue: 1,
                duration: motion.duration.fast,
                useNativeDriver: true,
              }).start();
            }}
            style={({ pressed }) => [styles.bodyPress, pressed && styles.pressed]}
          >
            <View style={styles.header}>
              <Text style={styles.code}>{item.caseCode}</Text>
              <StatusBadge status={item.status} workflowVersion={item.workflowVersion} />
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.environmentName ?? 'Ambiente no informado'}
              {item.requesterName ? ` · ${item.requesterName}` : ''}
            </Text>
            {wait ? (
              <Text variant="caption" color="secondary">
                {wait}
              </Text>
            ) : null}
          </Pressable>
          <View style={styles.ctaRow}>
            {cta.action === 'start' ? (
              <StartCta casoId={item.id} label={cta.label} onStarted={onStarted} />
            ) : cta.action === 'update' ? (
              <Button label={cta.label} size="small" variant="outline" onPress={() => onUpdate?.()} />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={cta.label}
                onPress={onOpen}
                style={styles.viewCta}
              >
                <Text variant="caption" color="brandBlue" style={styles.viewLabel}>
                  {cta.label}
                </Text>
                <Feather name="chevron-right" size={16} color={semanticColors.brand.blue} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  pressed: { opacity: motion.pressOpacity },
  accent: { width: 4 },
  body: {
    flex: 1,
  },
  bodyPress: {
    gap: spacing[1],
    paddingTop: spacing[3],
    paddingHorizontal: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  code: {
    ...typography.caption,
    fontWeight: '700',
    color: semanticColors.brand.blue,
    fontVariant: ['tabular-nums'],
  },
  title: {
    ...typography.p2,
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: semanticColors.text.secondary,
  },
  ctaRow: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    paddingTop: spacing[2],
    alignItems: 'flex-start',
  },
  viewCta: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewLabel: { fontWeight: '700' },
});
