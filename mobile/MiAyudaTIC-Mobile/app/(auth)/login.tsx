import { useAuth } from '@/features/auth/auth-context';
import { navigateForAccess } from '@/features/auth/navigation';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import {
  createSubmitLock,
  LOGIN_CONNECTING_BODY,
  LOGIN_CONNECTING_TITLE,
  loginControlLog,
  runLoginWithSingleRetry,
} from '@/features/auth/login-retry';
import { spacing } from '@/shared/theme/spacing';
import { AuthLayout } from '@/shared/ui/AuthLayout';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import { TextInput } from '@/shared/ui/TextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const lock = useMemo(() => createSubmitLock(), []);
  const cancelledRef = useRef(false);
  const skipDelayRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!lock.tryAcquire()) {
      return;
    }
    cancelledRef.current = false;
    skipDelayRef.current = false;
    setSubmitting(true);
    try {
      const result = await runLoginWithSingleRetry(
        () => login(values.correo.trim(), values.password),
        {
          isCancelled: () => cancelledRef.current,
          skipRemaining: () => skipDelayRef.current,
          onBeforeRetry: () => {
            setConnecting(true);
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
              console.info('[login-retry]', loginControlLog({ phase: 'retry', route: 'login' }));
            }
          },
        },
      );

      if (cancelledRef.current) {
        return;
      }

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
      setConnecting(false);
      setSubmitting(false);
      lock.release();
    }
  });

  const busy = submitting || connecting;

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

      {connecting ? (
        <View style={styles.connectingBox}>
          <Text variant="p1">{LOGIN_CONNECTING_TITLE}</Text>
          <Text variant="p2" color="secondary">
            {LOGIN_CONNECTING_BODY}
          </Text>
          <View style={styles.connectingActions}>
            <Button
              label="Cancelar"
              variant="outline"
              onPress={() => {
                cancelledRef.current = true;
                skipDelayRef.current = true;
              }}
            />
            <Button
              label="Reintentar ahora"
              variant="secondary"
              onPress={() => {
                skipDelayRef.current = true;
              }}
            />
          </View>
        </View>
      ) : null}

      <Button
        label="Iniciar sesión"
        variant="primary"
        fullWidth
        loading={busy}
        onPress={onSubmit}
      />
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
  connectingBox: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  connectingActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
