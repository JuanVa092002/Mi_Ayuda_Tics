import { useAuth } from '@/features/auth/auth-context';
import { openFuncionarioTabRoot } from '@/features/funcionario/tab-root';
import { useMisSolicitudes, useSolicitudStats } from '@/features/solicitudes/hooks';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Button } from '@/shared/ui/Button';
import { BrandTitle } from '@/shared/ui/BrandTitle';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SolicitudListItem } from '@/shared/ui/SolicitudListItem';
import { Text } from '@/shared/ui/Text';
import { Feather } from '@expo/vector-icons';
import { router, useNavigation, useScrollToTop } from 'expo-router';
import { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
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
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function HomeHeader({ fullName, onProfile }: { fullName: string; onProfile: () => void }) {
  const firstName = fullName.trim().split(/\s+/)[0] || 'Funcionario';

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <BrandTitle size="small" showSubtitle />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir cuenta de ${fullName}`}
          accessibilityHint="Abre tu información de cuenta"
          onPress={onProfile}
          style={({ pressed }) => [styles.profileButton, pressed && styles.profileButtonPressed]}
        >
          <View style={styles.avatar} accessible={false}>
            <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.heroCopy}>
        <Text variant="p2" color="secondary">
          {getTimeBasedGreeting()}, {firstName}
        </Text>
        <Text variant="h1" color="primary" style={styles.heroTitle}>
          El soporte que necesitas, sin rodeos.
        </Text>
        <Text variant="p2" color="secondary" style={styles.heroDescription}>
          Registra un incidente y sigue cada actualización desde aquí.
        </Text>
      </View>
    </View>
  );
}

function ActivitySummary({ total, active, resolved }: { total: number; active: number; resolved: number }) {
  return (
    <View style={styles.summaryCard} accessibilityRole="summary" accessibilityLabel={`${total} solicitudes: ${active} activas y ${resolved} resueltas`}>
      <View style={styles.summaryHeading}>
        <Text variant="h3">Tu actividad</Text>
        <Text variant="caption" color="secondary">Vista general</Text>
      </View>
      <View style={styles.summaryMetrics}>
        <Metric value={total} label="Total" />
        <Metric value={active} label="Activas" emphasized />
        <Metric value={resolved} label="Resueltas" success />
      </View>
    </View>
  );
}

function Metric({ value, label, emphasized = false, success = false }: { value: number; label: string; emphasized?: boolean; success?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, emphasized && styles.metricValueEmphasized, success && styles.metricValueSuccess]}>
        {value}
      </Text>
      <Text variant="caption" color="secondary" style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function CreateRequestCard({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.createCard}>
      <View style={styles.createIcon}>
        <Feather name="plus" size={22} color={semanticColors.brand.green} />
      </View>
      <Text variant="h2" color="inverse">¿Tienes un inconveniente?</Text>
      <Text variant="p2" color="inverse" style={styles.createDescription}>
        Cuéntanos qué ocurre. Adjuntar una foto ayuda a resolverlo más rápido.
      </Text>
      <Button
        label="Crear solicitud"
        variant="primary"
        fullWidth
        leftIcon={<Feather name="plus" size={18} color={semanticColors.text.inverse} />}
        onPress={onPress}
        style={styles.createButton}
      />
    </View>
  );
}

function RecentHeader({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text variant="h2">Actividad reciente</Text>
        <Text variant="caption" color="secondary">Tus tres últimas solicitudes</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver todas las solicitudes"
        onPress={onPress}
        style={styles.viewAllButton}
      >
        <Text variant="p2" color="link" style={styles.viewAllText}>Ver todas</Text>
        <Feather name="arrow-up-right" size={16} color={semanticColors.brand.blue} />
      </Pressable>
    </View>
  );
}

export default function FuncionarioHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const statsQuery = useSolicitudStats();
  const historialQuery = useMisSolicitudes();

  if (!user) return null;

  const recentItems = (historialQuery.data ?? []).slice(0, 3);
  const isRefreshing = (statsQuery.isFetching || historialQuery.isFetching) && !statsQuery.isLoading;
  const openCreate = () => router.push('/(funcionario)/nueva-solicitud');
  const openCasosList = () => {
    const tabs = navigation.getParent();
    if (tabs) {
      openFuncionarioTabRoot(tabs, '(historial)');
      return;
    }
    router.navigate('/(funcionario)/(tabs)/(historial)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={semanticColors.brand.green}
            onRefresh={() => {
              void statsQuery.refetch();
              void historialQuery.refetch();
            }}
          />
        }
      >
        <HomeHeader fullName={user.fullName} onProfile={() => router.push('/(funcionario)/(tabs)/(cuenta)')} />

        <QueryBoundary
          isLoading={statsQuery.isLoading}
          isError={statsQuery.isError}
          error={statsQuery.error}
          hasData={statsQuery.dataUpdatedAt > 0}
          onRetry={() => void statsQuery.refetch()}
          skeleton
          skeletonVariant="stats"
        >
          <ActivitySummary total={statsQuery.stats.total} active={statsQuery.stats.pending} resolved={statsQuery.stats.resolved} />
        </QueryBoundary>

        <CreateRequestCard onPress={openCreate} />

        <View style={styles.recentSection}>
          <RecentHeader onPress={openCasosList} />
          <QueryBoundary
            isLoading={historialQuery.isLoading}
            isError={historialQuery.isError}
            error={historialQuery.error}
            hasData={historialQuery.dataUpdatedAt > 0}
            onRetry={() => void historialQuery.refetch()}
            isEmpty={recentItems.length === 0}
            emptyFallback={<EmptyState icon="file-text" title="Aún no tienes solicitudes" description="Cuando reportes un incidente, podrás ver su seguimiento aquí." actionLabel="Crear solicitud" onAction={openCreate} />}
            skeleton
            skeletonVariant="listItem"
            skeletonCount={2}
          >
            <View style={styles.recentList}>
              {recentItems.map((item) => (
                <SolicitudListItem
                  key={item.id}
                  item={item}
                  variant="card"
                  onPress={() => router.push({ pathname: '/(funcionario)/(tabs)/(home)/solicitud/[id]', params: { id: item.id } })}
                />
              ))}
            </View>
          </QueryBoundary>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: semanticColors.surface.muted },
  scroll: { flexGrow: 1, paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[10], gap: spacing[6] },
  header: { gap: spacing[5] },
  headerTop: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileButton: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  profileButtonPressed: { backgroundColor: semanticColors.surface.well },
  avatar: { width: 38, height: 38, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: semanticColors.brand.blue },
  avatarText: { ...typography.caption, color: semanticColors.text.inverse, fontWeight: '700' },
  heroCopy: { gap: spacing[2] },
  heroTitle: { maxWidth: 345 },
  heroDescription: { maxWidth: 320 },
  summaryCard: { backgroundColor: semanticColors.surface.card, borderRadius: radius.lg, padding: spacing[4], gap: spacing[4], borderWidth: 1, borderColor: semanticColors.border.default, ...shadows.sm },
  summaryHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing[2] },
  summaryMetrics: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: semanticColors.border.default, paddingTop: spacing[3] },
  metric: { flex: 1, alignItems: 'center', gap: spacing[1] },
  metricValue: { fontVariant: ['tabular-nums'], fontSize: 24, lineHeight: 30, fontWeight: '700', color: semanticColors.text.primary },
  metricValueEmphasized: { color: semanticColors.brand.blue },
  metricValueSuccess: { color: semanticColors.brand.green },
  metricLabel: { textAlign: 'center' },
  createCard: { padding: spacing[5], borderRadius: radius.lg, gap: spacing[3], backgroundColor: semanticColors.brand.blue, ...shadows.sm },
  createIcon: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: semanticColors.surface.card },
  createDescription: { color: 'rgba(255, 255, 255, 0.78)' },
  createButton: { marginTop: spacing[1] },
  recentSection: { gap: spacing[3] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  viewAllButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingLeft: spacing[2] },
  viewAllText: { fontWeight: '700' },
  recentList: { gap: spacing[2] },
});
