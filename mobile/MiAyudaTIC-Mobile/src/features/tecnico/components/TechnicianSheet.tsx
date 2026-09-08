import { semanticColors } from '@/shared/theme/semantic-colors';
import { useEffect, type ReactNode } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

type TechnicianSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/** In-tree full-screen sheet. RN Modal on Android can pass taps through to Home. */
export function TechnicianSheet({ visible, onClose, children }: TechnicianSheetProps) {
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.root} accessibilityViewIsModal pointerEvents="auto">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
    backgroundColor: semanticColors.surface.muted,
  },
  flex: { flex: 1, backgroundColor: semanticColors.surface.muted },
});
