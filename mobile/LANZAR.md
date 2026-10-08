# Lanzar la app en el emulador

Git Bash. Solo el emulador. El teléfono USB no entra en este loop.

Los comandos **no cambiaron**. Lo que cambió es la carpeta: ya no es `mobile/MiAyudaTIC-Mobile`. Ahora es:

```bash
cd /c/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/mobile
```

Hay dos capas:

1. **Cascarón nativo** (APK development build). Cámara, permisos, scheme. Casi no cambia. Ya está instalada en el emulador.
2. **JavaScript vivo** (Metro en el PC, puerto **8081**). Pantallas, estilos, rutas. Eso es lo que editas.

El emulador llega a Metro por `10.0.2.2:8081`. No es Expo Go ni Wi‑Fi.

## Cada vez

### 1. Emulador (si no está abierto)

```bash
emulator -avd Samsung_26_Ultra -no-snapshot-load -skin 1344x2992
```

Espera a que Android arranque. Comprueba:

```bash
adb devices
```

Quieres `emulator-5554    device`.

### 2. Metro (una sola vez; deja la terminal abierta)

```bash
pnpm dev:emulator
```

Si Metro ya responde en `127.0.0.1:8081`, no abre otro. `pnpm start` y `pnpm dev` hacen lo mismo. `Ctrl+C` apaga el JS.

### 3. Abrir tu app contra ese Metro

En **otra** terminal, misma carpeta:

```bash
pnpm open:emulator
```

Abre el development build (no Chrome, no Expo Go) y carga el JS por `10.0.2.2:8081`. No instala APK ni recompila nativo.

Edita `app/` o `src/` y guarda. Fast Refresh llega en 1–3 s.

## Si `pnpm` pide reinstalar y se aborta

En una terminal sin TTY a veces aparece `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`. En Git Bash interactivo no debería pasar. Si falta `node_modules/expo`:

```bash
pnpm install --ignore-workspace
```

Luego otra vez `pnpm dev:emulator`.
