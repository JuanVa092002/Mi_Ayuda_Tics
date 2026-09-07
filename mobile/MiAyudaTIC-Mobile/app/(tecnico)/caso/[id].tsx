import {
  useActualizacionCaso,
  useCasoDetalle,
  useIniciarAtencion,
  useSolicitarInformacion,
  useSolucionParcial,
  useSolucionTotal,
} from '@/features/casos/hooks';
import { canResolveCaso } from '@/shared/contracts/caso';
import { formatSolicitudDate } from '@/shared/contracts/solicitud';
import { colors } from '@/shared/theme/colors';
import { AppButton } from '@/shared/ui/AppButton';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ScreenScaffold } from '@/shared/ui/ScreenScaffold';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { WorkflowManualRetryNotice } from '@/shared/ui/WorkflowManualRetryNotice';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
                <StatusBadge status={caso.status} label={caso.displayStatus} workflowVersion={caso.workflowVersion} />
              </View>

              {caso.headline ? <Text style={styles.bodyText}>{caso.headline}</Text> : null}
              {caso.proximaAccion ? <DetailRow label="Próxima acción" value={caso.proximaAccion} /> : null}

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

            {caso.workflowVersion === 2 ? <TecnicoWorkflowPanel casoId={caso.id} capabilities={caso.capabilities} /> : null}
          </ScrollView>
        ) : null}
      </QueryBoundary>
    </ScreenScaffold>
  );
}

function TecnicoWorkflowPanel({
  casoId,
  capabilities,
}: {
  casoId: string;
  capabilities?: {
    canStart?: boolean;
    canUpdate?: boolean;
    canRequestInfo?: boolean;
    canPartialSolution?: boolean;
    canResolve?: boolean;
  };
}) {
  const start = useIniciarAtencion(casoId);
  const update = useActualizacionCaso(casoId);
  const requestInfo = useSolicitarInformacion(casoId);
  const partial = useSolucionParcial(casoId);
  const resolve = useSolucionTotal(casoId);
  const [mensaje, setMensaje] = useState('');
  const [queSeHizo, setQueSeHizo] = useState('');
  const [queFalta, setQueFalta] = useState('');
  const [siguienteAccion, setSiguienteAccion] = useState('');

  return (
    <View style={styles.card}>
      {capabilities?.canStart ? (
        <>
          <AppButton
            label="Iniciar atención"
            variant="green"
            loading={start.isPending}
            onPress={() => start.mutate(undefined)}
          />
          <WorkflowManualRetryNotice
            error={start.error}
            lastPayload={start.variables}
            currentPayload={start.variables}
            pending={start.isPending}
            onRetry={() => start.mutate(start.variables)}
          />
        </>
      ) : null}
      {capabilities?.canUpdate || capabilities?.canRequestInfo ? (
        <>
          <Text style={styles.sectionLabel}>Actualización</Text>
          <TextInput style={styles.input} value={mensaje} onChangeText={setMensaje} multiline placeholder="Mensaje" />
          {capabilities.canUpdate ? (
            <>
              <AppButton
                label="Agregar actualización"
                loading={update.isPending}
                disabled={!mensaje.trim()}
                onPress={() =>
                  update.mutate(mensaje.trim(), {
                    onSuccess: () => setMensaje(''),
                  })
                }
              />
              <WorkflowManualRetryNotice
                error={update.error}
                lastPayload={update.variables}
                currentPayload={mensaje.trim()}
                pending={update.isPending}
                onRetry={() => {
                  if (typeof update.variables === 'string') update.mutate(update.variables);
                }}
              />
            </>
          ) : null}
          {capabilities.canRequestInfo ? (
            <>
              <AppButton
                label="Solicitar información al funcionario"
                loading={requestInfo.isPending}
                disabled={!mensaje.trim()}
                onPress={() =>
                  requestInfo.mutate(mensaje.trim(), {
                    onSuccess: () => setMensaje(''),
                  })
                }
              />
              <WorkflowManualRetryNotice
                error={requestInfo.error}
                lastPayload={requestInfo.variables}
                currentPayload={mensaje.trim()}
                pending={requestInfo.isPending}
                onRetry={() => {
                  if (typeof requestInfo.variables === 'string') requestInfo.mutate(requestInfo.variables);
                }}
              />
            </>
          ) : null}
        </>
      ) : null}
      {capabilities?.canPartialSolution || capabilities?.canResolve ? (
        <>
          <Text style={styles.sectionLabel}>Solución</Text>
          <TextInput style={styles.input} value={queSeHizo} onChangeText={setQueSeHizo} multiline placeholder="Qué se hizo" />
          {capabilities.canPartialSolution ? (
            <>
              <TextInput style={styles.input} value={queFalta} onChangeText={setQueFalta} multiline placeholder="Qué falta" />
              <TextInput
                style={styles.input}
                value={siguienteAccion}
                onChangeText={setSiguienteAccion}
                multiline
                placeholder="Siguiente acción"
              />
              <AppButton
                label="Registrar solución parcial"
                loading={partial.isPending}
                disabled={!queSeHizo.trim() || !queFalta.trim() || !siguienteAccion.trim()}
                onPress={() =>
                  partial.mutate({
                    queSeHizo: queSeHizo.trim(),
                    queFalta: queFalta.trim(),
                    siguienteAccion: siguienteAccion.trim(),
                  })
                }
              />
              <WorkflowManualRetryNotice
                error={partial.error}
                lastPayload={partial.variables}
                currentPayload={{
                  queSeHizo: queSeHizo.trim(),
                  queFalta: queFalta.trim(),
                  siguienteAccion: siguienteAccion.trim(),
                }}
                pending={partial.isPending}
                onRetry={() => {
                  if (partial.variables) partial.mutate(partial.variables);
                }}
              />
            </>
          ) : null}
          {capabilities.canResolve ? (
            <>
            <AppButton
              label="Registrar solución total"
              variant="green"
              loading={resolve.isPending}
              disabled={!queSeHizo.trim()}
              onPress={() => resolve.mutate({ queSeHizo: queSeHizo.trim() })}
            />
            <WorkflowManualRetryNotice
              error={resolve.error}
              lastPayload={resolve.variables}
              currentPayload={{ queSeHizo: queSeHizo.trim() }}
              pending={resolve.isPending}
              onRetry={() => {
                if (resolve.variables) resolve.mutate(resolve.variables);
              }}
            />
            </>
          ) : null}
        </>
      ) : null}
    </View>
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
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    borderRadius: 12,
    padding: 10,
    textAlignVertical: 'top',
  },
});
