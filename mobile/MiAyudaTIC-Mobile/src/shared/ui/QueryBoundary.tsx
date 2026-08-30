import type { ReactNode } from 'react';
import { ApiError } from '@/shared/api/client';
import { shouldShowQueryError, shouldShowQueryLoading } from '@/shared/query/query-display-policy';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonListItem } from './SkeletonListItem';
import { SkeletonStats } from './SkeletonStats';

type SkeletonVariant = 'card' | 'listItem' | 'stats';

type QueryBoundaryProps = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyFallback?: ReactNode;
  skeleton?: boolean;
  skeletonVariant?: SkeletonVariant;
  skeletonCount?: number;
  /** Cached result exists — do not replace it with loading/error from a background refetch. */
  hasData?: boolean;
  children: ReactNode;
};

function getErrorMessage(error: Error | null): string {
  if (error instanceof ApiError) return error.message;
  if (error?.message) return error.message;
  return 'Ocurrió un error inesperado.';
}

function renderSkeleton(variant?: SkeletonVariant, skeletonCount = 3) {
  switch (variant) {
    case 'card':
      return <SkeletonCard />;
    case 'listItem': {
      const count = Math.max(1, skeletonCount);
      return (
        <View>
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonListItem key={index} />
          ))}
        </View>
      );
    }
    case 'stats':
      return <SkeletonStats />;
    default:
      return <SkeletonCard />;
  }
}

export function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty = false,
  onRetry,
  loadingFallback,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No hay datos para mostrar en este momento.',
  emptyFallback,
  skeleton = false,
  skeletonVariant = 'card',
  skeletonCount,
  hasData = false,
  children,
}: QueryBoundaryProps) {
  if (shouldShowQueryLoading(isLoading, hasData)) {
    if (skeleton) {
      return (
        <View style={styles.skeletonContainer}>
          {renderSkeleton(skeletonVariant, skeletonCount)}
        </View>
      );
    }
    return (
      loadingFallback ?? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brandGreen} />
        </View>
      )
    );
  }

  if (shouldShowQueryError(isError, hasData)) {
    return (
      <ErrorState
        title="No se pudo cargar"
        message={getErrorMessage(error)}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      emptyFallback ?? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    gap: 12,
  },
});
