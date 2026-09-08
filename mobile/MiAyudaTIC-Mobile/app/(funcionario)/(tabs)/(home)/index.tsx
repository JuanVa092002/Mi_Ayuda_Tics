import { useAuth } from '@/features/auth/auth-context';
import {
  HomeAttentionCard,
  HomeCreateCta,
  HomeHeader,
  HomeMetrics,
  HomeRecentHeader,
} from '@/features/funcionario/home-blocks';
import {
  buildHomeInsight,
  historialChipForMetric,
  pickHomeAttention,
  type HomeMetricKey,
} from '@/features/funcionario/home-model';
import { queueHistorialChip } from '@/features/funcionario/historial-intent';
import { openFuncionarioTabRoot } from '@/features/funcionario/tab-root';
import { useMisSolicitudes } from '@/features/solicitudes/hooks';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FadeIn } from '@/shared/ui/FadeIn';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SkeletonListItem } from '@/shared/ui/SkeletonListItem';
import { SkeletonStats } from '@/shared/ui/SkeletonStats';
import { SolicitudListItem } from '@/shared/ui/SolicitudListItem';
import { router, useNavigation, useScrollToTop } from 'expo-router';
import { useMemo, useRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FuncionarioHomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const historialQuery = useMisSolicitudes();
  const reduceMotion = useReduceMotion();
  const items = historialQuery.data;
  const insight = useMemo(() => buildHomeInsight(items ?? []), [items]);
  const attention = useMemo(() => pickHomeAttention(items ?? []), [items]);
  const recentItems = (items ?? []).slice(0, 3);

  if (!user) return null;
  const isRefreshing = historialQuery.isFetching && !historialQuery.isLoading;

  const openCreate = () => router.push('/(funcionario)/nueva-solicitud');
  const openCasosList = (chip?: HomeMetricKey | 'all') => {
    if (chip === 'all' || chip === undefined) {
      queueHistorialChip('Todas');
    } else {
      queueHistorialChip(historialChipForMetric(chip));
    }
    const tabs = navigation.getParent();
    if (tabs) {
      openFuncionarioTabRoot(tabs, '(historial)');
      return;
    }
    router.navigate('/(funcionario)/(tabs)/(historial)');
  };
  const openSolicitud = (id: string) => {
    router.push({ pathname: '/(funcionario)/(tabs)/(home)/solicitud/[id]', params: { id } });
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
              void historialQuery.refetch();
            }}
          />
        }
      >
        <HomeHeader
          fullName={user.fullName}
          scanLine={historialQuery.isLoading && historialQuery.dataUpdatedAt === 0 ? 'Cargando tu actividad…' : insight.scanLine}
          onProfile={() => router.push('/(funcionario)/(tabs)/(cuenta)')}
        />

        <FadeIn delay={40} disabled={reduceMotion}>
          <HomeCreateCta onPress={openCreate} />
        </FadeIn>

        <QueryBoundary
          isLoading={historialQuery.isLoading}
          isError={historialQuery.isError}
          error={historialQuery.error}
          hasData={historialQuery.dataUpdatedAt > 0}
          onRetry={() => void historialQuery.refetch()}
          isEmpty={(items ?? []).length === 0}
          loadingFallback={
            <View style={styles.loadingStack}>
              <SkeletonStats />
              <SkeletonListItem />
              <SkeletonListItem />
            </View>
          }
          emptyFallback={
            <EmptyState
              icon="file-text"
              title="Aún no tienes solicitudes"
              description="Cuando reportes un incidente, el seguimiento aparece aquí."
            />
          }
        >
          <View style={styles.dashboard}>
            <FadeIn delay={80} disabled={reduceMotion}>
              <HomeMetrics insight={insight} onSelect={(key) => openCasosList(key)} />
            </FadeIn>

            {attention ? (
              <FadeIn delay={120} disabled={reduceMotion}>
                <HomeAttentionCard attention={attention} onPress={() => openSolicitud(attention.itemId)} />
              </FadeIn>
            ) : null}

            <FadeIn delay={160} disabled={reduceMotion}>
              <View style={styles.recentSection}>
                <HomeRecentHeader onPress={() => openCasosList('all')} />
                <View style={styles.recentList}>
                  {recentItems.map((item) => (
                    <SolicitudListItem
                      key={item.id}
                      item={item}
                      variant="card"
                      onPress={() => openSolicitud(item.id)}
                    />
                  ))}
                </View>
              </View>
            </FadeIn>
          </View>
        </QueryBoundary>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: semanticColors.surface.muted },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  loadingStack: { gap: spacing[3] },
  dashboard: { gap: spacing[5] },
  recentSection: { gap: spacing[3] },
  recentList: { gap: spacing[2] },
});
