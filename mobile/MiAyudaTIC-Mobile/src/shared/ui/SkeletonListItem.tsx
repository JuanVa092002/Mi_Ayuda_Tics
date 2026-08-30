import { Animated, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';

export function SkeletonListItem() {
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
    <View style={styles.row}>
      <Animated.View style={[styles.avatar, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.lineWide, { opacity }]} />
        <Animated.View style={[styles.lineNarrow, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: semanticColors.surface.muted,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  lineWide: {
    height: 14,
    width: '60%',
    borderRadius: radius.sm,
    backgroundColor: semanticColors.surface.muted,
  },
  lineNarrow: {
    height: 12,
    width: '40%',
    borderRadius: radius.sm,
    backgroundColor: semanticColors.surface.muted,
  },
});
