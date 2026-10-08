import { getRouteForAccess, getRestoreFailedMessage } from '@/features/auth/guards';
import { useAppBootstrap } from '@/shared/hooks/useAppBootstrap';
import { layout, spacing } from '@/shared/theme/spacing';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Text } from '@/shared/ui/Text';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeEntryScreenProps = {
  validatingSession?: boolean;
};

function WelcomeEntryScreen({ validatingSession = false }: WelcomeEntryScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {validatingSession ? (
          <View style={styles.validatingBanner} accessibilityRole="text">
            <ActivityIndicator size="small" color={semanticColors.brand.green} />
            <Text variant="p2" color="secondary">
              Validando tu sesión…
            </Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          <BrandTitle size="large" />
          <Image
            source={require('../assets/icons/logo-sena.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text variant="h1" align="center" style={styles.heading}>
            Gestiona el soporte{'\n'}técnico del CTPI
          </Text>
          <Text variant="p2" color="secondary" align="center" style={styles.description}>
            Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Iniciar sesión"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
          />
          <Button
            label="Registrarse"
            variant="primary"
            fullWidth
            onPress={() => router.push('/(auth)/register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * AppGate / SessionGate — único punto de decisión del primer destino tras bootstrap.
 */
export default function AppGateScreen() {
  const { access, isValidatingSession, isRestoreFailed, bootstrapSession } = useAppBootstrap();
  const destination = getRouteForAccess(access);

  if (isRestoreFailed && access.state === 'restore_failed') {
    const copy = getRestoreFailedMessage(access.reason);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restoreContent}>
          <BrandTitle />
          <ErrorState
            title={copy.title}
            message={copy.message}
            onRetry={() => void bootstrapSession()}
          />
          <Button label="Volver al inicio" variant="secondary" fullWidth onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  if (destination) {
    return <Redirect href={destination} />;
  }

  return <WelcomeEntryScreen validatingSession={isValidatingSession} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.default,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.authPaddingX,
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  validatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 12,
    backgroundColor: semanticColors.surface.muted,
  },
  hero: {
    alignItems: 'center',
    gap: spacing[4],
    paddingVertical: spacing[2],
  },
  logo: {
    width: 150,
    height: 138,
  },
  heading: {
    maxWidth: 300,
  },
  description: {
    maxWidth: 340,
    paddingHorizontal: spacing[2],
  },
  actions: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing[4],
    marginTop: spacing[6],
  },
  restoreContent: {
    flex: 1,
    paddingHorizontal: layout.authPaddingX,
    justifyContent: 'center',
    gap: spacing[6],
  },
});
