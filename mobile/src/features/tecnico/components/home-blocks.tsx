import {
  firstNameFrom,
  getTimeBasedGreeting,
  initialsFromName,
  mosaicCount,
  type TecnicoFocus,
  type TecnicoInsight,
  type TecnicoMosaicKey,
} from '@/features/tecnico/home-model';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { motion } from '@/shared/theme/motion';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Text } from '@/shared/ui/Text';
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

export function TechnicianHeader({
  fullName,
  scanLine,
  onProfile,
}: {
  fullName: string;
  scanLine: string;
  onProfile: () => void;
}) {
  const firstName = firstNameFrom(fullName);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <BrandTitle size="small" showSubtitle />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cerrar sesión de ${fullName}`}
          accessibilityHint="Cierra la sesión de técnico"
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

const MOSAICS: { key: TecnicoMosaicKey; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'porHacer', label: 'Por hacer', icon: 'clipboard' },
  { key: 'enCurso', label: 'En curso', icon: 'tool' },
  { key: 'esperandole', label: 'Esperándole', icon: 'clock' },
];

export function TechnicianMosaics({
  insight,
  focus,
  onSelect,
}: {
  insight: TecnicoInsight;
  focus: TecnicoFocus;
  onSelect: (key: TecnicoMosaicKey) => void;
}) {
  return (
    <View style={styles.metricsRow} accessibilityRole="summary" accessibilityLabel={insight.scanLine}>
      {MOSAICS.map((item) => (
        <MosaicTile
          key={item.key}
          value={mosaicCount(insight, item.key)}
          label={item.label}
          icon={item.icon}
          selected={focus === item.key}
          emphasized={item.key === 'porHacer' && insight.porIniciar > 0}
          onPress={() => onSelect(item.key)}
        />
      ))}
    </View>
  );
}

function MosaicTile({
  value,
  label,
  icon,
  selected,
  emphasized,
  onPress,
}: {
  value: number;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  emphasized: boolean;
  onPress: () => void;
}) {
  const { scaleValue, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={[styles.metricAnim, { transform: [{ scale: scaleValue }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${value} ${label}`}
        accessibilityState={{ selected }}
        accessibilityHint="Filtra tu cola a este estado"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.metricTile,
          emphasized && styles.metricTileEmphasized,
          selected && styles.metricTileSelected,
          pressed && styles.metricPressed,
        ]}
      >
        <Feather name={icon} size={18} color={selected ? semanticColors.text.inverse : semanticColors.brand.blue} />
        <Text
          style={[
            styles.metricValue,
            emphasized && styles.metricValueEmphasized,
            selected && styles.metricValueSelected,
          ]}
        >
          {value}
        </Text>
        <Text
          variant="caption"
          color={selected ? 'inverse' : 'secondary'}
          style={styles.metricLabel}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function TechnicianToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Feather name="check-circle" size={16} color={semanticColors.brand.green} />
      <Text variant="p2" color="primary" style={styles.toastText}>
        {message}
      </Text>
    </View>
  );
}

export function OfflineBanner({
  fromCache,
  pendingCount,
  conflict,
}: {
  fromCache: boolean;
  pendingCount: number;
  conflict?: boolean;
}) {
  if (conflict) {
    return (
      <View style={[styles.banner, styles.bannerConflict]} accessibilityRole="alert">
        <Feather name="alert-triangle" size={16} color={semanticColors.state.error} />
        <Text variant="caption" color="error" style={styles.bannerText}>
          Hubo un cambio concurrente. Revisa el historial y vuelve a enviar.
        </Text>
      </View>
    );
  }
  if (!fromCache && pendingCount === 0) return null;
  const copy =
    pendingCount > 0
      ? `${pendingCount} acción${pendingCount === 1 ? '' : 'es'} pendiente${pendingCount === 1 ? '' : 's'} de sincronizar.`
      : 'Sin conexión. Mostrando tu cola guardada.';
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Feather name="wifi-off" size={16} color={semanticColors.brand.blue} />
      <Text variant="caption" color="secondary" style={styles.bannerText}>
        {copy}
      </Text>
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
  metricsRow: { flexDirection: 'row', gap: spacing[2] },
  metricAnim: { flex: 1 },
  metricTile: {
    minHeight: 96,
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
  metricTileSelected: {
    backgroundColor: semanticColors.brand.blue,
    borderColor: semanticColors.brand.blue,
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
  metricValueSelected: { color: semanticColors.text.inverse },
  metricLabel: { textAlign: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: semanticColors.state.successBg,
    borderWidth: 1,
    borderColor: semanticColors.brand.green,
  },
  toastText: { flex: 1, fontWeight: '600' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: semanticColors.state.infoBg,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  bannerConflict: {
    backgroundColor: semanticColors.state.errorBg,
    borderColor: semanticColors.state.error,
  },
  bannerText: { flex: 1 },
});
