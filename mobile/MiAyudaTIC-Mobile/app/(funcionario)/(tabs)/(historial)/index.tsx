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
import { typography } from '@/shared/theme/typography';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FilterChips } from '@/shared/ui/FilterChips';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { SearchField } from '@/shared/ui/SearchField';
import { SolicitudListItem } from '@/shared/ui/SolicitudListItem';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTER_OPTIONS = HISTORIAL_FILTER_CHIPS;

export default function HistorialScreen() {
  const historialQuery = useMisSolicitudes();
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
            <Text style={styles.title}>Mis solicitudes</Text>
            {!historialQuery.isLoading ? (
              <Text style={styles.count}>{countLabel}</Text>
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
                  debouncedSearch ? undefined : () => router.push('../(crear)')
                }
              />
            }
            skeleton={historialQuery.isLoading}
            skeletonVariant="listItem"
          >
            <FlatList
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
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    fontWeight: '700',
    color: semanticColors.text.primary,
    flexShrink: 1,
  },
  count: {
    ...typography.caption,
    color: semanticColors.text.tertiary,
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
