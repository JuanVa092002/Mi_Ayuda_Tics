import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { semanticColors } from '../theme/semantic-colors';
import { layout, spacing } from '../theme/spacing';
import { Text } from './Text';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  showBrand?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  header,
  footer,
}: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {header ? <View style={styles.headerSlot}>{header}</View> : null}

          {title ? (
            <Text variant="h1" align="center" style={styles.title}>
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text variant="p2" color="secondary" align="center" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}

          <View style={styles.body}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: semanticColors.surface.default,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.authPaddingX,
    paddingTop: spacing[8],
    paddingBottom: spacing[10],
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerSlot: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
    paddingHorizontal: spacing[2],
  },
  body: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  footer: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
});
