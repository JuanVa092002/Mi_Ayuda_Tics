import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PendingApprovalScreen() {
  const { message } = useLocalSearchParams<{ message?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BrandTitle />
        <Text style={styles.title}>Cuenta en revisión</Text>
        <Text style={styles.message}>
          Tu solicitud de acceso como técnico fue enviada correctamente.
        </Text>
        <Text style={styles.submessage}>
          {message ??
            'Podrás iniciar sesión cuando el líder TIC apruebe tu cuenta. Mientras tanto, no tendrás acceso a la app.'}
        </Text>
        <AppButton
          label="Ir a iniciar sesión"
          variant="green"
          onPress={() => router.replace('/(auth)/login')}
        />
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
    fontWeight: '600',
  },
  submessage: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDark,
    textAlign: 'center',
  },
});
