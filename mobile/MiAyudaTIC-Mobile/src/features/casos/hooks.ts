import { useAuth } from '@/features/auth/auth-context';
import {
  filterCasosEnProgreso,
  filterCasosPorResolver,
  sortCasosByMostRecent,
} from '@/shared/contracts/caso';
import type { ResolveCasoInput } from '@/shared/contracts/solucion';
import { queryKeys } from '@/shared/query/keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  fetchCasosAsignados,
  fetchCasosResueltos,
  fetchCasoDetalle,
  resolverCaso,
} from './api';

export function useCasosAsignados() {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.casos.asignados(userId),
    queryFn: () => fetchCasosAsignados(token!),
    enabled: Boolean(token && userId),
  });
}

export function useCasosPorResolver() {
  const query = useCasosAsignados();
  const data = useMemo(
    () => sortCasosByMostRecent(filterCasosPorResolver(query.data ?? [])),
    [query.data],
  );

  return { ...query, data };
}

export function useMisCasos() {
  const query = useCasosAsignados();
  const data = useMemo(
    () => sortCasosByMostRecent(filterCasosEnProgreso(query.data ?? [])),
    [query.data],
  );

  return { ...query, data };
}

export function useCasosResueltos() {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.casos.resueltos(userId),
    queryFn: () => fetchCasosResueltos(token!),
    enabled: Boolean(token && userId),
    select: (items) => sortCasosByMostRecent(items).slice(0, 5),
  });
}

export function useCasosResueltosCompletos() {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.casos.resueltos(userId),
    queryFn: () => fetchCasosResueltos(token!),
    enabled: Boolean(token && userId),
    select: (items) => sortCasosByMostRecent(items),
  });
}

export function useCasoDetalle(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.casos.detail(id),
    queryFn: () => fetchCasoDetalle(token!, id),
    enabled: Boolean(token && id),
  });
}

export function useResolverCaso(solicitudId: string) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';

  return useMutation({
    mutationFn: (input: ResolveCasoInput) => resolverCaso(token!, solicitudId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.casos.all });
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.casos.asignados(userId),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.casos.resueltos(userId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.casos.detail(solicitudId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.solicitudes.detail(solicitudId),
      });
    },
  });
}
