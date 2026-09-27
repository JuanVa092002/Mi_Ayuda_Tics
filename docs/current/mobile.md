# Superficie Mobile — Perfil de Contexto Agéntico

## Propósito
Desarrollo y experiencia nativa de campo para técnicos y funcionarios mediante la aplicación móvil oficial MiAyudaTIC en Expo y React Native.

## Rutas que el agente DEBE leer
- `mobile/MiAyudaTIC-Mobile/src/` (Pantallas Expo Router, componentes compartidos UI, stores Zustand y hooks)
- `packages/contracts/src/` (Tipos compartidos de casos y solicitudes)
- `docs/current/current-mobile-agent-context.md` (Estado canónico de la app móvil, invariantes y deuda técnica)
- `docs/design-system.md` (Tokens visuales institucionales SENA)

## Fuente de verdad
- Estado operativo móvil: `docs/current/current-mobile-agent-context.md`
- Componentes UI móviles compartidos: `mobile/MiAyudaTIC-Mobile/src/shared/ui/`
- Guardrail Cursor: `.cursor/rules/50-mobile-scope.mdc`
- Subagente: `.cursor/agents/mobile-engineer.md`

## Comandos de validación
```bash
pnpm -C mobile/MiAyudaTIC-Mobile run typecheck
pnpm -C mobile/MiAyudaTIC-Mobile run test
```

## Rutas que DEBE excluir
- `client/` (Frontend Web)
- `server/` (Backend API)
- `marketing/` (Piezas audiovisuales)
- `mobile/**/.expo/`, `mobile/**/.gradle/` (Cachés de compilación nativa)
- `mobile_flutter/` (Legacy obsoleto: terminantemente prohibido acceder)

## Riesgos y archivos protegidos
- **Archivos protegidos:** Configuración nativa `app.json`, `mobile/MiAyudaTIC-Mobile/src/features/auth/` (almacenamiento de tokens en SecureStore).
- **Prohibiciones:** No instalar nuevas dependencias sin autorización (HITL). No añadir librerías con componentes nativos no soportados por el dev client.
