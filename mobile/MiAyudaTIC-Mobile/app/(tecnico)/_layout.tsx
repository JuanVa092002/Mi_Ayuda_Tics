import { useAuth } from '@/features/auth/auth-context';
import { shouldRenderRoleStack } from '@/features/auth/role-layout-policy';
import { Stack } from 'expo-router';

export default function TecnicoGroupLayout() {
  const { access } = useAuth();

  if (!shouldRenderRoleStack(access, 'tecnico')) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="caso/[id]" />
      <Stack.Screen name="caso/[id]/resolver" />
    </Stack>
  );
}
