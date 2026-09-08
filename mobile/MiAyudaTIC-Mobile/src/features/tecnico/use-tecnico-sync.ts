import { useAuth } from '@/features/auth/auth-context';
import {
  agregarActualizacion,
  iniciarAtencion,
  registrarSolucionParcial,
  registrarSolucionTotal,
  solicitarInformacion,
} from '@/features/casos/api';
import { pendingDrafts } from '@/features/tecnico/offline-model';
import { loadTecnicoOffline } from '@/features/tecnico/offline-store';
import { flushTecnicoDrafts } from '@/features/tecnico/offline-sync';
import { queryKeys } from '@/shared/query/keys';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

const defaultApi = {
  iniciarAtencion,
  agregarActualizacion,
  solicitarInformacion,
  registrarSolucionParcial,
  registrarSolucionTotal,
};

export function useTecnicoSync() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';

  const flush = useCallback(async () => {
    if (!userId || !token) return;
    const snapshot = await loadTecnicoOffline(userId);
    const pending = pendingDrafts(snapshot);
    if (pending.length === 0) return;
    const result = await flushTecnicoDrafts(userId, token, defaultApi);
    if (result.synced > 0) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.casos.all });
    }
  }, [queryClient, token, userId]);

  useEffect(() => {
    void flush();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flush();
    });
    return () => sub.remove();
  }, [flush]);
}
