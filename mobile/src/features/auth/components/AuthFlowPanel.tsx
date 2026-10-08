import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';
import { semanticColors } from '@/shared/theme/semantic-colors';
import { spacing } from '@/shared/theme/spacing';
import { radius } from '@/shared/theme/radius';
import { Button } from '@/shared/ui/Button';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AuthFlowTone = 'success' | 'error' | 'warning' | 'info';

type AuthFlowPanelProps = {
  tone: AuthFlowTone;
  title: string;
  message: string;
  icon?: IconName;
  countdownSeconds?: number;
  countdownLabel?: (seconds: number) => string;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  children?: ReactNode;
};

const toneStyles: Record<AuthFlowTone, { border: string; title: string; background: string }> = {
  success: {
    border: semanticColors.state.success,
    title: semanticColors.state.success,
    background: semanticColors.state.successBg,
  },
  error: {
    border: semanticColors.state.error,
    title: semanticColors.state.error,
    background: semanticColors.state.errorBg,
  },
  warning: {
    border: semanticColors.state.warning,
    title: '#B45309',
    background: semanticColors.state.warningBg,
  },
  info: {
    border: semanticColors.state.info,
    title: semanticColors.state.info,
    background: semanticColors.state.infoBg,
  },
};

const defaultIcons: Record<AuthFlowTone, IconName> = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

export function AuthFlowPanel({
  tone,
  title,
  message,
  icon,
  countdownSeconds,
  countdownLabel,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  children,
}: AuthFlowPanelProps) {
  const palette = toneStyles[tone];
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds ?? 0);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  useEffect(() => {
    if (countdownSeconds === undefined || countdownSeconds <= 0) {
      return;
    }

    setSecondsLeft(countdownSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds]);

  const countdownText =
    countdownSeconds !== undefined &&
    countdownSeconds > 0 &&
    secondsLeft > 0 &&
    countdownLabel
      ? countdownLabel(secondsLeft)
      : null;

  return (
    <View
      style={[styles.panel, { borderColor: palette.border, backgroundColor: palette.background }]}
      accessibilityRole="alert"
    >
      <View style={[styles.iconWrap, { borderColor: palette.border, backgroundColor: palette.background }]}>
        <Icon name={icon ?? defaultIcons[tone]} size={24} color={tone === 'success' ? 'success' : tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : 'info'} />
      </View>
      <Text variant="h2" style={{ color: palette.title, textAlign: 'center' }}>
        {title}
      </Text>
      <Text variant="p2" color="primary" align="center" style={styles.message}>
        {message}
      </Text>
      {countdownText ? (
        <Text
          variant="caption"
          style={{ color: palette.title, textAlign: 'center' }}
          accessibilityLiveRegion="polite"
        >
          {countdownText}
        </Text>
      ) : null}
      {children}
      {primaryLabel && onPrimaryPress ? (
        <Button label={primaryLabel} variant="primary" fullWidth onPress={onPrimaryPress} style={styles.button} />
      ) : null}
      {secondaryLabel && onSecondaryPress ? (
        <Button
          label={secondaryLabel}
          variant="secondary"
          fullWidth
          onPress={onSecondaryPress}
          style={styles.buttonSecondary}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  message: {
    marginBottom: spacing[1],
    paddingHorizontal: spacing[1],
  },
  button: {
    marginTop: spacing[2],
  },
  buttonSecondary: {
    marginTop: 0,
  },
});
