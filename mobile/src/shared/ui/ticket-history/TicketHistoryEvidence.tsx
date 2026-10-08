import { AuthenticatedImage } from '@/shared/ui/AuthenticatedImage';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Text } from '@/shared/ui/Text';
import { Feather } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
} from 'react-native';
import {
  isImageAttachment,
  type TicketHistoryAttachment,
} from './ticket-history-model';

type TicketHistoryEvidenceProps = {
  attachment?: TicketHistoryAttachment;
};

function pinchDistance(event: GestureResponderEvent): number | null {
  const touches = event.nativeEvent.touches;
  if (touches.length < 2) return null;
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

function ZoomableLightboxImage({
  url,
  accessibilityLabel,
  width,
  height,
}: {
  url: string;
  accessibilityLabel: string;
  width: number;
  height: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentScale = useRef(1);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const lastTapAt = useRef(0);

  const resetTransform = (animated = true) => {
    currentScale.current = 1;
    currentX.current = 0;
    currentY.current = 0;
    const next = { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 };
    if (!animated) {
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.spring(translateX, next),
      Animated.spring(translateY, next),
    ]).start();
  };

  const zoomTo = (nextScale: number) => {
    currentScale.current = nextScale;
    currentX.current = 0;
    currentY.current = 0;
    Animated.parallel([
      Animated.spring(scale, { toValue: nextScale, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
    ]).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          pinchStartDistance.current = pinchDistance(event);
          pinchStartScale.current = currentScale.current;
        },
        onPanResponderMove: (event, gesture) => {
          const distance = pinchDistance(event);
          if (distance && pinchStartDistance.current) {
            const next = Math.min(4, Math.max(1, pinchStartScale.current * (distance / pinchStartDistance.current)));
            currentScale.current = next;
            scale.setValue(next);
            return;
          }
          if (currentScale.current > 1.02 && event.nativeEvent.touches.length < 2) {
            translateX.setValue(currentX.current + gesture.dx);
            translateY.setValue(currentY.current + gesture.dy);
          }
        },
        onPanResponderRelease: (_event, gesture) => {
          pinchStartDistance.current = null;
          if (currentScale.current <= 1.05) {
            resetTransform(true);
            const now = Date.now();
            const isTap = Math.abs(gesture.dx) < 8 && Math.abs(gesture.dy) < 8;
            if (isTap && now - lastTapAt.current < 280) {
              lastTapAt.current = 0;
              zoomTo(2.4);
              return;
            }
            if (isTap) lastTapAt.current = now;
            return;
          }
          currentX.current += gesture.dx;
          currentY.current += gesture.dy;
          const maxX = ((currentScale.current - 1) * width) / 2;
          const maxY = ((currentScale.current - 1) * height) / 2;
          currentX.current = Math.max(-maxX, Math.min(maxX, currentX.current));
          currentY.current = Math.max(-maxY, Math.min(maxY, currentY.current));
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: currentX.current,
              useNativeDriver: true,
              tension: 80,
              friction: 12,
            }),
            Animated.spring(translateY, {
              toValue: currentY.current,
              useNativeDriver: true,
              tension: 80,
              friction: 12,
            }),
          ]).start();
        },
      }),
    [height, scale, translateX, translateY, width],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.zoomFrame,
        { width, height },
        {
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
      accessibilityLabel={`${accessibilityLabel}. Pellizca para ampliar, doble toque para zoom`}
    >
      <AuthenticatedImage
        url={url}
        accessibilityLabel={accessibilityLabel}
        style={{ width, height, borderRadius: radius.md }}
        contentFit="contain"
      />
    </Animated.View>
  );
}

export function TicketHistoryEvidence({ attachment }: TicketHistoryEvidenceProps) {
  const [expanded, setExpanded] = useState(false);
  const { width, height } = useWindowDimensions();

  if (!attachment?.url) return null;

  const filename = attachment.filename?.trim() || 'Archivo adjunto';
  const showImage = isImageAttachment(attachment);

  return (
    <View style={styles.wrap}>
      {showImage ? (
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ampliar evidencia: ${filename}`}
          style={styles.imageButton}
        >
          <View style={styles.imageSlot}>
            <AuthenticatedImage
              url={attachment.url}
              accessibilityLabel={filename}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        </Pressable>
      ) : (
        <View style={styles.fileChip} accessibilityRole="text" accessibilityLabel={`Adjunto: ${filename}`}>
          <Feather name="paperclip" size={16} color={semanticColors.brand.blue} />
          <Text variant="caption" color="primary" numberOfLines={1} style={styles.fileName}>
            {filename}
          </Text>
        </View>
      )}

      <Modal
        visible={expanded}
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
        statusBarTranslucent
      >
        <View style={styles.lightbox} pointerEvents="box-none">
          <Pressable
            style={[StyleSheet.absoluteFill, styles.lightboxScrim]}
            onPress={() => setExpanded(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar evidencia"
          />
          <Pressable
            onPress={() => setExpanded(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar evidencia"
            style={styles.close}
            hitSlop={12}
          >
            <Feather name="x" size={22} color={semanticColors.text.inverse} />
          </Pressable>
          <ZoomableLightboxImage
            url={attachment.url}
            accessibilityLabel={filename}
            width={width - spacing[8]}
            height={height * 0.72}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  imageButton: {
    overflow: 'hidden',
    borderRadius: radius.sm,
  },
  imageSlot: {
    height: 152,
    backgroundColor: semanticColors.surface.well,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 152,
    backgroundColor: semanticColors.surface.well,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.sm,
    backgroundColor: semanticColors.surface.muted,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  fileName: {
    flex: 1,
  },
  lightbox: {
    flex: 1,
    backgroundColor: semanticColors.brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  lightboxScrim: {
    backgroundColor: semanticColors.brand.blue,
  },
  zoomFrame: {
    zIndex: 1,
    backgroundColor: semanticColors.brand.blue,
  },
  close: {
    position: 'absolute',
    top: spacing[12],
    right: spacing[5],
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    zIndex: 2,
  },
});
