import { useAuth } from '@/features/auth/auth-context';
import {
  SolicitudForm,
  type SolicitudSubmitMeta,
} from '@/features/solicitudes/components/SolicitudForm';
import { useCreateSolicitud } from '@/features/solicitudes/hooks';
import type { CreateSolicitudFormValues } from '@/features/solicitudes/schemas';
import { clearSolicitudFormDraft } from '@/features/solicitudes/solicitud-form-draft';
import { ApiError } from '@/shared/api/client';
import {
  formatSolicitudDate,
  getStatusLabel,
  type SolicitudSummary,
} from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { SuccessCard } from '@/shared/ui/SuccessCard';
import * as Haptics from 'expo-haptics';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Nueva solicitud — full-screen modal at the funcionario group level.
 *
 * Lives outside `(tabs)`. Opening camera/gallery does not remove this route,
 * so the in-memory draft survives picker remounts. `beforeRemove` runs when
 * the modal is actually dismissed (header close, Android back, replace),
 * not when the app backgrounds for the picker.
 */
export default function NuevaSolicitudScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const createMutation = useCreateSolicitud();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successPayload, setSuccessPayload] = useState<
    (SolicitudSummary & SolicitudSubmitMeta) | null
  >(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      clearSolicitudFormDraft();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({ headerShown: !submitted });
  }, [navigation, submitted]);

  const handleSubmit = async (
    values: CreateSolicitudFormValues,
    photo?: {
      uri: string;
      mimeType?: string;
      fileName?: string;
      fileSize?: number;
      origin?: 'camera' | 'gallery';
    },
    meta?: SolicitudSubmitMeta,
  ) => {
    setSubmitting(true);
    try {
      const created = await createMutation.mutateAsync({
        environmentId: values.environmentId,
        caseTypeId: values.caseTypeId,
        description: values.description.trim(),
        phone: values.phone.trim(),
        photo,
      });

      clearSolicitudFormDraft();
      setSuccessPayload({ ...created, ...meta });
      setSubmitted(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo registrar la solicitud.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && successPayload) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <SuccessCard
          caseCode={successPayload.caseCode}
          statusLabel={getStatusLabel(successPayload.status)}
          dateLabel={formatSolicitudDate(successPayload.createdAtRaw)}
          environmentName={successPayload.environmentName}
          caseTypeName={successPayload.caseTypeName}
          onVerSolicitud={() => {
            const solicitudId = successPayload.id;
            setSubmitted(false);
            setSuccessPayload(null);
            clearSolicitudFormDraft();
            router.replace({
              pathname: '/(funcionario)/(tabs)/(historial)/solicitud/[id]',
              params: { id: solicitudId },
            });
          }}
          onVolverInicio={() => {
            setSubmitted(false);
            setSuccessPayload(null);
            clearSolicitudFormDraft();
            router.replace('/(funcionario)/(tabs)/(home)');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SolicitudForm
        defaultPhone={user?.telefono ?? ''}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semanticColors.surface.muted,
  },
});
