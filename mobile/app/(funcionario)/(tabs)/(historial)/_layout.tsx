import { Stack } from 'expo-router';

/**
 * Nested stack for the Solicitudes tab.
 * Keeps `solicitud/[id]` as an internal push target (tab bar stays visible,
 * back returns to the list) and prevents expo-router from registering it
 * as an extra tab in the parent tab bar.
 */
export default function HistorialTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
