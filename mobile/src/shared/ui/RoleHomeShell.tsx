import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme/colors';
import { AppButton } from './AppButton';

/**
 * @deprecated This component is deprecated. Use SafeAreaView + ScrollView directly in screen files.
 * Funcionario screens now use tab navigation. Tecnico screens should migrate to native Stack.
 * RoleHomeShell will be removed in a future update.
 */
type RoleHomeShellProps = {
  roleLabel: string;
  title: string;
  subtitle: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  children: ReactNode;
};

export function RoleHomeShell({
  roleLabel,
  title,
  subtitle,
  userName,
  userEmail,
  onLogout,
  children,
}: RoleHomeShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.roleBadge}>{roleLabel}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Image
          source={require('../../../assets/icons/logoSena.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.sessionCard}>
        <Text style={styles.sessionLabel}>Sesión activa</Text>
        <Text style={styles.sessionName}>{userName}</Text>
        <Text style={styles.sessionEmail}>{userEmail}</Text>
        <Pressable onPress={onLogout} accessibilityRole="button">
          <Text style={styles.logoutLink}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.brandGreen,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.brandBlue,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
  },
  logo: {
    width: 56,
    height: 40,
  },
  sessionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brandBlue,
  },
  sessionEmail: {
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 8,
  },
  logoutLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGreen,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
