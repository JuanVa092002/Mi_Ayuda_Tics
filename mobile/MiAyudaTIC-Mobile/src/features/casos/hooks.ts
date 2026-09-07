import { useAuth } from '@/features/auth/auth-context';
import {
  filterCasosEnProgreso,
  filterCasosPorResolver,
  sortCasosByMostRecent,
} from '@/shared/contracts/caso';
import type { ResolveCasoInput } from '@/shared/contracts/solucion';
import { WORKFLOW_V2_MUTATION_AUTO_RETRY } from '@/shared/api/workflow-retry-policy';
import { queryKeys } from '@/shared/query/keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  fetchCasosAsignados,
  fetchCasosResueltos,
  fetchCasoDetalle,
  resolverCaso,
  iniciarAtencion,
  agregarActualizacion,
  solicitarInformacion,
  registrarSolucionParcial,
  registrarSolucionTotal,
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
    retry: false,
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

function useInvalidateCaso(solicitudId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';
  return async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.casos.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.casos.detail(solicitudId) });
    if (userId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.casos.asignados(userId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.casos.resueltos(userId) });
    }
  };
}

export function useIniciarAtencion(solicitudId: string) {
  const { token } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: () => iniciarAtencion(token!, solicitudId),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: invalidate,
  });
}

export function useActualizacionCaso(solicitudId: string) {
  const { token } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (mensaje: string) => agregarActualizacion(token!, solicitudId, mensaje),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: invalidate,
  });
}

export function useSolicitarInformacion(solicitudId: string) {
  const { token } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (mensaje: string) => solicitarInformacion(token!, solicitudId, mensaje),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: invalidate,
  });
}

export function useSolucionParcial(solicitudId: string) {
  const { token } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (payload: {
      queSeHizo: string;
      queFalta: string;
      siguienteAccion: string;
      fechaEsperada?: string;
      }) => registrarSolucionParcial(token!, solicitudId, payload),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: invalidate,
  });
}

export function useSolucionTotal(solicitudId: string) {
  const { token } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (payload: { queSeHizo: string; causaIdentificada?: string }) =>
      registrarSolucionTotal(token!, solicitudId, payload),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: invalidate,
  });
}
