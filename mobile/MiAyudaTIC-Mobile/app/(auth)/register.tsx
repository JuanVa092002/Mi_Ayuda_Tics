import { useAuth } from '@/features/auth/auth-context';
import { navigateForAccess } from '@/features/auth/navigation';
import { PasswordRuleChecklist } from '@/features/auth/components/PasswordRuleChecklist';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas';
import { ApiError } from '@/shared/api/client';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { radius } from '@/shared/theme/radius';
import { AuthLayout } from '@/shared/ui/AuthLayout';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import { TextInput } from '@/shared/ui/TextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View, type ImageStyle } from 'react-native';

const ROLE_OPTIONS = [
  { label: 'Funcionario', value: 'funcionario' as const, icon: 'user' as const },
  { label: 'Técnico', value: 'tecnico' as const, icon: 'award' as const },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      correo: '',
      rol: 'funcionario',
      telefono: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedRole = useWatch({ control, name: 'rol' });
  const password = useWatch({ control, name: 'password' }) ?? '';
  const confirmPassword = useWatch({ control, name: 'confirmPassword' }) ?? '';

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para seleccionar una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await register({
        ...values,
        correo: values.correo.trim(),
        fotoUri,
      });

      if (!result.ok) {
        Alert.alert('Registro', result.message);
        return;
      }

      if (result.kind === 'tecnico_pending') {
        navigateForAccess(
          { state: 'pending_approval', message: result.message },
          { replace: true, pendingMessage: result.message },
        );
        return;
      }

      if (result.kind === 'funcionario_autologin') {
        navigateForAccess(result.access, { replace: true });
        return;
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo completar el registro.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      header={<BrandTitle />}
      title="Crear cuenta"
      subtitle="Completa tus datos para acceder al soporte técnico del CTPI"
      footer={
        <View style={styles.footerRow}>
          <Text variant="p2" color="secondary">
            ¿Ya tienes cuenta?
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')} accessibilityRole="link">
            <Text variant="p2" color="link" style={styles.footerLink}>
              Iniciar sesión
            </Text>
          </Pressable>
        </View>
      }
    >
      <Controller
        control={control}
        name="nombre"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Nombre completo"
            placeholder="Tu nombre"
            leftIcon="user"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.nombre?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="correo"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Correo institucional"
            placeholder="usuario@sena.edu.co"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.correo?.message}
          />
        )}
      />

      <View style={styles.roleHeader}>
        <Icon name="award" size={16} color="brandBlue" />
        <Text variant="label" color="secondary">
          Rol
        </Text>
      </View>
      <View style={styles.roleRow}>
        {ROLE_OPTIONS.map((option) => {
          const selected = selectedRole === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setValue('rol', option.value, { shouldValidate: true })}
              style={[styles.roleChip, selected && styles.roleChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Icon
                name={option.icon}
                size={18}
                color={selected ? 'inverse' : 'brandBlue'}
              />
              <Text variant="p2" style={selected ? styles.roleChipTextActive : styles.roleChipText}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {errors.rol?.message ? (
        <Text variant="caption" color="error" style={styles.roleError}>
          {errors.rol.message}
        </Text>
      ) : null}
      <View style={styles.roleHintRow}>
        <Icon name="info" size={14} color="tertiary" />
        <Text variant="caption" color="secondary" style={styles.roleHint}>
          {selectedRole === 'funcionario'
            ? 'Como funcionario podrás ingresar de inmediato tras completar el registro.'
            : 'Como técnico tu cuenta quedará pendiente de aprobación por el líder TIC.'}
        </Text>
      </View>

      <Controller
        control={control}
        name="telefono"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Teléfono"
            placeholder="300 000 0000"
            keyboardType="phone-pad"
            leftIcon="phone"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.telefono?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon="lock"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.password?.message}
            showPasswordToggle
            passwordVisible={showPassword}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon="lock"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.confirmPassword?.message}
            showPasswordToggle
            passwordVisible={showPassword}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
          />
        )}
      />

      <PasswordRuleChecklist password={password} confirmPassword={confirmPassword} />

      <Pressable onPress={pickPhoto} style={styles.photoButton} accessibilityRole="button">
        <Icon name="camera" size={18} color="brandBlue" />
        <Text variant="p2" color="link" style={styles.photoButtonText}>
          {fotoUri ? 'Cambiar foto de perfil (opcional)' : 'Agregar foto de perfil (opcional)'}
        </Text>
      </Pressable>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.preview as ImageStyle} contentFit="cover" />
      ) : null}

      <Button label="Registrarse" variant="primary" fullWidth loading={submitting} onPress={onSubmit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: semanticColors.surface.muted,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    minHeight: 48,
  },
  roleChipActive: {
    backgroundColor: semanticColors.brand.green,
    borderColor: semanticColors.brand.green,
  },
  roleChipText: {
    color: semanticColors.brand.blue,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: semanticColors.text.inverse,
    fontWeight: '600',
  },
  roleError: {
    marginBottom: spacing[2],
  },
  roleHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  roleHint: {
    flex: 1,
    lineHeight: 18,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.pill,
    padding: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: semanticColors.surface.muted,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    minHeight: 48,
  },
  photoButtonText: {
    fontWeight: '600',
  },
  preview: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: semanticColors.border.default,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
  },
  footerLink: {
    fontWeight: '600',
  },
});
