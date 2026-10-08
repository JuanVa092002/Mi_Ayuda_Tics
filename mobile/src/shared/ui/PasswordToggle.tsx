import { Pressable, StyleSheet } from 'react-native';
import { motion } from '../theme/motion';
import { semanticColors } from '../theme/semantic-colors';
import { Icon } from './Icon';

type PasswordToggleProps = {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function PasswordToggle({ visible, onToggle, disabled }: PasswordToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      hitSlop={10}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Icon
        name={visible ? 'eye-off' : 'eye'}
        size={22}
        color="brandBlue"
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: semanticColors.surface.muted,
  },
  pressed: {
    opacity: motion.pressOpacity,
  },
  disabled: {
    opacity: 0.45,
  },
});
