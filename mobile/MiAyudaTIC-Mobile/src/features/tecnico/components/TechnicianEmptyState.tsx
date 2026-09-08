import { EmptyState } from '@/shared/ui/EmptyState';
import type { ComponentProps } from 'react';

type EmptyStateIcon = ComponentProps<typeof EmptyState>['icon'];

export function TechnicianEmptyState({
  title,
  description,
  icon = 'clipboard',
}: {
  title: string;
  description: string;
  icon?: EmptyStateIcon;
}) {
  return <EmptyState icon={icon} title={title} description={description} />;
}
