/**
 * Placeholder Fase 0 — registro de push en Fase 1+.
 * Registrar device token solo con sesión autenticada permitida (funcionario / técnico activo).
 */

export async function registerDeviceForPush(_token: string, _authToken: string): Promise<void> {
  // Fase 1: integrar FCM/APNs y endpoint backend si existe.
}

export async function unregisterDeviceForPush(): Promise<void> {
  // Fase 1: invalidar token en backend al logout.
}
