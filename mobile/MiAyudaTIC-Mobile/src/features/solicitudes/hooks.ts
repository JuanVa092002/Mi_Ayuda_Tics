import { useAuth } from '@/features/auth/auth-context';
import { queryKeys } from '@/shared/query/keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { computeSolicitudStats } from '@/shared/contracts/solicitud';
import {
  createSolicitud,
  fetchAmbientes,
  fetchHistorial,
  fetchSolicitudDetalle,
  fetchTiposCaso,
  type CreateSolicitudPayload,
} from './api';

const CATALOG_STALE_MS = 5 * 60 * 1000;

export function useMisSolicitudes() {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.solicitudes.historial(userId),
    queryFn: () => fetchHistorial(token!),
    enabled: Boolean(token && userId),
  });
}

export function useSolicitudStats() {
  const query = useMisSolicitudes();
  const stats = useMemo(
    () => computeSolicitudStats(query.data ?? []),
    [query.data],
  );

  return { ...query, stats };
}

export function useSolicitudDetalle(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.solicitudes.detail(id),
    queryFn: () => fetchSolicitudDetalle(token!, id),
    enabled: Boolean(token && id),
  });
}

export function useAmbientes() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.catalogos.ambientes,
    queryFn: () => fetchAmbientes(token!),
    enabled: Boolean(token),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useTiposCaso() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.catalogos.tiposCaso,
    queryFn: () => fetchTiposCaso(token!),
    enabled: Boolean(token),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useCreateSolicitud() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';

  return useMutation({
    mutationFn: (payload: Omit<CreateSolicitudPayload, 'userId'>) =>
      createSolicitud(token!, { ...payload, userId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.solicitudes.all });
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.solicitudes.historial(userId),
        });
      }
    },
  });
}
