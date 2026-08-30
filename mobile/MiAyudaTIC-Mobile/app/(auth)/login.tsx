import { useAuth } from '@/features/auth/auth-context';
import { navigateForAccess } from '@/features/auth/navigation';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import { spacing } from '@/shared/theme/spacing';
import { AuthLayout } from '@/shared/ui/AuthLayout';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import { TextInput } from '@/shared/ui/TextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await login(values.correo.trim(), values.password);
      if (result.ok) {
        navigateForAccess(result.access, { replace: true });
        return;
      }

      if (result.kind === 'pending_approval') {
        navigateForAccess(
          { state: 'pending_approval', message: result.message },
          { replace: true, pendingMessage: result.message },
        );
        return;
      }

      if (result.kind === 'lider') {
        navigateForAccess({ state: 'lider_blocked' }, { replace: true });
        return;
      }

      Alert.alert('No se pudo ingresar', result.message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      header={<BrandTitle />}
      title="¡Bienvenido de nuevo!"
      subtitle="Ingresa a tu cuenta institucional"
      footer={
        <View style={styles.footerRow}>
          <Text variant="p2" color="secondary">
            ¿No tienes cuenta?
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="link">
            <Text variant="p2" color="link" style={styles.footerLink}>
              Regístrate
            </Text>
          </Pressable>
        </View>
      }
    >
      <Controller
        control={control}
        name="correo"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Correo electrónico"
            placeholder="usuario@sena.edu.co"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.correo?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Contraseña"
            placeholder="Tu contraseña"
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

      <Pressable
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.forgotLink}
        accessibilityRole="link"
      >
        <Text variant="p2" color="link" align="center">
          ¿Olvidaste tu contraseña?
        </Text>
      </Pressable>

      <Button label="Iniciar sesión" variant="primary" fullWidth loading={submitting} onPress={onSubmit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotLink: {
    marginBottom: spacing[6],
    minHeight: 44,
    justifyContent: 'center',
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
