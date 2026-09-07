import { useMisSolicitudes } from '@/features/solicitudes/hooks';
import {
  filterSolicitudesByHistorialChip,
  filterSolicitudesByQuery,
  HISTORIAL_FILTER_CHIPS,
  type HistorialChip,
} from '@/shared/contracts/solicitud';
import { layout, spacing } from '@/shared/theme/spacing';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { radius } from '@/shared/theme/radius';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FilterChips } from '@/shared/ui/FilterChips';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SearchField } from '@/shared/ui/SearchField';
import { SolicitudListItem } from '@/shared/ui/SolicitudListItem';
import { Text } from '@/shared/ui/Text';
import { router, Stack, useScrollToTop } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTER_OPTIONS = HISTORIAL_FILTER_CHIPS;

export default function HistorialScreen() {
  const historialQuery = useMisSolicitudes();
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<HistorialChip>('Todas');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredItems = useMemo(() => {
    let items = historialQuery.data ?? [];
    items = filterSolicitudesByHistorialChip(items, activeFilter);
    return filterSolicitudesByQuery(items, debouncedSearch);
  }, [historialQuery.data, activeFilter, debouncedSearch]);

  const countLabel =
    filteredItems.length === 1
      ? '1 solicitud'
      : `${filteredItems.length} solicitudes`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text variant="h1">Mis solicitudes</Text>
              <Text variant="p2" color="secondary">Consulta el estado de cada reporte.</Text>
            </View>
            {!historialQuery.isLoading ? (
              <View style={styles.countPill}>
                <Text variant="caption" color="brandBlue" style={styles.count}>{countLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.toolbar}>
          <SearchField
            compact
            variant="filled"
            value={search}
            onChangeText={setSearch}
            placeholder="Código, descripción o ambiente"
          />
          <FilterChips
            options={FILTER_OPTIONS}
            selected={activeFilter}
            onSelect={(value) => setActiveFilter(value as HistorialChip)}
          />
        </View>

        <View style={styles.listWrap}>
          <QueryBoundary
            isLoading={historialQuery.isLoading}
            isError={historialQuery.isError}
            error={historialQuery.error}
            hasData={historialQuery.dataUpdatedAt > 0}
            onRetry={() => void historialQuery.refetch()}
            isEmpty={filteredItems.length === 0}
            emptyTitle={debouncedSearch ? 'Sin coincidencias' : 'Sin solicitudes'}
            emptyDescription={
              debouncedSearch
                ? 'Prueba con otro término de búsqueda.'
                : 'Cuando registres un incidente, aparecerá aquí con su seguimiento.'
            }
            emptyFallback={
              <EmptyState
                icon={debouncedSearch ? 'search' : 'file-text'}
                title={debouncedSearch ? 'Sin coincidencias' : 'Aún no tienes solicitudes'}
                description={
                  debouncedSearch
                    ? 'Prueba con otro término de búsqueda.'
                    : 'Cuando registres un incidente, aparecerá aquí con su seguimiento.'
                }
                actionLabel={debouncedSearch ? undefined : 'Crear solicitud'}
                onAction={
                  debouncedSearch ? undefined : () => router.push('/(funcionario)/nueva-solicitud')
                }
              />
            }
            skeleton={historialQuery.isLoading}
            skeletonVariant="listItem"
          >
            <FlatList
              ref={listRef}
              data={filteredItems}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={historialQuery.isFetching && !historialQuery.isLoading}
                  onRefresh={() => void historialQuery.refetch()}
                />
              }
              renderItem={({ item, index }) => {
                const isFirst = index === 0;
                const isLast = index === filteredItems.length - 1;
                return (
                  <View
                    style={[
                      styles.groupItem,
                      isFirst && styles.groupFirst,
                      isLast && styles.groupLast,
                    ]}
                  >
                    <SolicitudListItem
                      variant="flush"
                      showDivider={!isLast}
                      item={item}
                      onPress={() =>
                        router.push({
                          pathname: '/(funcionario)/(tabs)/(historial)/solicitud/[id]',
                          params: { id: item.id },
                        })
                      }
                    />
                  </View>
                );
              }}
            />
          </QueryBoundary>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semanticColors.surface.muted,
  },
  header: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  titleCopy: {
    flexShrink: 1,
    gap: spacing[1],
  },
  countPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: semanticColors.state.infoBg,
  },
  count: {
    fontWeight: '600',
  },
  toolbar: {
    paddingHorizontal: layout.screenPaddingX,
    gap: spacing[3],
    paddingBottom: spacing[4],
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingBottom: spacing[8],
    paddingTop: spacing[1],
  },
  groupItem: {
    backgroundColor: semanticColors.surface.card,
    overflow: 'hidden',
  },
  groupFirst: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  groupLast: {
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
});
