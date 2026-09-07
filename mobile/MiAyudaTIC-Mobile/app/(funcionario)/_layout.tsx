import { useAuth } from '@/features/auth/auth-context';
import { shouldRenderRoleStack } from '@/features/auth/role-layout-policy';
import { semanticColors } from '@/shared/theme/semantic-colors';
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
      <Stack.Screen
        name="nueva-solicitud"
        options={{
          presentation: 'fullScreenModal',
          headerShown: true,
          title: 'Nueva solicitud',
          headerShadowVisible: false,
          headerTintColor: semanticColors.brand.blue,
          headerStyle: { backgroundColor: semanticColors.surface.muted },
          headerRight: () => null,
        }}
      />
    </Stack>
  );
}
