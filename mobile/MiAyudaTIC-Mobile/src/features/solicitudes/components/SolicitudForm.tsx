import { useAmbientes, useTiposCaso } from '@/features/solicitudes/hooks';
import {
  createSolicitudSchema,
  type CreateSolicitudFormValues,
} from '@/features/solicitudes/schemas';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SelectField } from '@/shared/ui/SelectField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type SolicitudFormPhoto = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  origin?: 'camera' | 'gallery';
};

export type PersistedFormValues = {
  environmentId: string;
  caseTypeId: string;
  description: string;
  phone: string;
  photo?: SolicitudFormPhoto;
};

export type SolicitudSubmitMeta = {
  environmentName?: string;
  caseTypeName?: string;
};

type SolicitudFormProps = {
  defaultPhone?: string;
  submitting: boolean;
  onSubmit: (
    values: CreateSolicitudFormValues,
    photo?: SolicitudFormPhoto,
    meta?: SolicitudSubmitMeta,
  ) => void;
  persistedValues?: PersistedFormValues | null;
  onValuesChange?: (values: PersistedFormValues) => void;
};

export function SolicitudForm({
  defaultPhone = '',
  submitting,
  onSubmit,
  persistedValues,
  onValuesChange,
}: SolicitudFormProps) {
  const ambientesQuery = useAmbientes();
  const tiposQuery = useTiposCaso();
  const [photo, setPhoto] = useState<SolicitudFormPhoto | undefined>(
    persistedValues?.photo,
  );
  const lastPersistedRef = useRef<PersistedFormValues | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm<CreateSolicitudFormValues>({
    resolver: zodResolver(createSolicitudSchema),
    defaultValues: {
      environmentId: persistedValues?.environmentId ?? '',
      caseTypeId: persistedValues?.caseTypeId ?? '',
      description: persistedValues?.description ?? '',
      phone: persistedValues?.phone ?? defaultPhone,
    },
  });

  // Restore persisted values when they change
  useEffect(() => {
    if (persistedValues && persistedValues !== lastPersistedRef.current) {
      lastPersistedRef.current = persistedValues;
      reset({
        environmentId: persistedValues.environmentId,
        caseTypeId: persistedValues.caseTypeId,
        description: persistedValues.description,
        phone: persistedValues.phone || defaultPhone,
      });
      if (persistedValues.photo) {
        setPhoto(persistedValues.photo);
      }
    }
  }, [persistedValues, reset, defaultPhone]);

  // Persist form values on change
  const watchedValues = watch();
  useEffect(() => {
    if (!onValuesChange) return;
    const timer = setTimeout(() => {
      onValuesChange({
        environmentId: watchedValues.environmentId,
        caseTypeId: watchedValues.caseTypeId,
        description: watchedValues.description,
        phone: watchedValues.phone,
        photo,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [
    watchedValues.environmentId,
    watchedValues.caseTypeId,
    watchedValues.description,
    watchedValues.phone,
    photo,
    onValuesChange,
  ]);

  const persistSnapshot = useCallback(
    (nextPhoto: SolicitudFormPhoto | undefined) => {
      if (!onValuesChange) return;
      const values = getValues();
      onValuesChange({
        environmentId: values.environmentId,
        caseTypeId: values.caseTypeId,
        description: values.description,
        phone: values.phone,
        photo: nextPhoto,
      });
    },
    [getValues, onValuesChange],
  );

  const catalogsLoading = ambientesQuery.isLoading || tiposQuery.isLoading;
  const catalogsError = ambientesQuery.isError || tiposQuery.isError;
  const catalogError = ambientesQuery.error ?? tiposQuery.error ?? null;

  const pickPhoto = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        source === 'camera'
          ? 'Necesitamos acceso a la cámara para tomar evidencia. Actívalo en Ajustes > Aplicaciones > MiAyudaTIC > Permisos.'
          : 'Necesitamos acceso a la galería para adjuntar evidencia. Actívalo en Ajustes > Aplicaciones > MiAyudaTIC > Permisos.',
      );
      return;
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.8,
      // Android: allowsEditing opens a second activity that often returns a
      // broken URI / remounts JS and looks like a network error on the form.
      allowsEditing: Platform.OS === 'ios',
      aspect: [4, 3],
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const nextPhoto: SolicitudFormPhoto = {
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        fileName: asset.fileName ?? undefined,
        fileSize: asset.fileSize,
        origin: source === 'camera' ? 'camera' : 'gallery',
      };
      setPhoto(nextPhoto);
      persistSnapshot(nextPhoto);
    }
  };

  const openPhotoOptions = () => {
    Alert.alert('Añadir evidencia', 'Una foto ayuda al equipo a entender el incidente.', [
      { text: 'Tomar foto', onPress: () => void pickPhoto('camera') },
      { text: 'Elegir de galería', onPress: () => void pickPhoto('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <QueryBoundary
        isLoading={catalogsLoading}
        isError={catalogsError}
        error={catalogError}
        hasData={
          ambientesQuery.dataUpdatedAt > 0 && tiposQuery.dataUpdatedAt > 0
        }
        onRetry={() => {
          void ambientesQuery.refetch();
          void tiposQuery.refetch();
        }}
        emptyTitle="Catálogos no disponibles"
        emptyDescription="No hay ambientes o tipos de caso activos para registrar la solicitud."
        isEmpty={
          !catalogsLoading &&
          !catalogsError &&
          ((ambientesQuery.data?.length ?? 0) === 0 ||
          (tiposQuery.data?.length ?? 0) === 0
          )
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={[
              styles.form,
              { paddingBottom: spacing[8] },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.intro}>
              <Text style={styles.introTitle}>Cuéntanos qué ocurre</Text>
              <Text style={styles.introDescription}>
                Comparte los detalles y el equipo de soporte podrá ayudarte más rápido.
              </Text>
            </View>
        <Controller
          control={control}
          name="environmentId"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Ambiente de formación"
              value={value}
              onChange={onChange}
              error={errors.environmentId?.message}
              options={(ambientesQuery.data ?? []).map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          )}
        />

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
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormField
              label="Descripción del incidente"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              placeholder="Describe el problema con detalle (mín. 10 caracteres)"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormField
              label="Teléfono de contacto"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              placeholder="Número para seguimiento"
            />
          )}
        />

        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <View style={styles.photoCopy}>
              <Text style={styles.photoLabel}>Evidencia fotográfica</Text>
              <Text style={styles.photoHint}>Opcional · JPG, PNG o HEIC</Text>
            </View>
            <Feather name="camera" size={20} color={semanticColors.brand.blue} />
          </View>
          {photo ? (
            <View style={styles.photoPreviewCard}>
              <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" />
              <View style={styles.photoActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cambiar evidencia fotográfica"
                  onPress={openPhotoOptions}
                  style={styles.photoAction}
                >
                  <Feather name="refresh-cw" size={16} color={semanticColors.brand.blue} />
                  <Text style={styles.photoActionText}>Cambiar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Quitar evidencia fotográfica"
                  onPress={() => {
                    setPhoto(undefined);
                    persistSnapshot(undefined);
                  }}
                  style={styles.photoAction}
                >
                  <Feather name="trash-2" size={16} color={semanticColors.state.error} />
                  <Text style={styles.removePhoto}>Quitar</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          {!photo ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Añadir evidencia fotográfica"
              onPress={openPhotoOptions}
              style={({ pressed }) => [styles.photoButton, pressed && styles.photoButtonPressed]}
            >
              <View style={styles.photoButtonIcon}>
                <Feather name="camera" size={20} color={semanticColors.brand.green} />
              </View>
              <View style={styles.photoButtonCopy}>
                <Text style={styles.photoButtonText}>Añadir una foto</Text>
                <Text style={styles.photoButtonHint}>Toma una foto o elige una existente</Text>
              </View>
              <Feather name="chevron-right" size={18} color={semanticColors.text.tertiary} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.submitSection}>
          <Button
            label="Enviar solicitud"
            variant="primary"
            fullWidth
            loading={submitting}
            onPress={handleSubmit(
              (values) => {
                const environmentName = ambientesQuery.data?.find(
                  (item) => item.id === values.environmentId,
                )?.name;
                const caseTypeName = tiposQuery.data?.find(
                  (item) => item.id === values.caseTypeId,
                )?.name;
                onSubmit(values, photo, { environmentName, caseTypeName });
              },
              (formErrors) => {
                const first =
                  formErrors.environmentId?.message ??
                  formErrors.caseTypeId?.message ??
                  formErrors.description?.message ??
                  formErrors.phone?.message;
                if (first) {
                  Alert.alert('Revisa el formulario', first);
                }
              },
            )}
          />
          <Text style={styles.submitHint}>
            Podrás consultar el estado desde Mis solicitudes.
          </Text>
        </View>
          </ScrollView>
          {/* Submit lives at the end of the scroll flow: never covers fields,
              scrolls with content, and respects keyboard + bottom inset. */}
        </KeyboardAvoidingView>
      </QueryBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.muted,
  },
  keyboard: {
    flex: 1,
  },
  form: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[4],
  },
  submitSection: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  submitHint: {
    ...typography.caption,
    color: semanticColors.text.tertiary,
    textAlign: 'center',
  },
  intro: {
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  introTitle: {
    ...typography.h1,
    color: semanticColors.text.primary,
  },
  introDescription: {
    ...typography.p2,
    color: semanticColors.text.secondary,
  },
  textArea: {
    minHeight: 128,
    textAlignVertical: 'top',
  },
  photoSection: {
    gap: spacing[3],
    paddingTop: spacing[2],
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoCopy: {
    gap: spacing[1],
  },
  photoLabel: {
    ...typography.h3,
    color: semanticColors.text.primary,
  },
  photoHint: {
    ...typography.caption,
    color: semanticColors.text.secondary,
  },
  photoPreviewCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: semanticColors.surface.card,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  preview: {
    width: '100%',
    height: 192,
    backgroundColor: semanticColors.surface.muted,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing[2],
  },
  photoAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
  },
  photoActionText: {
    ...typography.label,
    color: semanticColors.brand.blue,
    fontWeight: '700',
  },
  photoButton: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: semanticColors.brand.green,
    backgroundColor: semanticColors.surface.card,
  },
  photoButtonPressed: {
    opacity: 0.8,
    backgroundColor: semanticColors.state.successBg,
  },
  photoButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.state.successBg,
  },
  photoButtonCopy: {
    flex: 1,
    gap: spacing[1],
  },
  photoButtonText: {
    ...typography.p2,
    color: semanticColors.text.primary,
    fontWeight: '700',
  },
  photoButtonHint: {
    ...typography.caption,
    color: semanticColors.text.secondary,
  },
  removePhoto: {
    ...typography.label,
    color: semanticColors.state.error,
    fontWeight: '700',
  },
});
