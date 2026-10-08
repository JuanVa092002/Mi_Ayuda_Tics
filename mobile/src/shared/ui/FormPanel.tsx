import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface FormPanelProps {
  children: ReactNode;
  title?: string;
}

export function FormPanel({ children }: FormPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panelGray,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 20,
    paddingVertical: 50,
    flex: 1,
  },
  content: {
    width: '100%',
  },
});
