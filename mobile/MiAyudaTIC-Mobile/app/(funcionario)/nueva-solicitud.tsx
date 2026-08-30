import { useAuth } from '@/features/auth/auth-context';
import {
  SolicitudForm,
  type PersistedFormValues,
} from '@/features/solicitudes/components/SolicitudForm';
import { useCreateSolicitud } from '@/features/solicitudes/hooks';
import type { SolicitudSubmitMeta } from '@/features/solicitudes/components/SolicitudForm';
import type { CreateSolicitudFormValues } from '@/features/solicitudes/schemas';
import { ApiError } from '@/shared/api/client';
import {
  formatSolicitudDate,
  getStatusLabel,
  type SolicitudSummary,
} from '@/shared/contracts/solicitud';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { typography } from '@/shared/theme/typography';
import { SuccessCard } from '@/shared/ui/SuccessCard';
import { Text } from '@/shared/ui/Text';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Module-level storage for form persistence
let persistedFormValues: PersistedFormValues | null = null;

/**
 * Crear tab — nueva solicitud.
 *
 * Rendered as a TAB (no push), so it owns its inline header and must NOT
 * toggle native headers via `Stack.Screen`: doing so re-enables the root
 * stack header for the whole tabs group (stray title + floating overflow
 * menu over the content).
 */
export default function NuevaSolicitudScreen() {
  const { user } = useAuth();
  const createMutation = useCreateSolicitud();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successPayload, setSuccessPayload] = useState<
    (SolicitudSummary & SolicitudSubmitMeta) | null
  >(null);
  const [persistedValues, setPersistedValues] = useState<PersistedFormValues | null>(null);

  // Restore persisted values when screen regains focus
  useFocusEffect(
    useCallback(() => {
      if (persistedFormValues && !submitted) {
        setPersistedValues(persistedFormValues);
      }
      return () => {
        // Clear persisted values when leaving screen (but not on submit)
      };
    }, [submitted]),
  );

  const handleValuesChange = useCallback((values: PersistedFormValues) => {
    persistedFormValues = values;
  }, []);

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

      // Clear persisted form after successful submission
      persistedFormValues = null;
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
            setPersistedValues(null);
            persistedFormValues = null;
            router.replace({
              pathname: '/(funcionario)/(tabs)/(historial)/solicitud/[id]',
              params: { id: solicitudId },
            });
          }}
          onVolverInicio={() => {
            setSubmitted(false);
            setSuccessPayload(null);
            setPersistedValues(null);
            persistedFormValues = null;
            router.replace('/(funcionario)/(tabs)/(home)');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2" color="primary">
          Nueva solicitud
        </Text>
      </View>
      <SolicitudForm
        defaultPhone={user?.telefono ?? ''}
        submitting={submitting}
        onSubmit={handleSubmit}
        persistedValues={persistedValues}
        onValuesChange={handleValuesChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semanticColors.surface.muted,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    ...typography.h2,
    color: semanticColors.text.primary,
  },
});
