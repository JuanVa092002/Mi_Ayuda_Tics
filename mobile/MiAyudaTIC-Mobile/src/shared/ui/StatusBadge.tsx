import type { SolicitudStatus } from '@/shared/contracts/solicitud';
import { getStatusLabel } from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { StyleSheet, Text, View } from 'react-native';

type StatusBadgeProps = {
  status: SolicitudStatus | string;
  label?: string;
  workflowVersion?: number | null;
};

const WARNING_TEXT = semanticColors.state.warningText;

function paletteFor(status: string): { bg: string; text: string } {
  if (status === 'finalizado' || status === 'cerrado' || status === 'cancelado') {
    return { bg: semanticColors.state.successBg, text: semanticColors.state.success };
  }
  if (status === 'pendiente' || status === 'esperando_usuario' || status === 'resuelto') {
    return { bg: semanticColors.state.warningBg, text: WARNING_TEXT };
  }
  return { bg: semanticColors.state.infoBg, text: semanticColors.state.info };
}

export function StatusBadge({ status, label, workflowVersion }: StatusBadgeProps) {
  const text = label ?? getStatusLabel(status, workflowVersion);
  const palette = paletteFor(status);

  return (
    <View
      style={[styles.badge, { backgroundColor: palette.bg }]}
      accessibilityLabel={'Estado: ' + text}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: palette.text }]}>{text}</Text>
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
