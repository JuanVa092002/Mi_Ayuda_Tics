import * as SecureStore from 'expo-secure-store';
import type { AppRole } from '@/shared/contracts/user';

const SESSION_KEY = 'miayudatics_session_snapshot';

export type SessionSnapshot = {
  userId: string;
  role: AppRole;
};

export async function saveSessionSnapshot(snapshot: SessionSnapshot): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(snapshot));
}

export async function getSessionSnapshot(): Promise<SessionSnapshot | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
}

export async function clearSessionSnapshot(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
