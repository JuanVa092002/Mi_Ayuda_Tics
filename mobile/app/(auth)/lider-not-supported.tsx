import { useAuth } from '@/features/auth/auth-context';
import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LiderNotSupportedScreen() {
  const { resetToGuest } = useAuth();

  const handleGoHome = async () => {
    await resetToGuest();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BrandTitle />
        <Text style={styles.title}>Experiencia móvil no disponible</Text>
        <Text style={styles.message}>
          La experiencia móvil para líder TIC aún no está disponible. Usa la versión web de
          MiAyudaTIC para gestionar solicitudes, asignaciones y reportes.
        </Text>
        <AppButton label="Volver al inicio" variant="blue" onPress={() => void handleGoHome()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
