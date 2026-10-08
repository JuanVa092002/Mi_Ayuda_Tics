import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { Button } from './Button';
import { radius } from '@/shared/theme/radius';

export type SuccessCardProps = {
  caseCode?: string;
  statusLabel: string;
  dateLabel: string;
  environmentName?: string;
  caseTypeName?: string;
  onVerSolicitud: () => void;
  onVolverInicio: () => void;
};

export function SuccessCard({
  caseCode,
  statusLabel,
  dateLabel,
  environmentName,
  caseTypeName,
  onVerSolicitud,
  onVolverInicio,
}: SuccessCardProps) {
  const hasCaseCode = Boolean(caseCode?.trim());

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Feather name="check" size={32} color={semanticColors.text.inverse} />
        </View>
        <Text style={styles.eyebrow}>Listo</Text>
        <Text style={styles.title}>Solicitud registrada</Text>
        {hasCaseCode ? (
          <View style={styles.codeBlock}>
            <Text style={styles.metaLabel}>Código de solicitud</Text>
            <Text style={styles.code}>{caseCode}</Text>
          </View>
        ) : (
          <Text style={styles.body}>
            Tu solicitud quedó registrada, pero el código aún no está disponible. Ábrela con Ver
            solicitud para consultar el detalle.
          </Text>
        )}
        <View style={styles.metaList}>
          <MetaRow label="Estado" value={statusLabel} />
          <MetaRow label="Fecha" value={dateLabel} />
          {environmentName ? <MetaRow label="Ambiente" value={environmentName} /> : null}
          {caseTypeName ? <MetaRow label="Tipo de caso" value={caseTypeName} /> : null}
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          label="Ver solicitud"
          variant="primary"
          fullWidth
          onPress={onVerSolicitud}
        />
        <Button
          label="Volver al inicio"
          variant="ghost"
          fullWidth
          onPress={onVolverInicio}
        />
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    backgroundColor: semanticColors.surface.muted,
    gap: spacing[8],
  },
  card: {
    alignItems: 'center',
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    gap: spacing[3],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.brand.green,
    marginBottom: spacing[1],
  },
  eyebrow: {
    ...typography.label,
    color: semanticColors.brand.green,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.h1,
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
  body: {
    ...typography.p2,
    color: semanticColors.text.secondary,
    textAlign: 'center',
  },
  codeBlock: {
    alignItems: 'center',
    gap: spacing[1],
  },
  code: {
    ...typography.h1,
    color: semanticColors.brand.blue,
    textAlign: 'center',
  },
  metaList: {
    width: '100%',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  metaRow: {
    gap: 2,
  },
  metaLabel: {
    ...typography.caption,
    color: semanticColors.text.tertiary,
    textTransform: 'uppercase',
  },
  metaValue: {
    ...typography.p2,
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing[2],
  },
});
