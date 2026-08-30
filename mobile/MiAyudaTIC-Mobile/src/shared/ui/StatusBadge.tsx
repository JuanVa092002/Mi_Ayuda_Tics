import type { SolicitudStatus } from '@/shared/contracts/solicitud';
import { getStatusLabel } from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { StyleSheet, Text, View } from 'react-native';

type StatusBadgeProps = {
  status: SolicitudStatus;
};

/** Dark warning text per mobile-color-spec.md for accessible contrast on warningBg. */
const WARNING_TEXT = semanticColors.state.warningText;

const STATUS_COLORS: Record<SolicitudStatus, { bg: string; text: string }> = {
  solicitado: { bg: semanticColors.state.infoBg, text: semanticColors.state.info },
  asignado: { bg: semanticColors.state.infoBg, text: semanticColors.state.info },
  pendiente: { bg: semanticColors.state.warningBg, text: WARNING_TEXT },
  finalizado: { bg: semanticColors.state.successBg, text: semanticColors.state.success },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const palette = STATUS_COLORS[status] ?? STATUS_COLORS.solicitado;

  return (
    <View
      style={[styles.badge, { backgroundColor: palette.bg }]}
      accessibilityLabel={'Estado: ' + getStatusLabel(status)}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: palette.text }]}>{getStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
