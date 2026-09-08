import type { CasoSummary } from '@/shared/contracts/caso';
import { formatSolicitudDate } from '@/shared/contracts/solicitud';
import { colors } from '@/shared/theme/colors';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './StatusBadge';

type CasoListItemProps = {
  item: CasoSummary;
  onPress: () => void;
};

export function CasoListItem({ item, onPress }: CasoListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.code}>{item.caseCode}</Text>
        <StatusBadge status={item.status} workflowVersion={item.workflowVersion} />
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.meta}>
        {formatSolicitudDate(item.createdAtRaw)}
        {item.requesterName ? ` · ${item.requesterName}` : ''}
        {item.environmentName ? ` · ${item.environmentName}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E4EA',
    gap: 6,
  },
  pressed: {
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  code: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.brandBlue,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textDark,
  },
  meta: {
    fontSize: 12,
    color: '#6B7C93',
  },
});
