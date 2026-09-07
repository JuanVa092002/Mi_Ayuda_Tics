import { useAuth } from '@/features/auth/auth-context';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { radius } from '@/shared/theme/radius';
import { typography } from '@/shared/theme/typography';
import { shadows } from '@/shared/theme/shadows';
import { Text } from '@/shared/ui/Text';
import { Button } from '@/shared/ui/Button';
import { Feather } from '@expo/vector-icons';
import { useScrollToTop } from 'expo-router';
import { useRef } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'Funcionario';
}

export default function CuentaScreen() {
  const { user, logout } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const fullName = user?.fullName ?? 'Funcionario';
  const firstName = getFirstName(fullName);
  const initials = getInitials(fullName);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing[8] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityHeader}>
          <View
            style={styles.avatar}
            accessibilityLabel={`Avatar de ${fullName}`}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identityText}>
            <Text variant="caption" color="tertiary" style={styles.greeting}>
              Hola, {firstName}
            </Text>
            <Text variant="h1" color="primary" style={styles.identityTitle}>
              Tu cuenta
            </Text>
            <View
              style={styles.roleChip}
              accessibilityLabel="Rol: Funcionario"
            >
            <Text style={styles.roleChipText}>Funcionario</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text variant="h2" color="primary">
              Información de cuenta
            </Text>
            <Text variant="p2" color="secondary">
              Tu sesión institucional está activa.
            </Text>
          </View>
          <View style={styles.infoCard}>
            <InfoRow icon="mail" label="Correo institucional" value={user?.email ?? '—'} />
            <InfoRow icon="briefcase" label="Rol" value="Funcionario" />
            <InfoRow icon="map-pin" label="Centro" value="CTPI · Cauca" last />
          </View>
          <View style={styles.sessionNote}>
            <Feather name="shield" size={18} color={semanticColors.brand.blue} />
            <Text variant="caption" color="secondary" style={styles.sessionNoteText}>
              Tus solicitudes solo son visibles para ti y el equipo autorizado de soporte.
            </Text>
          </View>
          <Button
            label="Cerrar sesión"
            variant="destructive"
            fullWidth
            leftIcon={<Feather name="log-out" size={18} color={semanticColors.text.inverse} />}
            onPress={() => {
              Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
              ]);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semanticColors.surface.muted,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: semanticColors.brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: semanticColors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  identityText: {
    flex: 1,
    gap: spacing[1],
  },
  greeting: {
    marginBottom: spacing[1],
  },
  identityTitle: {
    marginBottom: spacing[2],
  },
  roleChip: {
    alignSelf: 'flex-start',
    backgroundColor: semanticColors.state.successBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  roleChipText: {
    ...typography.badge,
    color: semanticColors.brand.green,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  body: {
    flex: 1,
    gap: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  sectionHeader: {
    gap: spacing[1],
  },
  infoCard: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    paddingHorizontal: spacing[4],
    ...shadows.sm,
  },
  infoRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.default,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.state.infoBg,
  },
  infoCopy: {
    flex: 1,
    gap: spacing[1],
  },
  sessionNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: radius.md,
    backgroundColor: semanticColors.state.infoBg,
  },
  sessionNoteText: {
    flex: 1,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: semanticColors.state.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  bodyTitle: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  bodySubtitle: {
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing[6],
  },
  tag: {
    backgroundColor: semanticColors.state.warningBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  tagText: {
    ...typography.label,
    color: semanticColors.state.warning,
    fontWeight: '600',
  },
});

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={18} color={semanticColors.brand.blue} />
      </View>
      <View style={styles.infoCopy}>
        <Text variant="caption" color="tertiary">
          {label}
        </Text>
        <Text variant="p2" color="primary" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
