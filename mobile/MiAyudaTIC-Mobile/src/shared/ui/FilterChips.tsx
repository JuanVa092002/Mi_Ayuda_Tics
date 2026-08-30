import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { segmentLabelSize } from '@/shared/layout/segment-label';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { fontFamilies } from '@/shared/theme/typography';

type FilterChipsProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

/**
 * Native segmented control: every option gets an equal share of the row.
 * Works on 320dp–tablet because segments are `flex: 1` + `minWidth: 0`,
 * and labels scale down instead of overflowing or left-hugging.
 */
export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  const { width } = useWindowDimensions();
  const fontSize = segmentLabelSize(width, options.length);

  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              onSelect(option);
              void Haptics.selectionAsync().catch(() => undefined);
            }}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              maxFontSizeMultiplier={1.15}
              style={[
                styles.label,
                { fontSize, lineHeight: fontSize + 3 },
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: semanticColors.surface.well,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 2,
  },
  segmentActive: {
    backgroundColor: semanticColors.surface.card,
    ...shadows.sm,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  labelActive: {
    color: semanticColors.text.primary,
  },
  labelInactive: {
    color: semanticColors.text.secondary,
  },
});
