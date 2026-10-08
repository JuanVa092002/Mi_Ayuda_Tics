import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const formStyles = StyleSheet.create({
  label: {
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.inputWhite,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
    marginTop: -8,
  },
});
