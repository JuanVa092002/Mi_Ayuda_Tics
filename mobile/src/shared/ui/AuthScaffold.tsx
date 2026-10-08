import { Image, type ImageSource } from 'expo-image';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandTitle } from './BrandTitle';
import { FormPanel } from './FormPanel';

interface AuthScaffoldProps {
  children: ReactNode;
  headerImage?: ImageSource;
  headerImageHeight?: number;
  showBrand?: boolean;
  brandSize?: 'large' | 'small';
}

export function AuthScaffold({
  children,
  headerImage,
  headerImageHeight = 120,
  showBrand = true,
  brandSize = 'small',
}: AuthScaffoldProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {headerImage ? (
            <Image
              source={headerImage}
              style={{ width: '100%', height: headerImageHeight }}
              contentFit="contain"
            />
          ) : null}
          {showBrand ? <BrandTitle size={brandSize} /> : null}
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <FormPanel>{children}</FormPanel>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  scroll: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
