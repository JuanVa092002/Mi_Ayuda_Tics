import { Animated, DimensionValue, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';

type SkeletonCardProps = {
  width?: DimensionValue;
  height?: number;
};

export function SkeletonCard({ width = '100%', height = 120 }: SkeletonCardProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, { width, height }]}>
      <Animated.View style={[styles.shimmer, { opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semanticColors.surface.muted,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
  },
});
