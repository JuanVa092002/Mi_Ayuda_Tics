import { useAuth } from '@/features/auth/auth-context';
import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionExpiredScreen() {
  const { resetToGuest } = useAuth();

  const goToLogin = async () => {
    await resetToGuest();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BrandTitle />
        <Text style={styles.title}>Sesión expirada</Text>
        <Text style={styles.message}>
          Tu sesión ya no es válida. Inicia sesión nuevamente para continuar usando MiAyudaTIC
          en el campo.
        </Text>
        <AppButton label="Iniciar sesión" variant="green" onPress={() => void goToLogin()} />
        <AppButton label="Volver al inicio" variant="blue" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brandBlue,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDark,
    textAlign: 'center',
  },
});
