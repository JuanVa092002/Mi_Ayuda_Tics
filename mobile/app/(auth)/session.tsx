import { useAuth } from '@/features/auth/auth-context';
import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/icons/logoSena.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <BrandTitle size="small" />
        <Text style={styles.title}>Sesión activa</Text>
        {user ? (
          <View style={styles.card}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{user.fullName}</Text>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{user.email}</Text>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
        ) : null}
        <Text style={styles.note}>Módulo principal en construcción.</Text>
        <AppButton label="Cerrar sesión" variant="blue" onPress={handleLogout} />
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: 120,
    height: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brandGreen,
  },
  card: {
    width: '100%',
    backgroundColor: colors.panelGray,
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: colors.textDark,
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandBlue,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
