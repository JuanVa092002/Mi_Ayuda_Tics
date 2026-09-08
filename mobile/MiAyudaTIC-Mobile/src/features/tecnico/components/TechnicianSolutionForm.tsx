import { isWorkflowTextValid } from '@/features/tecnico/actions-model';
import { promptTechnicianEvidence, type TechnicianPhoto } from '@/features/tecnico/pick-evidence';
import type { SolicitudCapabilitiesDto } from '@/shared/contracts/solicitud';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Text } from '@/shared/ui/Text';
import { WorkflowManualRetryNotice } from '@/shared/ui/WorkflowManualRetryNotice';
import { TechnicianSheet } from '@/features/tecnico/components/TechnicianSheet';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TechnicianSolutionKind = 'partial' | 'total';

export type TechnicianSolutionPayload = {
  kind: TechnicianSolutionKind;
  queSeHizo: string;
  queFalta?: string;
  siguienteAccion?: string;
  fechaEsperada?: string;
  causaIdentificada?: string;
  evidence?: TechnicianPhoto;
};

type TechnicianSolutionFormProps = {
  visible: boolean;
  capabilities?: SolicitudCapabilitiesDto;
  submitting: boolean;
  error: unknown;
  lastPayload?: unknown;
  onClose: () => void;
  onSubmit: (payload: TechnicianSolutionPayload) => void;
  onRetry: () => void;
};

export function TechnicianSolutionForm({
  visible,
  capabilities,
  submitting,
  error,
  lastPayload,
  onClose,
  onSubmit,
  onRetry,
}: TechnicianSolutionFormProps) {
  const insets = useSafeAreaInsets();
  const canPartial = capabilities?.canPartialSolution === true;
  const canTotal = capabilities?.canResolve === true;
  const [kind, setKind] = useState<TechnicianSolutionKind>(canTotal && !canPartial ? 'total' : 'partial');
  const [queSeHizo, setQueSeHizo] = useState('');
  const [queFalta, setQueFalta] = useState('');
  const [siguienteAccion, setSiguienteAccion] = useState('');
  const [fechaEsperada, setFechaEsperada] = useState('');
  const [causaIdentificada, setCausaIdentificada] = useState('');
  const [evidence, setEvidence] = useState<TechnicianPhoto | undefined>();

  useEffect(() => {
    if (!visible) {
      setQueSeHizo('');
      setQueFalta('');
      setSiguienteAccion('');
      setFechaEsperada('');
      setCausaIdentificada('');
      setEvidence(undefined);
      setKind(canTotal && !canPartial ? 'total' : 'partial');
    }
  }, [visible, canPartial, canTotal]);

  const didWork = isWorkflowTextValid(queSeHizo);
  const valid =
    kind === 'total'
      ? didWork
      : didWork && isWorkflowTextValid(queFalta) && isWorkflowTextValid(siguienteAccion);

  const currentPayload: TechnicianSolutionPayload = {
    kind,
    queSeHizo: queSeHizo.trim(),
    queFalta: queFalta.trim() || undefined,
    siguienteAccion: siguienteAccion.trim() || undefined,
    fechaEsperada: fechaEsperada.trim() || undefined,
    causaIdentificada: causaIdentificada.trim() || undefined,
    evidence,
  };

  return (
    <TechnicianSheet visible={visible} onClose={onClose}>
        <View style={[styles.header, { paddingTop: insets.top + spacing[3] }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={onClose} style={styles.close}>
            <Feather name="x" size={22} color={semanticColors.brand.blue} />
          </Pressable>
          <Text variant="h2">Registrar solución</Text>
          <View style={styles.close} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {canPartial && canTotal ? (
            <View style={styles.segment} accessibilityRole="tablist">
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: kind === 'partial' }}
                onPress={() => setKind('partial')}
                style={[styles.segmentItem, kind === 'partial' && styles.segmentActive]}
              >
                <Text variant="caption" color={kind === 'partial' ? 'inverse' : 'secondary'} style={styles.segmentLabel}>
                  Parcial
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: kind === 'total' }}
                onPress={() => setKind('total')}
                style={[styles.segmentItem, kind === 'total' && styles.segmentActive]}
              >
                <Text variant="caption" color={kind === 'total' ? 'inverse' : 'secondary'} style={styles.segmentLabel}>
                  Total
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Text variant="p2" color="secondary">
            {kind === 'total'
              ? 'El caso pasa a resuelto. El funcionario debe confirmar.'
              : 'El caso sigue abierto. Deja claro qué falta y cuál es el siguiente paso.'}
          </Text>

          <FormField
            label="Qué se hizo"
            placeholder="Trabajo realizado en campo"
            value={queSeHizo}
            onChangeText={setQueSeHizo}
            multiline
          />

          {kind === 'partial' ? (
            <>
              <FormField
                label="Qué falta"
                placeholder="Pendiente para cerrar el caso"
                value={queFalta}
                onChangeText={setQueFalta}
                multiline
              />
              <FormField
                label="Siguiente acción"
                placeholder="Qué harás después"
                value={siguienteAccion}
                onChangeText={setSiguienteAccion}
                multiline
              />
              <FormField
                label="Fecha esperada (opcional)"
                placeholder="YYYY-MM-DD"
                value={fechaEsperada}
                onChangeText={setFechaEsperada}
              />
            </>
          ) : (
            <FormField
              label="Causa identificada (opcional)"
              placeholder="Qué originó el incidente"
              value={causaIdentificada}
              onChangeText={setCausaIdentificada}
              multiline
            />
          )}

          <View style={styles.photoBlock}>
            {evidence ? (
              <Image source={{ uri: evidence.uri }} style={styles.photo} accessibilityLabel="Evidencia de la solución" />
            ) : null}
            <Button
              label={evidence ? 'Cambiar evidencia' : 'Adjuntar evidencia'}
              variant="outline"
              size="medium"
              leftIcon={<Feather name="camera" size={16} color={semanticColors.brand.blue} />}
              onPress={() => promptTechnicianEvidence(setEvidence)}
            />
          </View>

          <WorkflowManualRetryNotice
            error={error}
            lastPayload={lastPayload}
            currentPayload={currentPayload}
            pending={submitting}
            onRetry={onRetry}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing[4]) }]}>
          <Button
            label={kind === 'total' ? 'Registrar solución total' : 'Registrar solución parcial'}
            fullWidth
            loading={submitting}
            disabled={!valid || submitting}
            onPress={() => onSubmit(currentPayload)}
          />
        </View>
    </TechnicianSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
  },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: spacing[5], paddingBottom: spacing[8], gap: spacing[4] },
  segment: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentActive: { backgroundColor: semanticColors.brand.blue },
  segmentLabel: { fontWeight: '700' },
  photoBlock: { gap: spacing[3] },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: semanticColors.surface.well,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.muted,
  },
});
