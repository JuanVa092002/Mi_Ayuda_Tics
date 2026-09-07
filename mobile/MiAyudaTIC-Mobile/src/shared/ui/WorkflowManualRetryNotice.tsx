import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/shared/ui/AppButton';
import { Text } from '@/shared/ui/Text';
import {
  classifyWorkflowMutationFailure,
  fingerprintWorkflowPayload,
  getWorkflowManualRetryView,
} from '@/shared/api/workflow-retry-policy';

export function WorkflowManualRetryNotice({
  error,
  lastPayload,
  currentPayload,
  pending = false,
  onRetry,
}: {
  error: unknown;
  lastPayload?: unknown;
  currentPayload?: unknown;
  pending?: boolean;
  onRetry: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const failure = error ? classifyWorkflowMutationFailure(error, now) : null;
  const view = getWorkflowManualRetryView(failure, {
    now,
    payloadUnchanged:
      fingerprintWorkflowPayload(currentPayload) === fingerprintWorkflowPayload(lastPayload),
  });
  const waiting = Boolean(view.waitSecondsRemaining);

  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [waiting]);

  if (!failure) return null;
  if (!view.showCta && !failure.message) return null;

  return (
    <View style={styles.box}>
      <Text variant="p2" color="secondary">
        {view.message || failure.message}
      </Text>
      {view.showCta ? (
        <AppButton
          label={view.ctaLabel}
          variant="blue"
          loading={pending}
          disabled={!view.ctaEnabled || pending}
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 8,
    marginTop: 8,
  },
});
