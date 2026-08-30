import { useCasoDetalle } from '@/features/casos/hooks';
import { canResolveCaso } from '@/shared/contracts/caso';
import { buildSolicitudTimeline, formatSolicitudDate } from '@/shared/contracts/solicitud';
import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ScreenScaffold } from '@/shared/ui/ScreenScaffold';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { StatusTimeline } from '@/shared/ui/StatusTimeline';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CasoDetalleScreen() {
  const { id, caseTypeId } = useLocalSearchParams<{ id: string; caseTypeId?: string }>();
  const casoId = Array.isArray(id) ? id[0] : id ?? '';
  const routeCaseTypeId = Array.isArray(caseTypeId) ? caseTypeId[0] : caseTypeId;
  const detalleQuery = useCasoDetalle(casoId);
  const caso = detalleQuery.data;

  return (
    <ScreenScaffold
      title="Detalle del caso"
      subtitle={caso?.caseCode}
      onBack={() => router.back()}
    >
      <QueryBoundary
        isLoading={detalleQuery.isLoading}
        isError={detalleQuery.isError}
        error={detalleQuery.error}
        hasData={detalleQuery.dataUpdatedAt > 0}
        onRetry={() => void detalleQuery.refetch()}
      >
        {caso ? (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.code}>{caso.caseCode}</Text>
                <StatusBadge status={caso.status} />
              </View>

              <StatusTimeline steps={buildSolicitudTimeline(caso)} />

              <DetailRow label="Fecha" value={formatSolicitudDate(caso.createdAtRaw)} />
              <DetailRow label="Solicitante" value={caso.requesterName ?? '—'} />
              <DetailRow label="Ambiente" value={caso.environmentName ?? '—'} />
              <DetailRow label="Tipo de caso" value={caso.caseTypeName ?? '—'} />
              <DetailRow label="Teléfono" value={caso.phone ?? '—'} />

              <Text style={styles.sectionLabel}>Descripción</Text>
              <Text style={styles.bodyText}>{caso.description}</Text>

              {caso.photoUrl ? (
                <>
                  <Text style={styles.sectionLabel}>Foto del incidente</Text>
                  <Image source={{ uri: caso.photoUrl }} style={styles.image} contentFit="cover" />
                </>
              ) : null}

              {caso.solutionDescription ? (
                <>
                  <Text style={styles.sectionLabel}>Solución registrada</Text>
                  <Text style={styles.bodyText}>{caso.solutionDescription}</Text>
                  {caso.solutionEvidenceUrl ? (
                    <Image
                      source={{ uri: caso.solutionEvidenceUrl }}
                      style={styles.image}
                      contentFit="cover"
                    />
                  ) : null}
                </>
              ) : null}
            </View>

            {canResolveCaso(caso) ? (
              <AppButton
                label="Resolver caso"
                variant="green"
                onPress={() =>
                  router.push({
                    pathname: '/(tecnico)/caso/[id]/resolver',
                    params: {
                      id: caso.id,
                      ...((caso.caseTypeId ?? routeCaseTypeId)
                        ? { caseTypeId: caso.caseTypeId ?? routeCaseTypeId }
                        : {}),
                    },
                  })
                }
              />
            ) : null}
          </ScrollView>
        ) : null}
      </QueryBoundary>
    </ScreenScaffold>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  code: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brandBlue,
  },
  row: {
    gap: 2,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7C93',
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 15,
    color: colors.textDark,
  },
  sectionLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandBlue,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDark,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
  },
});
