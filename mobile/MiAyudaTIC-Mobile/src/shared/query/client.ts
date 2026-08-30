import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      // Camera/gallery send the app to background and Android may flap the
      // network. A failed refetch must not wipe screens that already have cache.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
