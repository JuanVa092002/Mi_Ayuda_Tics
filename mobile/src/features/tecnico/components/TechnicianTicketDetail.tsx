import {
  useActualizacionCaso,
  useCasoDetalle,
  useIniciarAtencion,
  useSolicitarInformacion,
  useSolucionParcial,
  useSolucionTotal,
} from '@/features/casos/hooks';
import { attentionBannerForCaso } from '@/features/tecnico/actions-model';
import { OfflineBanner } from '@/features/tecnico/components/home-blocks';
import { TechnicianActions } from '@/features/tecnico/components/TechnicianActions';
import { TechnicianSkeleton } from '@/features/tecnico/components/TechnicianSkeleton';
import {
  TechnicianSolutionForm,
  type TechnicianSolutionPayload,
} from '@/features/tecnico/components/TechnicianSolutionForm';
import { TechnicianUpdateModal, type TechnicianUpdateMode } from '@/features/tecnico/components/TechnicianUpdateModal';
import { pendingDrafts } from '@/features/tecnico/offline-model';
import { peekTecnicoOffline } from '@/features/tecnico/offline-store';
import { useAuth } from '@/features/auth/auth-context';
import { canResolveCaso } from '@/shared/contracts/caso';
import { formatSolicitudDate } from '@/shared/contracts/solicitud';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { AuthenticatedImage } from '@/shared/ui/AuthenticatedImage';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Text } from '@/shared/ui/Text';
import { TicketHistory } from '@/shared/ui/ticket-history';
import { WorkflowManualRetryNotice } from '@/shared/ui/WorkflowManualRetryNotice';
import { Feather } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function TechnicianTicketDetail() {
  const { user } = useAuth();
  const { id, caseTypeId, action } = useLocalSearchParams<{ id: string; caseTypeId?: string; action?: string }>();
  const casoId = Array.isArray(id) ? id[0] : id ?? '';
  const routeCaseTypeId = Array.isArray(caseTypeId) ? caseTypeId[0] : caseTypeId;
  const detalleQuery = useCasoDetalle(casoId);
  const caso = detalleQuery.data;
  const start = useIniciarAtencion(casoId);
  const update = useActualizacionCaso(casoId);
  const requestInfo = useSolicitarInformacion(casoId);
  const partial = useSolucionParcial(casoId);
  const resolve = useSolucionTotal(casoId);

  const [updateMode, setUpdateMode] = useState<TechnicianUpdateMode | null>(null);
  const [solveOpen, setSolveOpen] = useState(false);

  useEffect(() => {
    if (action === 'update') setUpdateMode('update');
  }, [action]);

  const draft = user?.id ? peekTecnicoOffline(user.id)?.drafts[casoId] : undefined;
  const pendingCount = user?.id ? pendingDrafts(peekTecnicoOffline(user.id) ?? { assigned: [], closed: [], details: {}, drafts: {} }).length : 0;
  const fromCache = detalleQuery.isSuccess && detalleQuery.isFetched && !detalleQuery.isFetching && pendingCount > 0;
  const banner = caso ? attentionBannerForCaso(caso) : undefined;

  const sheetOpen = updateMode !== null || solveOpen;

  return (
    <View style={styles.screenRoot}>
      <Stack.Screen
        options={{
          headerShown: !sheetOpen,
          headerBackVisible: true,
          headerTitle: caso?.caseCode || 'Caso',
          headerStyle: { backgroundColor: semanticColors.surface.muted },
          headerTintColor: semanticColors.brand.blue,
          headerShadowVisible: false,
        }}
      />
      <QueryBoundary
        isLoading={detalleQuery.isLoading}
        isError={detalleQuery.isError}
        error={detalleQuery.error}
        hasData={detalleQuery.dataUpdatedAt > 0}
        onRetry={() => void detalleQuery.refetch()}
        loadingFallback={<TechnicianSkeleton />}
      >
        {caso && !sheetOpen ? (
          <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <OfflineBanner fromCache={fromCache} pendingCount={pendingCount} conflict={draft?.conflict} />

              {banner ? (
                <View
                  style={[
                    styles.attention,
                    banner.tone === 'warning' && styles.attentionWarning,
                    banner.tone === 'success' && styles.attentionSuccess,
                  ]}
                  accessibilityRole="alert"
                >
                  <Feather
                    name={banner.tone === 'warning' ? 'alert-triangle' : banner.tone === 'success' ? 'check-circle' : 'info'}
                    size={18}
                    color={
                      banner.tone === 'warning'
                        ? semanticColors.state.warningText
                        : banner.tone === 'success'
                          ? semanticColors.brand.green
                          : semanticColors.brand.blue
                    }
                  />
                  <View style={styles.attentionCopy}>
                    <Text variant="h3">{banner.title}</Text>
                    {banner.detail ? (
                      <Text variant="caption" color="secondary">
                        {banner.detail}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                  <Text variant="caption" color="secondary" style={styles.eyebrow}>
                    CASO
                  </Text>
                  <StatusBadge
                    status={caso.status}
                    label={caso.displayStatus}
                    workflowVersion={caso.workflowVersion}
                    size="medium"
                  />
                </View>
                <Text variant="h1" color="primary" style={styles.caseCode}>
                  {caso.caseCode || 'Código pendiente'}
                </Text>
                <View style={styles.dateRow}>
                  <Feather name="calendar" size={16} color={semanticColors.text.secondary} />
                  <Text variant="p2" color="secondary">
                    {formatSolicitudDate(caso.createdAtRaw)}
                  </Text>
                </View>
              </View>

              <DetailSection title="Problema">
                <View style={styles.copyCard}>
                  <Text variant="p2" color="primary" style={styles.bodyText}>
                    {caso.description}
                  </Text>
                </View>
              </DetailSection>

              <DetailSection title="Información">
                <View style={styles.infoList}>
                  <DetailRow icon="user" label="Funcionario" value={caso.requesterName ?? 'Sin información'} />
                  <DetailRow
                    icon="map-pin"
                    label="Ambiente"
                    value={
                      caso.environmentName
                        ? `${caso.environmentName}${caso.environmentIsActive === false ? ' (inactivo)' : ''}`
                        : 'Sin información'
                    }
                  />
                  {caso.phone ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Llamar a ${caso.phone}`}
                      onPress={() => void Linking.openURL(`tel:${caso.phone}`)}
                    >
                      <DetailRow icon="phone" label="Contacto" value={caso.phone} />
                    </Pressable>
                  ) : null}
                  <DetailRow icon="tag" label="Tipo de caso" value={caso.caseTypeName ?? 'Sin información'} />
                </View>
              </DetailSection>

              {caso.photoUrl ? (
                <DetailSection title="Evidencia">
                  <AuthenticatedImage
                    url={caso.photoUrl}
                    accessibilityLabel="Foto del incidente"
                    style={styles.image}
                  />
                </DetailSection>
              ) : null}

              {caso.solutionDescription ? (
                <DetailSection title="Solución registrada">
                  <View style={styles.solutionCard}>
                    <View style={styles.solutionIcon}>
                      <Feather name="check" size={18} color={semanticColors.brand.green} />
                    </View>
                    <Text variant="p2" color="primary" style={styles.solutionText}>
                      {caso.solutionDescription}
                    </Text>
                  </View>
                  {caso.solutionEvidenceUrl ? (
                    <AuthenticatedImage
                      url={caso.solutionEvidenceUrl}
                      accessibilityLabel="Evidencia de la solución"
                      style={styles.image}
                    />
                  ) : null}
                </DetailSection>
              ) : null}

              <DetailSection title="Historial">
                <TicketHistory
                  events={caso.historial}
                  emptyNote={caso.historyNote}
                  incidentPhotoUrl={caso.photoUrl}
                  solutionEvidenceUrl={caso.solutionEvidenceUrl}
                />
              </DetailSection>

              <WorkflowManualRetryNotice
                error={start.error}
                lastPayload={start.variables}
                currentPayload={start.variables}
                pending={start.isPending}
                onRetry={() => start.mutate(start.variables)}
              />
            </ScrollView>

            <TechnicianActions
              capabilities={caso.capabilities}
              pending={{
                start: start.isPending,
                update: update.isPending,
                request_info: requestInfo.isPending,
                solve: partial.isPending || resolve.isPending,
              }}
              onStart={() =>
                start.mutate(undefined, {
                  onSuccess: (result) => {
                    if (result?.queued) {
                      /* banner already covers queued */
                    }
                  },
                })
              }
              onUpdate={() => setUpdateMode('update')}
              onRequestInfo={() => setUpdateMode('request_info')}
              onSolve={() => setSolveOpen(true)}
              showResolveV1={canResolveCaso(caso)}
              onResolveV1={() =>
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
          </View>
        ) : null}
      </QueryBoundary>

      <TechnicianUpdateModal
        visible={updateMode !== null}
        mode={updateMode ?? 'update'}
        submitting={updateMode === 'request_info' ? requestInfo.isPending : update.isPending}
        error={updateMode === 'request_info' ? requestInfo.error : update.error}
        lastPayload={updateMode === 'request_info' ? requestInfo.variables : update.variables}
        onClose={() => setUpdateMode(null)}
        onSubmit={(mensaje, evidence) => {
          if (updateMode === 'request_info') {
            requestInfo.mutate(mensaje, {
              onSuccess: () => setUpdateMode(null),
            });
            return;
          }
          update.mutate(
            { mensaje, evidence },
            {
              onSuccess: () => setUpdateMode(null),
            },
          );
        }}
        onRetry={() => {
          if (updateMode === 'request_info' && typeof requestInfo.variables === 'string') {
            requestInfo.mutate(requestInfo.variables);
            return;
          }
          if (update.variables) update.mutate(update.variables);
        }}
      />

      <TechnicianSolutionForm
        visible={solveOpen}
        capabilities={caso?.capabilities}
        submitting={partial.isPending || resolve.isPending}
        error={partial.error ?? resolve.error}
        lastPayload={partial.variables ?? resolve.variables}
        onClose={() => setSolveOpen(false)}
        onSubmit={(payload: TechnicianSolutionPayload) => {
          if (payload.kind === 'partial') {
            partial.mutate(
              {
                queSeHizo: payload.queSeHizo,
                queFalta: payload.queFalta ?? '',
                siguienteAccion: payload.siguienteAccion ?? '',
                fechaEsperada: payload.fechaEsperada,
                evidence: payload.evidence,
              },
              { onSuccess: () => setSolveOpen(false) },
            );
            return;
          }
          resolve.mutate(
            {
              queSeHizo: payload.queSeHizo,
              causaIdentificada: payload.causaIdentificada,
              evidence: payload.evidence,
            },
            { onSuccess: () => setSolveOpen(false) },
          );
        }}
        onRetry={() => {
          if (partial.variables) {
            partial.mutate(partial.variables);
            return;
          }
          if (resolve.variables) resolve.mutate(resolve.variables);
        }}
      />
    </View>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h2">{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={18} color={semanticColors.brand.blue} />
      </View>
      <View style={styles.infoCopy}>
        <Text variant="caption" color="secondary">
          {label}
        </Text>
        <Text variant="p2" color="primary">
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: semanticColors.surface.muted },
  screen: { flex: 1, backgroundColor: semanticColors.surface.muted },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[5],
  },
  attention: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: semanticColors.state.infoBg,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  attentionWarning: {
    backgroundColor: semanticColors.state.warningBg,
    borderColor: semanticColors.state.warning,
  },
  attentionSuccess: {
    backgroundColor: semanticColors.state.successBg,
    borderColor: semanticColors.brand.green,
  },
  attentionCopy: { flex: 1, gap: 2 },
  heroCard: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[5],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  eyebrow: { fontWeight: '700', letterSpacing: 1 },
  caseCode: { fontVariant: ['tabular-nums'] },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  section: { gap: spacing[3] },
  infoList: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: semanticColors.surface.card,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...shadows.sm,
  },
  infoRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: semanticColors.border.default,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.state.infoBg,
  },
  infoCopy: { flex: 1, gap: spacing[1] },
  copyCard: {
    borderRadius: radius.md,
    padding: spacing[4],
    backgroundColor: semanticColors.surface.card,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
  bodyText: { lineHeight: 24 },
  image: {
    width: '100%',
    height: 224,
    borderRadius: radius.lg,
    backgroundColor: semanticColors.surface.well,
  },
  solutionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    borderRadius: radius.md,
    padding: spacing[4],
    backgroundColor: semanticColors.state.successBg,
  },
  solutionIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.surface.card,
  },
  solutionText: { flex: 1, lineHeight: 24 },
});
