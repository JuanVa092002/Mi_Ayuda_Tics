# MiAyudaTIC Mobile

**Guía canónica (loop diario):** [`MOBILE_DEV.md`](./MOBILE_DEV.md)

```bash
pnpm install --ignore-workspace
pnpm native:build:dev      # una vez por dispositivo — development build (no por TSX)
pnpm dev:emulator          # cada día — un Metro
pnpm open:emulator         # AVD → mismo Metro
pnpm open:physical         # teléfono USB → mismo Metro (adb reverse)
pnpm native:build:release  # QA / demo sin Metro — no es el IDE
```

Release, huellas y App Links: [`mobile-android-dev-build.md`](./mobile-android-dev-build.md)
