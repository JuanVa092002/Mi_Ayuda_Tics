import {
  useConfirmarSolucion,
  useReabrirSolicitud,
  useResponderSolicitud,
  useSolicitudDetalle,
} from '@/features/solicitudes/hooks';
import { formatSolicitudDate } from '@/shared/contracts/solicitud';
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { shadows } from '@/shared/theme/shadows';
import { spacing } from '@/shared/theme/spacing';
import { AuthenticatedImage } from '@/shared/ui/AuthenticatedImage';
import { TicketHistory } from '@/shared/ui/ticket-history';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Text } from '@/shared/ui/Text';
import { AppButton } from '@/shared/ui/AppButton';
import { WorkflowManualRetryNotice } from '@/shared/ui/WorkflowManualRetryNotice';
import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function SolicitudDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const solicitudId = Array.isArray(id) ? id[0] : id ?? '';
  const detalleQuery = useSolicitudDetalle(solicitudId);
  const responder = useResponderSolicitud(solicitudId);
  const confirmar = useConfirmarSolucion(solicitudId);
  const reabrir = useReabrirSolicitud(solicitudId);
  const [reply, setReply] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitle: 'Solicitud',
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
        skeleton
        skeletonVariant="card"
      >
        {detalleQuery.data ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <Text variant="caption" color="secondary" style={styles.eyebrow}>SOLICITUD</Text>
                <StatusBadge
                  status={detalleQuery.data.status}
                  label={detalleQuery.data.displayStatus}
                  workflowVersion={detalleQuery.data.workflowVersion}
                  size="medium"
                />
              </View>
              <Text variant="h1" color="primary" style={styles.caseCode}>
                {detalleQuery.data.caseCode || 'Código pendiente'}
              </Text>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={16} color={semanticColors.text.secondary} />
                <Text variant="p2" color="secondary">{formatSolicitudDate(detalleQuery.data.createdAtRaw)}</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <Text variant="p2" color="primary">{detalleQuery.data.headline ?? detalleQuery.data.displayStatus}</Text>
              {detalleQuery.data.proximaAccion ? (
                <Text variant="p2" color="secondary">Próxima acción: {detalleQuery.data.proximaAccion}</Text>
              ) : null}
            </View>

            <DetailSection title="Detalles del caso">
              <View style={styles.infoList}>
                <DetailRow icon="map-pin" label="Ambiente" value={detalleQuery.data.environmentName ?? 'Sin información'} />
                <DetailRow icon="tag" label="Tipo de caso" value={detalleQuery.data.caseTypeName ?? 'Sin información'} />
                {detalleQuery.data.phone ? <DetailRow icon="phone" label="Teléfono de contacto" value={detalleQuery.data.phone} /> : null}
                {detalleQuery.data.technicianName ? <DetailRow icon="user-check" label="Técnico asignado" value={detalleQuery.data.technicianName} /> : null}
              </View>
            </DetailSection>

            <DetailSection title="Descripción">
              <View style={styles.copyCard}>
                <Text variant="p2" color="primary" style={styles.bodyText}>{detalleQuery.data.description}</Text>
              </View>
            </DetailSection>

            {detalleQuery.data.photo?.url ? (
              <DetailSection title="Evidencia del incidente">
                <AuthenticatedImage
                  url={detalleQuery.data.photo.optimizedUrl ?? detalleQuery.data.photo.url}
                  accessibilityLabel="Foto del incidente"
                  style={styles.image}
                />
              </DetailSection>
            ) : null}

            {detalleQuery.data.solution ? (
              <DetailSection title="Solución registrada">
                <View style={styles.solutionCard}>
                  <View style={styles.solutionIcon}>
                    <Feather name="check" size={18} color={semanticColors.brand.green} />
                  </View>
                  <Text variant="p2" color="primary" style={styles.solutionText}>{detalleQuery.data.solution.description}</Text>
                </View>
                {detalleQuery.data.solution.evidenceUrl ? (
                  <AuthenticatedImage
                    url={detalleQuery.data.solution.evidenceUrl}
                    accessibilityLabel="Evidencia de la solución"
                    style={styles.image}
                  />
                ) : null}
              </DetailSection>
            ) : null}

            <DetailSection title="Historial">
              <TicketHistory
                events={detalleQuery.data.historial}
                emptyNote={detalleQuery.data.historyNote}
                incidentPhotoUrl={detalleQuery.data.photo?.optimizedUrl ?? detalleQuery.data.photo?.url}
                solutionEvidenceUrl={detalleQuery.data.solution?.evidenceUrl}
              />
            </DetailSection>

            {detalleQuery.data.canReply ? (
              <DetailSection title="Responder">
                <TextInput
                  style={styles.input}
                  placeholder="Escribe la información solicitada"
                  value={reply}
                  onChangeText={setReply}
                  multiline
                />
                <AppButton
                  label="Enviar información"
                  variant="green"
                  loading={responder.isPending}
                  disabled={!reply.trim() || responder.isPending}
                  onPress={() => {
                    responder.mutate(reply.trim(), {
                      onSuccess: () => setReply(''),
                    });
                  }}
                />
                <WorkflowManualRetryNotice
                  error={responder.error}
                  lastPayload={responder.variables}
                  currentPayload={reply.trim()}
                  pending={responder.isPending}
                  onRetry={() => {
                    if (typeof responder.variables === 'string') responder.mutate(responder.variables);
                  }}
                />
              </DetailSection>
            ) : null}

            {detalleQuery.data.canConfirm || detalleQuery.data.canReopen ? (
              <DetailSection title="Confirmación">
                {detalleQuery.data.canConfirm ? (
                  <>
                  <AppButton
                    label="Confirmar que la solución funciona"
                    variant="green"
                    loading={confirmar.isPending}
                    onPress={() => confirmar.mutate(undefined)}
                  />
                  <WorkflowManualRetryNotice
                    error={confirmar.error}
                    lastPayload={confirmar.variables}
                    currentPayload={confirmar.variables}
                    pending={confirmar.isPending}
                    onRetry={() => confirmar.mutate(confirmar.variables)}
                  />
                  </>
                ) : null}
                {detalleQuery.data.canReopen ? (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Motivo para reabrir el caso"
                      value={reopenReason}
                      onChangeText={setReopenReason}
                      multiline
                    />
                    <AppButton
                      label="Reabrir solicitud"
                      loading={reabrir.isPending}
                      disabled={!reopenReason.trim() || reabrir.isPending}
                      onPress={() => {
                        reabrir.mutate(reopenReason.trim(), {
                          onSuccess: () => setReopenReason(''),
                        });
                      }}
                    />
                    <WorkflowManualRetryNotice
                      error={reabrir.error}
                      lastPayload={reabrir.variables}
                      currentPayload={reopenReason.trim()}
                      pending={reabrir.isPending}
                      onRetry={() => {
                        if (typeof reabrir.variables === 'string') reabrir.mutate(reabrir.variables);
                      }}
                    />
                  </>
                ) : null}
              </DetailSection>
            ) : null}
          </ScrollView>
        ) : null}
      </QueryBoundary>
    </>
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
        <Text variant="caption" color="secondary">{label}</Text>
        <Text variant="p2" color="primary">{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[10], gap: spacing[5], backgroundColor: semanticColors.surface.muted },
  heroCard: { backgroundColor: semanticColors.surface.card, borderRadius: radius.lg, padding: spacing[5], gap: spacing[3], borderWidth: 1, borderColor: semanticColors.border.default, ...shadows.sm },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  eyebrow: { fontWeight: '700', letterSpacing: 1 },
  caseCode: { fontVariant: ['tabular-nums'] },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  progressCard: { borderRadius: radius.lg, paddingHorizontal: spacing[5], paddingVertical: spacing[4], backgroundColor: semanticColors.surface.card, borderWidth: 1, borderColor: semanticColors.border.default, ...shadows.sm },
  section: { gap: spacing[3] },
  infoList: { overflow: 'hidden', borderRadius: radius.lg, backgroundColor: semanticColors.surface.card, borderWidth: 1, borderColor: semanticColors.border.default, ...shadows.sm },
  infoRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: semanticColors.border.default },
  infoIcon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: semanticColors.state.infoBg },
  infoCopy: { flex: 1, gap: spacing[1] },
  copyCard: { borderRadius: radius.md, padding: spacing[4], backgroundColor: semanticColors.surface.card, borderWidth: 1, borderColor: semanticColors.border.default },
  bodyText: { lineHeight: 24 },
  image: { width: '100%', height: 224, borderRadius: radius.lg, backgroundColor: semanticColors.surface.well },
  solutionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], borderRadius: radius.md, padding: spacing[4], backgroundColor: semanticColors.state.successBg },
  solutionIcon: { width: 28, height: 28, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: semanticColors.surface.card },
  solutionText: { flex: 1, lineHeight: 24 },
  input: {
    minHeight: 88,
    borderRadius: radius.md,
    padding: spacing[3],
    backgroundColor: semanticColors.surface.card,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    textAlignVertical: 'top',
  },
});
