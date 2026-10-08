import { useAuth } from '@/features/auth/auth-context';
import {
  casoDetailFromSummary,
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
  type CasoEvidenceInput,
} from './api';
import { isOfflineQueryError } from '@/features/tecnico/offline-model';
import { enqueueTechnicianDraft, runOrQueue } from '@/features/tecnico/offline-sync';
import {
  loadTecnicoOffline,
  markAssignedSource,
  peekTecnicoOffline,
  saveTecnicoAssigned,
  saveTecnicoClosed,
  saveTecnicoDetail,
} from '@/features/tecnico/offline-store';

const OFFLINE_GC_MS = 24 * 60 * 60 * 1000;

export function useCasosAsignados() {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.casos.asignados(userId),
    queryFn: async () => {
      try {
        const data = await fetchCasosAsignados(token!);
        await saveTecnicoAssigned(userId, data);
        markAssignedSource(userId, 'network');
        return data;
      } catch (error) {
        if (isOfflineQueryError(error) && userId) {
          const snap = await loadTecnicoOffline(userId);
          if (snap.assigned.length > 0) {
            markAssignedSource(userId, 'cache');
            return snap.assigned;
          }
        }
        throw error;
      }
    },
    enabled: Boolean(token && userId),
    placeholderData: () => peekTecnicoOffline(userId)?.assigned,
    staleTime: 30_000,
    gcTime: OFFLINE_GC_MS,
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
    queryFn: async () => {
      try {
        const data = await fetchCasosResueltos(token!);
        await saveTecnicoClosed(userId, data);
        return data;
      } catch (error) {
        if (isOfflineQueryError(error) && userId) {
          const snap = await loadTecnicoOffline(userId);
          if (snap.closed.length > 0) return snap.closed;
        }
        throw error;
      }
    },
    enabled: Boolean(token && userId),
    placeholderData: () => peekTecnicoOffline(userId)?.closed,
    select: (items) => sortCasosByMostRecent(items).slice(0, 5),
    gcTime: OFFLINE_GC_MS,
  });
}

export function useCasosResueltosCompletos() {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.casos.resueltos(userId),
    queryFn: async () => {
      try {
        const data = await fetchCasosResueltos(token!);
        await saveTecnicoClosed(userId, data);
        return data;
      } catch (error) {
        if (isOfflineQueryError(error) && userId) {
          const snap = await loadTecnicoOffline(userId);
          if (snap.closed.length > 0) return snap.closed;
        }
        throw error;
      }
    },
    enabled: Boolean(token && userId),
    placeholderData: () => peekTecnicoOffline(userId)?.closed,
    select: (items) => sortCasosByMostRecent(items),
    gcTime: OFFLINE_GC_MS,
  });
}

export function useCasoDetalle(id: string) {
  const { token, user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: queryKeys.casos.detail(id),
    queryFn: async () => {
      try {
        const data = await fetchCasoDetalle(token!, id);
        if (userId) await saveTecnicoDetail(userId, data);
        return data;
      } catch (error) {
        if (isOfflineQueryError(error) && userId) {
          const snap = await loadTecnicoOffline(userId);
          const cached = snap.details[id];
          if (cached) return cached;
          const summary = snap.assigned.find((item) => item.id === id) ?? snap.closed.find((item) => item.id === id);
          if (summary) return casoDetailFromSummary(summary);
        }
        throw error;
      }
    },
    enabled: Boolean(token && id),
    placeholderData: () => peekTecnicoOffline(userId)?.details[id],
    staleTime: 15_000,
    gcTime: OFFLINE_GC_MS,
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

function skipInvalidateIfQueued(invalidate: () => Promise<void>) {
  return (result: { queued?: boolean } | undefined) => {
    if (result?.queued) return;
    return invalidate();
  };
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
  const { token, user } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: () =>
      runOrQueue(
        user?.id,
        () => iniciarAtencion(token!, solicitudId),
        () =>
          enqueueTechnicianDraft(user!.id, {
            casoId: solicitudId,
            kind: 'start',
            pendingStart: true,
          }).then(() => undefined),
      ),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: skipInvalidateIfQueued(invalidate),
  });
}

export function useActualizacionCaso(solicitudId: string) {
  const { token, user } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (input: { mensaje: string; evidence?: CasoEvidenceInput }) =>
      runOrQueue(
        user?.id,
        () => agregarActualizacion(token!, solicitudId, input.mensaje, input.evidence),
        () =>
          enqueueTechnicianDraft(user!.id, {
            casoId: solicitudId,
            kind: 'update',
            mensaje: input.mensaje,
            attachmentUri: input.evidence?.uri,
            attachmentFileName: input.evidence?.fileName,
            attachmentMimeType: input.evidence?.mimeType,
          }).then(() => undefined),
      ),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: skipInvalidateIfQueued(invalidate),
  });
}

export function useSolicitarInformacion(solicitudId: string) {
  const { token, user } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (mensaje: string) =>
      runOrQueue(
        user?.id,
        () => solicitarInformacion(token!, solicitudId, mensaje),
        () =>
          enqueueTechnicianDraft(user!.id, {
            casoId: solicitudId,
            kind: 'request_info',
            mensaje,
          }).then(() => undefined),
      ),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: skipInvalidateIfQueued(invalidate),
  });
}

export function useSolucionParcial(solicitudId: string) {
  const { token, user } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (payload: {
      queSeHizo: string;
      queFalta: string;
      siguienteAccion: string;
      fechaEsperada?: string;
      evidence?: CasoEvidenceInput;
    }) =>
      runOrQueue(
        user?.id,
        () => registrarSolucionParcial(token!, solicitudId, payload),
        () =>
          enqueueTechnicianDraft(user!.id, {
            casoId: solicitudId,
            kind: 'partial',
            queSeHizo: payload.queSeHizo,
            queFalta: payload.queFalta,
            siguienteAccion: payload.siguienteAccion,
            fechaEsperada: payload.fechaEsperada,
            attachmentUri: payload.evidence?.uri,
            attachmentFileName: payload.evidence?.fileName,
            attachmentMimeType: payload.evidence?.mimeType,
          }).then(() => undefined),
      ),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: skipInvalidateIfQueued(invalidate),
  });
}

export function useSolucionTotal(solicitudId: string) {
  const { token, user } = useAuth();
  const invalidate = useInvalidateCaso(solicitudId);
  return useMutation({
    mutationFn: (payload: {
      queSeHizo: string;
      causaIdentificada?: string;
      evidence?: CasoEvidenceInput;
    }) =>
      runOrQueue(
        user?.id,
        () => registrarSolucionTotal(token!, solicitudId, payload),
        () =>
          enqueueTechnicianDraft(user!.id, {
            casoId: solicitudId,
            kind: 'resolve',
            queSeHizo: payload.queSeHizo,
            causaIdentificada: payload.causaIdentificada,
            attachmentUri: payload.evidence?.uri,
            attachmentFileName: payload.evidence?.fileName,
            attachmentMimeType: payload.evidence?.mimeType,
          }).then(() => undefined),
      ),
    retry: WORKFLOW_V2_MUTATION_AUTO_RETRY,
    onSuccess: skipInvalidateIfQueued(invalidate),
  });
}
