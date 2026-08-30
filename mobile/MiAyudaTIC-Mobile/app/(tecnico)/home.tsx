import { useAuth } from '@/features/auth/auth-context';
import {
  useCasosPorResolver,
  useCasosResueltos,
  useMisCasos,
} from '@/features/casos/hooks';
import type { CasoSummary } from '@/shared/contracts/caso';
import { filterCasosByQuery } from '@/shared/contracts/caso';
import { colors } from '@/shared/theme/colors';
import { CasoListItem } from '@/shared/ui/CasoListItem';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { RoleHomeShell } from '@/shared/ui/RoleHomeShell';
import { SearchField } from '@/shared/ui/SearchField';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

type TecnicoTab = 'por_resolver' | 'mis_casos';

function navigateToCaso(item: CasoSummary) {
  router.push({
    pathname: '/(tecnico)/caso/[id]',
    params: {
      id: item.id,
      ...(item.caseTypeId ? { caseTypeId: item.caseTypeId } : {}),
    },
  });
}

export default function TecnicoHomeScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TecnicoTab>('por_resolver');
  const [search, setSearch] = useState('');
  const porResolverQuery = useCasosPorResolver();
  const misCasosQuery = useMisCasos();
  const resueltosQuery = useCasosResueltos();

  const activeQuery = activeTab === 'por_resolver' ? porResolverQuery : misCasosQuery;

  const filteredActiveItems = useMemo(
    () => filterCasosByQuery(activeQuery.data ?? [], search),
    [activeQuery.data, search],
  );

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    void porResolverQuery.refetch();
    void misCasosQuery.refetch();
    void resueltosQuery.refetch();
  };

  const isRefreshing =
    (porResolverQuery.isFetching ||
      misCasosQuery.isFetching ||
      resueltosQuery.isFetching) &&
    !(porResolverQuery.isLoading || misCasosQuery.isLoading || resueltosQuery.isLoading);

  if (!user) {
    return null;
  }

  return (
    <RoleHomeShell
      roleLabel="Técnico"
      title="Casos asignados"
      subtitle="Gestiona y resuelve solicitudes TIC asignadas a ti en campo."
      userName={user.fullName}
      userEmail={user.email}
      onLogout={() => void handleLogout()}
    >
      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'por_resolver' }}
          style={[styles.tab, activeTab === 'por_resolver' && styles.tabActive]}
          onPress={() => setActiveTab('por_resolver')}
        >
          <Text style={[styles.tabText, activeTab === 'por_resolver' && styles.tabTextActive]}>
            Por resolver
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'mis_casos' }}
          style={[styles.tab, activeTab === 'mis_casos' && styles.tabActive]}
          onPress={() => setActiveTab('mis_casos')}
        >
          <Text style={[styles.tabText, activeTab === 'mis_casos' && styles.tabTextActive]}>
            En progreso
          </Text>
        </Pressable>
      </View>

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por código, solicitante o ambiente"
        style={styles.search}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.sectionCard}>
          <QueryBoundary
            isLoading={activeQuery.isLoading}
            isError={activeQuery.isError}
            error={activeQuery.error}
            hasData={activeQuery.dataUpdatedAt > 0}
            onRetry={() => void activeQuery.refetch()}
            isEmpty={filteredActiveItems.length === 0}
            emptyTitle={
              search
                ? 'Sin coincidencias'
                : activeTab === 'por_resolver'
                  ? 'No tienes casos por resolver'
                  : 'Sin casos en progreso'
            }
            emptyDescription={
              search
                ? 'Prueba con otro término de búsqueda.'
                : activeTab === 'por_resolver'
                  ? 'Cuando el líder TIC te asigne un ticket, lo verás aquí para atenderlo.'
                  : 'Los casos asignados o pendientes de cierre aparecerán aquí.'
            }
          >
            {filteredActiveItems.map((item) => (
              <CasoListItem key={item.id} item={item} onPress={() => navigateToCaso(item)} />
            ))}
          </QueryBoundary>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resueltos recientes</Text>
          <QueryBoundary
            isLoading={resueltosQuery.isLoading}
            isError={resueltosQuery.isError}
            error={resueltosQuery.error}
            hasData={resueltosQuery.dataUpdatedAt > 0}
            onRetry={() => void resueltosQuery.refetch()}
            isEmpty={(resueltosQuery.data?.length ?? 0) === 0}
            emptyTitle="Historial vacío"
            emptyDescription="Los casos finalizados se listarán aquí."
          >
            {(resueltosQuery.data ?? []).map((item) => (
              <CasoListItem key={item.id} item={item} onPress={() => navigateToCaso(item)} />
            ))}
          </QueryBoundary>
        </View>
      </ScrollView>
    </RoleHomeShell>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  search: {
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.brandBlue,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandBlue,
  },
  tabTextActive: {
    color: colors.white,
  },
  scroll: {
    paddingBottom: 32,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandBlue,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
});
