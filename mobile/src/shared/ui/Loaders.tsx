import { ActivityIndicator, StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '@/shared/theme/colors';

type FullScreenLoaderProps = ViewProps & {
  color?: string;
};

export function FullScreenLoader({ color = colors.brandGreen, style, ...props }: FullScreenLoaderProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
