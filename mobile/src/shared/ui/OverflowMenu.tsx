import { useAuth } from '@/features/auth/auth-context';
import { useSystemNavInset } from '@/shared/layout/useSystemNavInset';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

export function OverflowMenu() {
  const { logout } = useAuth();
  const { top } = useSystemNavInset();
  const [visible, setVisible] = useState(false);

  const handleLogout = async () => {
    setVisible(false);
    await logout();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Menú de opciones"
        onPress={() => setVisible(true)}
        style={styles.trigger}
      >
        <Feather name="more-vertical" size={22} color={semanticColors.text.primary} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable
          style={[styles.backdrop, { paddingTop: top + spacing[2] }]}
          onPress={() => setVisible(false)}
        >
          <View style={styles.menu}>
            <Pressable style={styles.menuItem} onPress={() => setVisible(false)}>
              <Feather name="user" size={18} color={semanticColors.text.primary} />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Feather name="log-out" size={18} color={semanticColors.state.error} />
              <Text style={[styles.menuText, styles.logoutText]}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: semanticColors.overlay.scrim,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: spacing[4],
  },
  menu: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.md,
    minWidth: 180,
    paddingVertical: spacing[2],
    shadowColor: semanticColors.brand.blue,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  menuText: {
    ...typography.p2,
    color: semanticColors.text.primary,
  },
  logoutText: {
    color: semanticColors.state.error,
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.border.default,
    marginVertical: 4,
  },
});
