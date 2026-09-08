import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/shared/theme/motion';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  disabled?: boolean;
};

export function FadeIn({ children, delay = 0, disabled = false }: FadeInProps) {
  const opacity = useRef(new Animated.Value(disabled ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(disabled ? 0 : 8)).current;

  useEffect(() => {
    if (disabled) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.normal,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, disabled, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}
