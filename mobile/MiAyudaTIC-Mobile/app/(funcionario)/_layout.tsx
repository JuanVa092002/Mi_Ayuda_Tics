import { useAuth } from '@/features/auth/auth-context';
import { shouldRenderRoleStack } from '@/features/auth/role-layout-policy';
import { Stack } from 'expo-router';

export default function FuncionarioGroupLayout() {
  const { access } = useAuth();

  if (!shouldRenderRoleStack(access, 'funcionario')) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
