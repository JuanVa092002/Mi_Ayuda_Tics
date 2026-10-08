/**
 * Timeline de historial de un ticket (estilo Linear / Jira / Zendesk).
 *
 * Uso:
 * ```tsx
 * <TicketHistory
 *   events={detail.historial}
 *   emptyNote={detail.historyNote}
 *   incidentPhotoUrl={detail.photo?.url}
 *   solutionEvidenceUrl={detail.solution?.evidenceUrl}
 * />
 * ```
 *
 * No pide datos nuevos al backend: agrupa y presenta el `historial` ya cargado
 * en el detalle. La evidencia del incidente/solución se engancha visualmente
 * al evento `created` / `resolved` cuando el evento no trae adjunto propio.
 */
import { radius } from '@/shared/theme/radius';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TicketHistoryGroup } from './TicketHistoryGroup';
import {
  TICKET_HISTORY_INITIAL_VISIBLE,
  attachContextualEvidence,
  groupEventsByDate,
  visibleEventsWindow,
  type TicketHistoryEventData,
} from './ticket-history-model';

export type TicketHistoryProps = {
  events?: TicketHistoryEventData[];
  emptyNote?: string;
  incidentPhotoUrl?: string;
  solutionEvidenceUrl?: string;
};

export function TicketHistory({
  events,
  emptyNote,
  incidentPhotoUrl,
  solutionEvidenceUrl,
}: TicketHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const enriched = useMemo(
    () =>
      attachContextualEvidence(events ?? [], {
        incidentPhotoUrl,
        solutionEvidenceUrl,
      }),
    [events, incidentPhotoUrl, solutionEvidenceUrl],
  );

  const { visible, hiddenCount } = useMemo(
    () => visibleEventsWindow(enriched, expanded),
    [enriched, expanded],
  );

  const groups = useMemo(() => groupEventsByDate(visible), [visible]);

  if (!enriched.length) {
    return (
      <View style={styles.emptyCard}>
        <Text variant="p2" color="secondary">
          {emptyNote ??
            'El historial detallado está disponible para solicitudes creadas desde esta actualización.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline} accessibilityLabel="Historial del caso">
      {groups.map((group) => (
        <TicketHistoryGroup key={group.key} group={group} />
      ))}
      {hiddenCount > 0 && !expanded ? (
        <Button
          label={`Ver ${hiddenCount} evento${hiddenCount === 1 ? '' : 's'} anterior${hiddenCount === 1 ? '' : 'es'}`}
          variant="ghost"
          size="small"
          onPress={() => setExpanded(true)}
          accessibilityHint="Muestra la actividad más antigua de este caso"
        />
      ) : null}
    </View>
  );
}

export { TICKET_HISTORY_INITIAL_VISIBLE };

const styles = StyleSheet.create({
  timeline: {
    backgroundColor: semanticColors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  emptyCard: {
    borderRadius: radius.md,
    padding: spacing[4],
    backgroundColor: semanticColors.surface.card,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
  },
});
