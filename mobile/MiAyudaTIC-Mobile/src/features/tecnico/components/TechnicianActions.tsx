import { canSolve, visibleTechnicianActions } from '@/features/tecnico/actions-model';
import type { SolicitudCapabilitiesDto } from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Button } from '@/shared/ui/Button';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TechnicianActionsProps = {
  capabilities?: SolicitudCapabilitiesDto;
  pending?: Partial<Record<'start' | 'update' | 'request_info' | 'solve', boolean>>;
  onStart: () => void;
  onUpdate: () => void;
  onRequestInfo: () => void;
  onSolve: () => void;
  onResolveV1?: () => void;
  showResolveV1?: boolean;
};

export function TechnicianActions({
  capabilities,
  pending,
  onStart,
  onUpdate,
  onRequestInfo,
  onSolve,
  onResolveV1,
  showResolveV1 = false,
}: TechnicianActionsProps) {
  const insets = useSafeAreaInsets();
  const actions = visibleTechnicianActions(capabilities);
  if (actions.length === 0 && !showResolveV1) return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
      {actions.includes('start') ? (
        <Button
          label="Iniciar atención"
          fullWidth
          loading={pending?.start}
          leftIcon={<Feather name="play" size={18} color={semanticColors.text.inverse} />}
          onPress={onStart}
        />
      ) : null}

      {actions.includes('update') || actions.includes('request_info') ? (
        <View style={styles.row}>
          {actions.includes('update') ? (
            <View style={styles.flex}>
              <Button label="Actualizar" variant="outline" size="medium" fullWidth loading={pending?.update} onPress={onUpdate} />
            </View>
          ) : null}
          {actions.includes('request_info') ? (
            <View style={styles.flex}>
              <Button
                label="Pedir info"
                variant="outline"
                size="medium"
                fullWidth
                loading={pending?.request_info}
                onPress={onRequestInfo}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {canSolve(capabilities) ? (
        <Button
          label="Solucionar"
          fullWidth
          loading={pending?.solve}
          leftIcon={<Feather name="check-circle" size={18} color={semanticColors.text.inverse} />}
          onPress={onSolve}
        />
      ) : null}

      {showResolveV1 ? (
        <Button label="Resolver caso" variant="secondary" fullWidth onPress={onResolveV1} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    backgroundColor: semanticColors.surface.muted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: semanticColors.border.default,
  },
  row: { flexDirection: 'row', gap: spacing[2] },
  flex: { flex: 1 },
});
