import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.track}
      accessibilityRole="tablist"
    >
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
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 20,
  },
  segment: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.card,
  },
  segmentActive: {
    backgroundColor: semanticColors.brand.blue,
    borderColor: semanticColors.brand.blue,
    ...shadows.sm,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  labelActive: {
    color: semanticColors.text.inverse,
  },
  labelInactive: {
    color: semanticColors.text.secondary,
  },
});
