import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import {
  canAccessFuncionarioStack,
  canAccessTecnicoStack,
} from '@/features/auth/guards';
import { queryClient } from '@/shared/query/client';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { access } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Protected guard={canAccessFuncionarioStack(access)}>
        <Stack.Screen name="(funcionario)" />
      </Stack.Protected>
      <Stack.Protected guard={canAccessTecnicoStack(access)}>
        <Stack.Screen name="(tecnico)" />
      </Stack.Protected>
      <Stack.Screen name="restablecerPassword/[token]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
