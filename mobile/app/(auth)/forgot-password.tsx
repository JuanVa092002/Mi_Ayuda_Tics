import { AuthFlowPanel } from '@/features/auth/components/AuthFlowPanel';
import { useForgotPassword } from '@/features/auth/hooks';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas';
import { spacing } from '@/shared/theme/spacing';
import { AuthLayout } from '@/shared/ui/AuthLayout';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import { TextInput } from '@/shared/ui/TextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';

const SUCCESS_BODY =
  'Te enviamos un enlace para recuperar tu acceso. Si tienes MiAyudaTIC instalada, el enlace abrirá la app directamente. Revisa tu bandeja de entrada y también spam o no deseados; puede tardar unos minutos.';

export default function ForgotPasswordScreen() {
  const { submit, isSubmitting, isSuccess, successMessage, error, reset } = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { correo: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    reset();
    await submit(values.correo.trim());
  });

  const goToLogin = () => {
    router.replace({ pathname: '/(auth)/login' });
  };

  const tryAnotherEmail = () => {
    reset();
  };

  if (isSuccess) {
    return (
      <AuthLayout header={<BrandTitle />}>
        <AuthFlowPanel
          tone="success"
          title="Revisa tu correo"
          message={successMessage ?? SUCCESS_BODY}
          primaryLabel="Intentar con otro correo"
          onPrimaryPress={tryAnotherEmail}
          secondaryLabel="Volver al inicio de sesión"
          onSecondaryPress={goToLogin}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      header={<BrandTitle />}
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña."
    >
      {error ? (
        <AuthFlowPanel
          tone={error.kind === 'rate_limited' ? 'warning' : 'error'}
          title={error.kind === 'network' ? 'Sin conexión' : 'No se pudo enviar'}
          message={error.message}
          primaryLabel={error.canRetry ? 'Reintentar' : undefined}
          onPrimaryPress={error.canRetry ? () => reset() : undefined}
        />
      ) : null}

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
            autoFocus
            editable={!isSubmitting}
            leftIcon="mail"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorMessage={errors.correo?.message}
          />
        )}
      />

      <Button
        label="Enviar enlace"
        variant="primary"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
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
