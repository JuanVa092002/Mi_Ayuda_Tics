# Fase 2.5 ?" Zod Migration
## Objetivo
Reemplazar express-validator por Zod en todos los
validators del backend para contratos de runtime
mǭs robustos y tipado end-to-end.

## Contexto
- Fase 2 completada: backend 100% TypeScript estricto
- express-validator funciona pero no genera tipos TS
- Zod genera tipos automǭticamente desde los schemas
- ADR-002: decisin de diferir Zod documentada

## Scope
o. server/validators/*.ts (4 archivos)
o. Integracin en controllers que usan handleValidator
o. Tipos inferidos exportados para reusar en frontend
? NO tocar modelos Mongoose
? NO tocar middlewares
? NO tocar controllers (solo imports de validators)
? NO tocar frontend todava

## Stack de validacin objetivo
- Zod para definicin de schemas y tipos
- zod-validation-error para mensajes legibles
- handleValidator.ts actualizado para usar ZodError

## Archivos a migrar
1. validators/auth.ts (76 lneas)
2. validators/usuarios.ts (45 lneas)
3. validators/solicitud.ts (30 lneas)
4. validators/restablecerPassword.ts (22 lneas)
5. utils/handleValidator.ts (actualizar para Zod)
