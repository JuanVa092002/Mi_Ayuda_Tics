import { useAuth } from '@/features/auth/auth-context';
import { useCasosAsignados, useCasosResueltos } from '@/features/casos/hooks';
import { OfflineBanner, TechnicianHeader, TechnicianMosaics, TechnicianToast } from '@/features/tecnico/components/home-blocks';
import { TechnicianEmptyState } from '@/features/tecnico/components/TechnicianEmptyState';
import { TechnicianSkeleton } from '@/features/tecnico/components/TechnicianSkeleton';
import { TechnicianTicketCard } from '@/features/tecnico/components/TechnicianTicketCard';
import {
  buildTecnicoInsight,
  casosForQueue,
  emptyCopyForQueue,
  queuesForFocus,
  sectionTitleForQueue,
  type TecnicoFocus,
  type TecnicoMosaicKey,
  type TecnicoQueueTab,
} from '@/features/tecnico/home-model';
import { pendingDrafts } from '@/features/tecnico/offline-model';
import { getAssignedSource, peekTecnicoOffline } from '@/features/tecnico/offline-store';
import { filterCasosByQuery, type CasoSummary } from '@/shared/contracts/caso';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { FadeIn } from '@/shared/ui/FadeIn';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SearchField } from '@/shared/ui/SearchField';
import { Text } from '@/shared/ui/Text';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function navigateToCaso(item: CasoSummary, action?: 'update') {
  router.push({
    pathname: '/(tecnico)/caso/[id]',
    params: {
      id: item.id,
      ...(item.caseTypeId ? { caseTypeId: item.caseTypeId } : {}),
      ...(action ? { action } : {}),
    },
  });
}

export function TechnicianHome() {
  const { user, logout } = useAuth();
  const [focus, setFocus] = useState<TecnicoFocus>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const asignadosQuery = useCasosAsignados();
  const resueltosQuery = useCasosResueltos();
  const fromCache = getAssignedSource(user?.id ?? '') === 'cache';
  const reduceMotion = useReduceMotion();
  const assigned = asignadosQuery.data ?? [];
  const insight = useMemo(
    () => buildTecnicoInsight(assigned, resueltosQuery.data ?? []),
    [assigned, resueltosQuery.data],
  );

  const pendingCount = user?.id ? pendingDrafts(peekTecnicoOffline(user.id) ?? { assigned: [], closed: [], details: {}, drafts: {} }).length : 0;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const handleMosaic = (key: TecnicoMosaicKey) => {
    setFocus((current) => (current === key ? 'all' : key));
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const isRefreshing =
    (asignadosQuery.isFetching || resueltosQuery.isFetching) &&
    !(asignadosQuery.isLoading || resueltosQuery.isLoading);

  if (!user) return null;

  const queues = queuesForFocus(focus);
  const searching = search.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={semanticColors.brand.green}
            onRefresh={() => {
              void asignadosQuery.refetch();
              void resueltosQuery.refetch();
            }}
          />
        }
      >
        <TechnicianHeader
          fullName={user.fullName}
          scanLine={asignadosQuery.isLoading && asignadosQuery.dataUpdatedAt === 0 ? 'Cargando tu cola…' : insight.scanLine}
          onProfile={handleLogout}
        />

        <OfflineBanner fromCache={fromCache} pendingCount={pendingCount} />
        <TechnicianToast message={toast} />

        <FadeIn delay={40} disabled={reduceMotion}>
          <TechnicianMosaics insight={insight} focus={focus} onSelect={handleMosaic} />
        </FadeIn>

        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por código, ambiente o solicitante"
          compact
          variant="filled"
        />

        {focus !== 'all' ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ver toda la cola" onPress={() => setFocus('all')}>
            <Text variant="p2" color="link">
              Ver toda la cola
            </Text>
          </Pressable>
        ) : null}

        <QueryBoundary
          isLoading={asignadosQuery.isLoading}
          isError={asignadosQuery.isError}
          error={asignadosQuery.error}
          hasData={asignadosQuery.dataUpdatedAt > 0}
          onRetry={() => void asignadosQuery.refetch()}
          isEmpty={insight.openTotal === 0 && !searching}
          loadingFallback={<TechnicianSkeleton />}
          emptyFallback={
            <TechnicianEmptyState
              icon="check-circle"
              title="Cola al día"
              description="Cuando te asignen un caso, aparece aquí para atenderlo en un tap."
            />
          }
        >
          <View style={styles.sections}>
            {searching && queues.every((queue) => filterCasosByQuery(casosForQueue(assigned, queue), search).length === 0) ? (
              <TechnicianEmptyState
                icon="search"
                title="Sin coincidencias"
                description="Prueba con otro código, ambiente o solicitante."
              />
            ) : queues.every((queue) => casosForQueue(assigned, queue).length === 0) ? (
              <TechnicianEmptyState
                icon={focus === 'porHacer' ? 'clipboard' : focus === 'enCurso' ? 'tool' : 'clock'}
                title={emptyCopyForQueue(queues[0] ?? 'por_iniciar', false).title}
                description={emptyCopyForQueue(queues[0] ?? 'por_iniciar', false).description}
              />
            ) : (
              queues.map((queue) => (
                <QueueSection
                  key={queue}
                  queue={queue}
                  items={filterCasosByQuery(casosForQueue(assigned, queue), search)}
                  onOpen={navigateToCaso}
                  onUpdate={(item) => navigateToCaso(item, 'update')}
                  onStarted={(queued) =>
                    setToast(queued ? 'Sin conexión. Se enviará al reconectar.' : 'Atención iniciada')
                  }
                />
              ))
            )}
          </View>
        </QueryBoundary>
      </ScrollView>
    </SafeAreaView>
  );
}

function QueueSection({
  queue,
  items,
  onOpen,
  onUpdate,
  onStarted,
}: {
  queue: TecnicoQueueTab;
  items: CasoSummary[];
  onOpen: (item: CasoSummary) => void;
  onUpdate: (item: CasoSummary) => void;
  onStarted: (queued: boolean) => void;
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text variant="h2">{sectionTitleForQueue(queue, items.length)}</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <TechnicianTicketCard
            key={item.id}
            item={item}
            queue={queue}
            onOpen={() => onOpen(item)}
            onUpdate={() => onUpdate(item)}
            onStarted={onStarted}
          />
        ))}
      </View>
    </View>
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
  sections: { gap: spacing[5] },
  section: { gap: spacing[3] },
  list: { gap: spacing[2] },
});
