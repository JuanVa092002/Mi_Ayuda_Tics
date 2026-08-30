import { useAuth } from '@/features/auth/auth-context';
import { getRouteForAccess } from '@/features/auth/guards';
import { Redirect, Stack, useSegments } from 'expo-router';

const PUBLIC_EXCEPTIONS = new Set([
  'pending-approval',
  'lider-not-supported',
  'session-expired',
  'reset-password',
]);

export default function AuthGroupLayout() {
  const { session, access } = useAuth();
  const segments = useSegments() as string[];
  const currentSegment = segments[segments.length - 1] ?? '';
  const isPasswordRecoveryRoute =
    segments.includes('reset-password') || segments.includes('forgot-password');
  const isPublicRoute = [
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'pending-approval',
    'lider-not-supported',
    'session-expired',
  ].includes(currentSegment);
  const isExceptionRoute = PUBLIC_EXCEPTIONS.has(currentSegment);

  if (
    session.state === 'authenticated' &&
    !isPasswordRecoveryRoute &&
    isPublicRoute &&
    !isExceptionRoute
  ) {
    const destination = getRouteForAccess(access);
    if (destination) {
      return <Redirect href={destination} />;
    }
  }

  if (
    session.state === 'expired' &&
    currentSegment !== 'session-expired' &&
    !isPasswordRecoveryRoute
  ) {
    return <Redirect href="/(auth)/session-expired" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password/[token]" />
      <Stack.Screen name="pending-approval" />
      <Stack.Screen name="lider-not-supported" />
      <Stack.Screen name="session-expired" />
    </Stack>
  );
}
