import { useAuth } from '@/features/auth/auth-context';
import {
  useCasosAsignados,
  useCasosResueltos,
} from '@/features/casos/hooks';
import {
  filterCasosByQuery,
  filterCasosEnProgreso,
  filterCasosEsperandoConfirmacion,
  filterCasosEsperandoFuncionario,
  filterCasosPorResolver,
  sortCasosByMostRecent,
  type CasoSummary,
} from '@/shared/contracts/caso';
import { colors } from '@/shared/theme/colors';
import { CasoListItem } from '@/shared/ui/CasoListItem';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { RoleHomeShell } from '@/shared/ui/RoleHomeShell';
import { SearchField } from '@/shared/ui/SearchField';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

type TecnicoTab =
  | 'por_iniciar'
  | 'en_atencion'
  | 'esperando_funcionario'
  | 'esperando_confirmacion';

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
  const [activeTab, setActiveTab] = useState<TecnicoTab>('por_iniciar');
  const [search, setSearch] = useState('');
  const asignadosQuery = useCasosAsignados();
  const resueltosQuery = useCasosResueltos();

  const queuedItems = useMemo(() => {
    const all = asignadosQuery.data ?? [];
    if (activeTab === 'por_iniciar') return sortCasosByMostRecent(filterCasosPorResolver(all));
    if (activeTab === 'en_atencion') return sortCasosByMostRecent(filterCasosEnProgreso(all));
    if (activeTab === 'esperando_funcionario') {
      return sortCasosByMostRecent(filterCasosEsperandoFuncionario(all));
    }
    return sortCasosByMostRecent(filterCasosEsperandoConfirmacion(all));
  }, [asignadosQuery.data, activeTab]);

  const filteredActiveItems = useMemo(
    () => filterCasosByQuery(queuedItems, search),
    [queuedItems, search],
  );

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    void asignadosQuery.refetch();
    void resueltosQuery.refetch();
  };

  const isRefreshing =
    (asignadosQuery.isFetching || resueltosQuery.isFetching) &&
    !(asignadosQuery.isLoading || resueltosQuery.isLoading);

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
        {(
          [
            ['por_iniciar', 'Por iniciar'],
            ['en_atencion', 'En atención'],
            ['esperando_funcionario', 'Esperando al Funcionario'],
            ['esperando_confirmacion', 'Esperando confirmación'],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === id }}
            style={[styles.tab, activeTab === id && styles.tabActive]}
            onPress={() => setActiveTab(id)}
          >
            <Text style={[styles.tabText, activeTab === id && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
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
            isLoading={asignadosQuery.isLoading}
            isError={asignadosQuery.isError}
            error={asignadosQuery.error}
            hasData={asignadosQuery.dataUpdatedAt > 0}
            onRetry={() => void asignadosQuery.refetch()}
            isEmpty={filteredActiveItems.length === 0}
            emptyTitle={
              search
                ? 'Sin coincidencias'
                : activeTab === 'por_iniciar'
                  ? 'No tienes casos por iniciar'
                  : activeTab === 'en_atencion'
                    ? 'Sin casos en atención'
                    : activeTab === 'esperando_funcionario'
                      ? 'Nada esperando al Funcionario'
                      : 'Nada esperando confirmación'
            }
            emptyDescription={
              search
                ? 'Prueba con otro término de búsqueda.'
                : 'Los tickets de esta cola aparecerán aquí.'
            }
          >
            {filteredActiveItems.map((item) => (
              <CasoListItem key={item.id} item={item} onPress={() => navigateToCaso(item)} />
            ))}
          </QueryBoundary>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Terminados</Text>
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
    flexWrap: 'wrap',
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
    flexGrow: 1,
    flexBasis: '40%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.brandBlue,
  },
  tabText: {
    fontSize: 11,
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
