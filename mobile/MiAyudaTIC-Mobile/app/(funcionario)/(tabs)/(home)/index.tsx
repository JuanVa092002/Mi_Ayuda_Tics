import { useAuth } from '@/features/auth/auth-context';
import { useMisSolicitudes, useSolicitudStats } from '@/features/solicitudes/hooks';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { radius } from '@/shared/theme/radius';
import { Button } from '@/shared/ui/Button';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { EmptyState } from '@/shared/ui/EmptyState';
import { OverflowMenu } from '@/shared/ui/OverflowMenu';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SolicitudListItem } from '@/shared/ui/SolicitudListItem';
import { Text } from '@/shared/ui/Text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type KpiVariant = 'default' | 'warning' | 'success';

interface KpiCardProps {
  value: string | number;
  label: string;
  variant: KpiVariant;
  style?: StyleProp<ViewStyle>;
}

function KpiCard({ value, label, variant, style }: KpiCardProps) {
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';

  return (
    <View
      style={[
        styles.kpiCard,
        isWarning && styles.kpiCardWarning,
        isSuccess && styles.kpiCardSuccess,
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text
        style={[
          styles.kpiValue,
          isWarning && styles.kpiValueWarning,
          isSuccess && styles.kpiValueSuccess,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function CompactHeader({
  firstName,
  fullName,
  onProfile,
}: {
  firstName: string;
  fullName: string;
  onProfile: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.brand}>
          <BrandTitle size="default" />
        </View>
        <View style={styles.headerActions}>
          <OverflowMenu />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir cuenta de ${fullName}`}
            onPress={onProfile}
            style={styles.user}
          >
            <View style={styles.avatar} accessibilityLabel={`Avatar de ${fullName}`}>
              <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={semanticColors.text.tertiary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.heroCopy}>
        <Text variant="caption" color="tertiary" style={styles.greeting}>
          {getTimeBasedGreeting()}, {firstName}
        </Text>
        <Text variant="h1" color="primary" style={styles.heroTitle}>
          ¿Qué necesitas reportar hoy?
        </Text>
        <Text variant="p2" color="secondary" style={styles.heroDescription}>
          Tu equipo de soporte está listo para ayudarte.
        </Text>
      </View>
    </View>
  );
}

function ActionCard({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.actionCard}>
      <View style={styles.actionIcon}>
        <Feather name="plus" size={22} color={semanticColors.brand.green} />
      </View>
      <Text style={styles.actionTitle}>Reporta un incidente</Text>
      <Text variant="p2" color="secondary" style={styles.actionSubtitle}>
        Describe lo que ocurre y adjunta una foto si puede ayudar al diagnóstico.
      </Text>
      <Button
        label="Nueva solicitud"
        variant="primary"
        size="medium"
        fullWidth
        leftIcon={<Feather name="plus" size={20} color={semanticColors.text.inverse} />}
        onPress={onPress}
        style={styles.actionButton}
      />
    </View>
  );
}

function RecentHistoryHeader({ onViewAll }: { onViewAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="h2" color="primary">
        Historial reciente
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver todo el historial"
        onPress={onViewAll}
        style={styles.viewAll}
      >
        <Text variant="caption" color="secondary" style={styles.viewAllText}>
          Ver todo
        </Text>
        <Feather name="chevron-right" size={14} color={semanticColors.text.secondary} />
      </Pressable>
    </View>
  );
}

function HomeEmptyState({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      icon="file-text"
      title="Aún no tienes solicitudes"
      description="Cuando reportes un incidente, aparecerá aquí con su estado y código."
      actionLabel="Crear solicitud"
      onAction={onAction}
    />
  );
}

export default function FuncionarioHomeScreen() {
  const { user } = useAuth();
  const statsQuery = useSolicitudStats();
  const historialQuery = useMisSolicitudes();

  if (!user) {
    return null;
  }

  const recentItems = (historialQuery.data ?? []).slice(0, 3);
  const firstName = user.fullName.split(' ')[0];

  const isRefreshing =
    (statsQuery.isFetching || historialQuery.isFetching) &&
    !(statsQuery.isLoading || historialQuery.isLoading);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          // Adaptive: clears gesture bar and 3-button nav alike.
          { paddingBottom: spacing[8] },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void statsQuery.refetch();
              void historialQuery.refetch();
            }}
          />
        }
      >
        <CompactHeader
          firstName={firstName}
          fullName={user.fullName}
          onProfile={() => router.push('/(funcionario)/(tabs)/(cuenta)')}
        />

        <QueryBoundary
          isLoading={statsQuery.isLoading}
          isError={statsQuery.isError}
          error={statsQuery.error}
          hasData={statsQuery.dataUpdatedAt > 0}
          onRetry={() => void statsQuery.refetch()}
          skeleton={statsQuery.isLoading}
          skeletonVariant="stats"
        >
          <View style={styles.kpiRow}>
            <KpiCard
              value={statsQuery.stats.total}
              label="Solicitudes"
              variant="default"
              style={styles.kpiTotal}
            />
            <KpiCard
              value={statsQuery.stats.pending}
              label="Requieren acción"
              variant="warning"
              style={styles.kpiPending}
            />
            <KpiCard
              value={statsQuery.stats.resolved}
              label="Cerradas"
              variant="success"
              style={styles.kpiResolved}
            />
          </View>
        </QueryBoundary>

        <ActionCard
          onPress={() => router.push('../(crear)')}
        />

        <View style={styles.section}>
          <RecentHistoryHeader
            onViewAll={() => router.push('/(funcionario)/(tabs)/(historial)')}
          />
          <View style={styles.listContainer}>
            <QueryBoundary
              isLoading={historialQuery.isLoading}
              isError={historialQuery.isError}
              error={historialQuery.error}
              hasData={historialQuery.dataUpdatedAt > 0}
              onRetry={() => void historialQuery.refetch()}
              isEmpty={recentItems.length === 0}
              emptyFallback={
                <HomeEmptyState
                  onAction={() =>
                    router.push('../(crear)')
                  }
                />
              }
              skeleton={historialQuery.isLoading}
              skeletonVariant="listItem"
              skeletonCount={2}
            >
              {recentItems.map((item) => (
                <SolicitudListItem
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: '/(funcionario)/(tabs)/(home)/solicitud/[id]',
                      params: { id: item.id },
                    })
                  }
                />
              ))}
            </QueryBoundary>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semanticColors.surface.muted,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  header: {
    gap: spacing[4],
  },
  headerTop: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  user: {
    minWidth: 64,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: semanticColors.brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    color: semanticColors.text.inverse,
    fontWeight: '700',
  },
  heroCopy: {
    gap: spacing[1],
  },
  greeting: {
    marginBottom: spacing[1],
  },
  heroTitle: {
    maxWidth: 330,
  },
  heroDescription: {
    marginTop: spacing[1],
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing[3],
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  kpiCard: {
    flex: 1,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    borderRightWidth: 1,
    borderRightColor: semanticColors.border.default,
  },
  kpiCardWarning: {
    flex: 1,
  },
  kpiCardSuccess: {
    borderRightWidth: 0,
  },
  kpiValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: semanticColors.text.primary,
  },
  kpiValueWarning: {
    color: semanticColors.state.warning,
  },
  kpiValueSuccess: {
    color: semanticColors.state.success,
  },
  kpiLabel: {
    ...typography.caption,
    color: semanticColors.text.secondary,
    textAlign: 'center',
  },
  kpiTotal: {
    flex: 1,
  },
  kpiPending: {
    flex: 1.4,
  },
  kpiResolved: {
    flex: 1,
  },
  actionCard: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.state.successBg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionTitle: {
    ...typography.h2,
    color: semanticColors.text.primary,
  },
  actionSubtitle: {
    marginBottom: spacing[1],
  },
  actionButton: {
    height: 48,
  },
  section: {
    gap: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  viewAllText: {
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  emptyContainer: {
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    backgroundColor: semanticColors.surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  emptyTitle: {
    marginBottom: -spacing[1],
  },
  emptyDescription: {
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: spacing[2],
    height: 48,
  },
});
