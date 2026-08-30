import { AuthFlowPanel } from '@/features/auth/components/AuthFlowPanel';
import { PasswordRuleChecklist } from '@/features/auth/components/PasswordRuleChecklist';
import { useResetPassword } from '@/features/auth/hooks';
import { isResetPasswordValid } from '@/features/auth/password-recovery-errors';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas';
import { resolveResetTokenFromRouteParam } from '@/shared/linking/parse-reset-link';
import { spacing } from '@/shared/theme/spacing';
import { AuthLayout } from '@/shared/ui/AuthLayout';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import { TextInput } from '@/shared/ui/TextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';

const AUTO_LOGIN_MS = 2800;
const AUTO_LOGIN_SECONDS = Math.ceil(AUTO_LOGIN_MS / 1000);

export default function ResetPasswordScreen() {
  const rawToken = useLocalSearchParams<{ token: string | string[] }>().token;
  const token = resolveResetTokenFromRouteParam(rawToken);
  const { submit, isSubmitting, isSuccess, successMessage, error, reset } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showInvalidToken, setShowInvalidToken] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const password = useWatch({ control, name: 'password' }) ?? '';
  const confirmPassword = useWatch({ control, name: 'confirmPassword' }) ?? '';
  const canSubmit = isResetPasswordValid(password, confirmPassword) && !isSubmitting;

  const goToLogin = useCallback(() => {
    router.replace({ pathname: '/(auth)/login' });
  }, []);

  const goToForgot = useCallback(() => {
    router.replace({ pathname: '/(auth)/forgot-password' });
  }, []);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    const timer = setTimeout(goToLogin, AUTO_LOGIN_MS);
    return () => clearTimeout(timer);
  }, [isSuccess, goToLogin]);

  useEffect(() => {
    if (error?.kind === 'invalid_token') {
      setShowInvalidToken(true);
    }
  }, [error]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setShowInvalidToken(true);
      return;
    }

    reset();
    try {
      await submit({
        token,
        password: values.password.trim(),
        confirmPassword: values.confirmPassword.trim(),
      });
    } catch {
      // error surfaced via hook
    }
  });

  if (!token || showInvalidToken) {
    return (
      <AuthLayout header={<BrandTitle />}>
        <AuthFlowPanel
          tone="warning"
          title="Enlace inválido o expirado"
          message={
            error?.message ??
            'Este enlace no es válido o ya expiró. Solicita uno nuevo desde la app; los enlaces duran una hora.'
          }
          primaryLabel="Solicitar nuevo enlace"
          onPrimaryPress={goToForgot}
          secondaryLabel="Volver al inicio de sesión"
          onSecondaryPress={goToLogin}
        />
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout header={<BrandTitle />}>
        <AuthFlowPanel
          tone="success"
          title="Contraseña restablecida"
          message={successMessage ?? 'Tu contraseña se actualizó correctamente.'}
          countdownSeconds={AUTO_LOGIN_SECONDS}
          countdownLabel={(seconds) => `Ir al inicio de sesión en ${seconds}s`}
          primaryLabel="Ir ahora"
          onPrimaryPress={goToLogin}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      header={<BrandTitle />}
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura y confírmala para continuar."
    >
      {error && error.kind !== 'invalid_token' ? (
        <AuthFlowPanel
          tone={error.kind === 'rate_limited' ? 'warning' : 'error'}
          title={error.kind === 'network' ? 'Sin conexión' : 'No se pudo restablecer'}
          message={error.message}
          primaryLabel={error.canRetry ? 'Reintentar' : undefined}
          onPrimaryPress={error.canRetry ? () => onSubmit() : undefined}
        />
      ) : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoFocus
            editable={!isSubmitting}
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
            editable={!isSubmitting}
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

      <Button
        label={isSubmitting ? 'Restableciendo...' : 'Establecer nueva contraseña'}
        variant="primary"
        fullWidth
        loading={isSubmitting}
        disabled={!canSubmit}
        onPress={onSubmit}
      />

      <Pressable onPress={goToLogin} style={styles.linkWrap} accessibilityRole="link">
        <Text variant="p2" color="link" align="center">
          Volver al inicio de sesión
        </Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  linkWrap: {
    marginTop: spacing[6],
    alignItems: 'center',
    paddingVertical: spacing[2],
    minHeight: 44,
    justifyContent: 'center',
  },
});
