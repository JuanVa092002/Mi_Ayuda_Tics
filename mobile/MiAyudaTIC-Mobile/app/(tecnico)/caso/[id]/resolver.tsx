import { ResolverCasoForm } from '@/features/casos/components/ResolverCasoForm';
import { useCasoDetalle, useResolverCaso } from '@/features/casos/hooks';
import type { ResolveCasoFormValues } from '@/features/casos/schemas';
import { ApiError } from '@/shared/api/client';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ScreenScaffold } from '@/shared/ui/ScreenScaffold';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

export default function ResolverCasoScreen() {
  const { id, caseTypeId } = useLocalSearchParams<{ id: string; caseTypeId?: string }>();
  const casoId = Array.isArray(id) ? id[0] : id ?? '';
  const defaultCaseTypeId = Array.isArray(caseTypeId) ? caseTypeId[0] ?? '' : caseTypeId ?? '';
  const detalleQuery = useCasoDetalle(casoId);
  const resolverMutation = useResolverCaso(casoId);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    values: ResolveCasoFormValues,
    evidence?: { uri: string; mimeType?: string; fileName?: string },
  ) => {
    setSubmitting(true);
    try {
      const result = await resolverMutation.mutateAsync({
        solutionDescription: values.solutionDescription.trim(),
        caseTypeId: values.caseTypeId,
        solutionType: values.solutionType,
        evidenceUri: evidence?.uri,
        evidenceMimeType: evidence?.mimeType,
        evidenceFileName: evidence?.fileName,
      });

      Alert.alert('Solución registrada', result.message, [
        {
          text: 'Volver al inicio',
          onPress: () => router.replace('/(tecnico)/home'),
        },
        {
          text: 'Ver detalle',
          onPress: () =>
            router.replace({
              pathname: '/(tecnico)/caso/[id]',
              params: { id: casoId },
            }),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo registrar la solución.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenScaffold
      title="Resolver caso"
      subtitle={detalleQuery.data?.caseCode}
      onBack={() => router.back()}
    >
      <QueryBoundary
        isLoading={detalleQuery.isLoading}
        isError={detalleQuery.isError}
        error={detalleQuery.error}
        hasData={detalleQuery.dataUpdatedAt > 0}
        onRetry={() => void detalleQuery.refetch()}
      >
        <ResolverCasoForm
          defaultCaseTypeId={defaultCaseTypeId}
          submitting={submitting}
          onSubmit={(values, evidence) => void handleSubmit(values, evidence)}
        />
      </QueryBoundary>
    </ScreenScaffold>
  );
}
