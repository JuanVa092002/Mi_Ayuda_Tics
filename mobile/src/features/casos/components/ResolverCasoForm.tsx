import { useTiposCaso } from '@/features/solicitudes/hooks';
import { resolveCasoSchema, type ResolveCasoFormValues } from '@/features/casos/schemas';
import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { FormField } from '@/shared/ui/FormField';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SelectField } from '@/shared/ui/SelectField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type ResolverCasoPhoto = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
};

type ResolverCasoFormProps = {
  defaultCaseTypeId?: string;
  submitting: boolean;
  onSubmit: (values: ResolveCasoFormValues, evidence?: ResolverCasoPhoto) => void;
};

const SOLUTION_TYPE_OPTIONS = [
  { label: 'Marcar como pendiente', value: 'pendiente' },
  { label: 'Finalizar caso', value: 'finalizado' },
];

export function ResolverCasoForm({
  defaultCaseTypeId = '',
  submitting,
  onSubmit,
}: ResolverCasoFormProps) {
  const tiposQuery = useTiposCaso();
  const [evidence, setEvidence] = useState<ResolverCasoPhoto | undefined>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResolveCasoFormValues>({
    resolver: zodResolver(resolveCasoSchema),
    defaultValues: {
      caseTypeId: defaultCaseTypeId,
      solutionDescription: '',
      solutionType: 'finalizado',
    },
  });

  const pickEvidence = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para adjuntar evidencia.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setEvidence({
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        fileName: asset.fileName ?? undefined,
        fileSize: asset.fileSize,
      });
    }
  };

  return (
    <QueryBoundary
      isLoading={tiposQuery.isLoading}
      isError={tiposQuery.isError}
      error={tiposQuery.error}
      hasData={tiposQuery.dataUpdatedAt > 0}
      onRetry={() => void tiposQuery.refetch()}
      isEmpty={!tiposQuery.isLoading && (tiposQuery.data?.length ?? 0) === 0}
      emptyTitle="Sin tipos de caso"
      emptyDescription="No hay tipos de caso disponibles para registrar la solución."
    >
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="caseTypeId"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Tipo de caso"
              value={value}
              onChange={onChange}
              error={errors.caseTypeId?.message}
              options={(tiposQuery.data ?? []).map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          )}
        />

        <Controller
          control={control}
          name="solutionDescription"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormField
              label="Descripción de la solución"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.solutionDescription?.message}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              placeholder="Describe lo realizado para resolver el caso"
            />
          )}
        />

        <Controller
          control={control}
          name="solutionType"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Resultado"
              value={value}
              onChange={onChange}
              error={errors.solutionType?.message}
              options={SOLUTION_TYPE_OPTIONS}
            />
          )}
        />

        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Evidencia (opcional)</Text>
          {evidence ? (
            <Image source={{ uri: evidence.uri }} style={styles.preview} contentFit="cover" />
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => void pickEvidence()}
            style={styles.photoButton}
          >
            <Text style={styles.photoButtonText}>
              {evidence ? 'Cambiar evidencia' : 'Adjuntar evidencia'}
            </Text>
          </Pressable>
          {evidence ? (
            <Pressable accessibilityRole="button" onPress={() => setEvidence(undefined)}>
              <Text style={styles.removePhoto}>Quitar evidencia</Text>
            </Pressable>
          ) : null}
        </View>

        <AppButton
          label={submitting ? 'Guardando...' : 'Registrar solución'}
          variant="green"
          disabled={submitting}
          onPress={handleSubmit((values) => onSubmit(values, evidence))}
        />
      </ScrollView>
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingBottom: 32,
    gap: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoSection: {
    marginBottom: 16,
    gap: 8,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
  },
  photoButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGreen,
  },
  removePhoto: {
    fontSize: 13,
    color: colors.error,
  },
});
