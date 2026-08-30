import { useSolicitudDetalle } from '@/features/solicitudes/hooks';
import { buildSolicitudTimeline, formatSolicitudDate } from '@/shared/contracts/solicitud';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { AuthenticatedImage } from '@/shared/ui/AuthenticatedImage';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { StatusTimeline } from '@/shared/ui/StatusTimeline';
import { Text } from '@/shared/ui/Text';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function SolicitudDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const solicitudId = Array.isArray(id) ? id[0] : id ?? '';
  const detalleQuery = useSolicitudDetalle(solicitudId);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitle: 'Detalle de solicitud',
          headerStyle: { backgroundColor: semanticColors.surface.default },
          headerTintColor: semanticColors.text.primary,
          headerShadowVisible: false,
        }}
      />
      <QueryBoundary
        isLoading={detalleQuery.isLoading}
        isError={detalleQuery.isError}
        error={detalleQuery.error}
        hasData={detalleQuery.dataUpdatedAt > 0}
        onRetry={() => void detalleQuery.refetch()}
      >
        {detalleQuery.data ? (
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: spacing[8] },
            ]}
          >
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.codeBlock}>
                  <Text variant="caption" color="tertiary" style={styles.eyebrow}>
                    Código de solicitud
                  </Text>
                  <Text variant="h1" color="link" style={styles.code}>
                    {detalleQuery.data.caseCode
                      ? detalleQuery.data.caseCode
                      : 'Código no disponible. Consulta el detalle más tarde.'}
                  </Text>
                </View>
                <StatusBadge status={detalleQuery.data.status} />
              </View>

              <View style={styles.timelineSection}>
                <StatusTimeline steps={buildSolicitudTimeline(detalleQuery.data)} />
              </View>

              <DetailRow
                label="Fecha"
                value={formatSolicitudDate(detalleQuery.data.createdAtRaw)}
              />
              <DetailRow
                label="Ambiente"
                value={detalleQuery.data.environmentName ?? '—'}
              />
              <DetailRow
                label="Tipo de caso"
                value={detalleQuery.data.caseTypeName ?? '—'}
              />
              {detalleQuery.data.phone ? (
                <DetailRow
                  label="Teléfono"
                  value={detalleQuery.data.phone}
                />
              ) : null}
              {detalleQuery.data.technicianName ? (
                <DetailRow
                  label="Técnico asignado"
                  value={detalleQuery.data.technicianName}
                />
              ) : null}

              <Text variant="h3" color="link" style={styles.sectionLabel}>
                Descripción
              </Text>
              <Text variant="p2" color="primary" style={styles.bodyText}>
                {detalleQuery.data.description}
              </Text>

              {detalleQuery.data.photo?.url ? (
                <>
                  <Text variant="h3" color="link" style={styles.sectionLabel}>
                    Foto del incidente
                  </Text>
                  <AuthenticatedImage
                    url={
                      detalleQuery.data.photo.optimizedUrl ??
                      detalleQuery.data.photo.url
                    }
                    accessibilityLabel="Foto del incidente"
                    style={styles.image}
                  />
                </>
              ) : null}

              {detalleQuery.data.solution ? (
                <>
                  <Text variant="h3" color="link" style={styles.sectionLabel}>
                    Solución registrada
                  </Text>
                  <Text variant="p2" color="primary" style={styles.bodyText}>
                    {detalleQuery.data.solution.description}
                  </Text>
                  {detalleQuery.data.solution.evidenceUrl ? (
                    <AuthenticatedImage
                      url={detalleQuery.data.solution.evidenceUrl}
                      accessibilityLabel="Evidencia de la solución"
                      style={styles.image}
                    />
                  ) : null}
                </>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
      </QueryBoundary>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" color="secondary" style={styles.rowLabel}>
        {label}
      </Text>
      <Text variant="p2" color="primary" style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    backgroundColor: semanticColors.surface.muted,
  },
  card: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[5],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  codeBlock: {
    flex: 1,
    gap: spacing[1],
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timelineSection: {
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: semanticColors.border.default,
  },
  code: {
    flexShrink: 1,
  },
  row: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: semanticColors.surface.muted,
  },
  rowLabel: {
    textTransform: 'uppercase',
  },
  rowValue: {},
  sectionLabel: {
    marginTop: spacing[3],
  },
  bodyText: {
    lineHeight: 23,
  },
  image: {
    width: '100%',
    height: 216,
    borderRadius: radius.lg,
    backgroundColor: semanticColors.surface.muted,
  },
});
