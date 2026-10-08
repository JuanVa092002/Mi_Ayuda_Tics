import { useAuth } from '@/features/auth/auth-context';
import { downloadAuthenticatedMedia } from '@/shared/media/download-authenticated-media';
import {
  classifyMediaUrl,
  extractLocalMediaApiPath,
  filenameFromLocalMediaApiPath,
} from '@/shared/media/authenticated-media';
import { queryKeys } from '@/shared/query/keys';
import { useQuery } from '@tanstack/react-query';

export type AuthenticatedImageStatus = 'empty' | 'loading' | 'ready' | 'error';

export function useAuthenticatedImageUri(remoteUrl: string | null | undefined): {
  uri: string | null;
  status: AuthenticatedImageStatus;
  refetch: () => void;
} {
  const { token } = useAuth();
  const url = remoteUrl?.trim() || '';
  const kind = url ? classifyMediaUrl(url) : 'public-remote';
  const apiPath = url ? extractLocalMediaApiPath(url) : null;
  const filename = apiPath ? filenameFromLocalMediaApiPath(apiPath) : null;

  const query = useQuery({
    queryKey: queryKeys.media.file(filename ?? ''),
    queryFn: () => downloadAuthenticatedMedia(token!, apiPath!),
    enabled: Boolean(token && apiPath && filename && kind === 'authenticated-local'),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (!url) {
    return { uri: null, status: 'empty', refetch: () => undefined };
  }

  if (kind !== 'authenticated-local') {
    return { uri: url, status: 'ready', refetch: () => undefined };
  }

  if (query.data) {
    return { uri: query.data, status: 'ready', refetch: () => void query.refetch() };
  }

  if (query.isError) {
    return { uri: null, status: 'error', refetch: () => void query.refetch() };
  }

  return { uri: null, status: 'loading', refetch: () => void query.refetch() };
}
