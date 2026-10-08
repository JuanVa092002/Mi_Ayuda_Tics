import { useAuthenticatedImageUri } from '@/shared/media/use-authenticated-image-uri';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Text } from '@/shared/ui/Text';
import { Image, type ImageProps } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type AuthenticatedImageProps = {
  url: string | null | undefined;
  accessibilityLabel: string;
  style?: StyleProp<ImageStyle | ViewStyle>;
  contentFit?: ImageProps['contentFit'];
};

export function AuthenticatedImage({
  url,
  accessibilityLabel,
  style,
  contentFit = 'cover',
}: AuthenticatedImageProps) {
  const { uri, status, refetch } = useAuthenticatedImageUri(url);

  if (status === 'empty') {
    return null;
  }

  if (status === 'loading') {
    return (
      <View style={[styles.fallback, style]} accessibilityRole="image" accessibilityLabel="Cargando evidencia">
        <ActivityIndicator color={semanticColors.brand.blue} />
      </View>
    );
  }

  if (status === 'error' || !uri) {
    return (
      <View style={[styles.fallback, style]} accessibilityRole="image" accessibilityLabel="No se pudo mostrar la evidencia">
        <Text variant="p2" color="secondary" align="center">
          No se pudo mostrar la evidencia.
        </Text>
        <Pressable onPress={refetch} accessibilityRole="button" accessibilityLabel="Reintentar evidencia">
          <Text variant="label" color="link">
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style as StyleProp<ImageStyle>}
      contentFit={contentFit}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    minHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: semanticColors.surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[4],
  },
});
