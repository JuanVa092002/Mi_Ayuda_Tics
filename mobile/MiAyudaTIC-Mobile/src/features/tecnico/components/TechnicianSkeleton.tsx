import { SkeletonListItem } from '@/shared/ui/SkeletonListItem';
import { SkeletonStats } from '@/shared/ui/SkeletonStats';
import { spacing } from '@/shared/theme/spacing';
import { StyleSheet, View } from 'react-native';

export function TechnicianSkeleton() {
  return (
    <View style={styles.stack} accessibilityLabel="Cargando tu cola">
      <SkeletonStats />
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[3] },
});
