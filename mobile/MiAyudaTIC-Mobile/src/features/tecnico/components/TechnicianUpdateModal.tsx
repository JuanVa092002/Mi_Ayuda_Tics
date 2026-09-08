import { isWorkflowTextValid } from '@/features/tecnico/actions-model';
import { promptTechnicianEvidence, type TechnicianPhoto } from '@/features/tecnico/pick-evidence';
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

export type TechnicianUpdateMode = 'update' | 'request_info';

type TechnicianUpdateModalProps = {
  visible: boolean;
  mode: TechnicianUpdateMode;
  submitting: boolean;
  error: unknown;
  lastPayload?: unknown;
  onClose: () => void;
  onSubmit: (mensaje: string, evidence?: TechnicianPhoto) => void;
  onRetry: () => void;
};

export function TechnicianUpdateModal({
  visible,
  mode,
  submitting,
  error,
  lastPayload,
  onClose,
  onSubmit,
  onRetry,
}: TechnicianUpdateModalProps) {
  const insets = useSafeAreaInsets();
  const [mensaje, setMensaje] = useState('');
  const [evidence, setEvidence] = useState<TechnicianPhoto | undefined>();
  const allowPhoto = mode === 'update';
  const valid = isWorkflowTextValid(mensaje);

  useEffect(() => {
    if (!visible) {
      setMensaje('');
      setEvidence(undefined);
    }
  }, [visible]);

  const title = mode === 'update' ? 'Agregar actualización' : 'Pedir información';
  const submitLabel = mode === 'update' ? 'Agregar actualización' : 'Solicitar información';
  const placeholder =
    mode === 'update'
      ? 'Qué hiciste, qué viste o qué sigue'
      : 'Qué información o evidencia necesitas del funcionario';

  return (
    <TechnicianSheet visible={visible} onClose={onClose}>
        <View style={[styles.header, { paddingTop: insets.top + spacing[3] }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={onClose} style={styles.close}>
            <Feather name="x" size={22} color={semanticColors.brand.blue} />
          </Pressable>
          <Text variant="h2">{title}</Text>
          <View style={styles.close} />
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <FormField
            label="Mensaje"
            placeholder={placeholder}
            value={mensaje}
            onChangeText={setMensaje}
            multiline
            error={mensaje.length > 0 && !valid ? 'Escribe al menos 3 caracteres' : undefined}
          />
          {allowPhoto ? (
            <View style={styles.photoBlock}>
              {evidence ? (
                <Image source={{ uri: evidence.uri }} style={styles.photo} accessibilityLabel="Evidencia adjunta" />
              ) : null}
              <Button
                label={evidence ? 'Cambiar foto' : 'Adjuntar foto'}
                variant="outline"
                size="medium"
                leftIcon={<Feather name="camera" size={16} color={semanticColors.brand.blue} />}
                onPress={() => promptTechnicianEvidence(setEvidence)}
              />
            </View>
          ) : (
            <Text variant="caption" color="secondary">
              El funcionario recibirá una notificación para responder.
            </Text>
          )}
          <WorkflowManualRetryNotice
            error={error}
            lastPayload={lastPayload}
            currentPayload={mode === 'update' ? { mensaje: mensaje.trim(), evidence } : mensaje.trim()}
            pending={submitting}
            onRetry={onRetry}
          />
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing[4]) }]}>
          <Button
            label={submitLabel}
            fullWidth
            loading={submitting}
            disabled={!valid || submitting}
            onPress={() => onSubmit(mensaje.trim(), evidence)}
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
