# Handoff — Rediseño premium mobile funcionario

## Goal

Elevar las vistas del rol `funcionario` a una experiencia mobile nativa, institucional y premium, inspirada en los principios de producto descritos en la conversación referenciada.

## Why

La primera versión funcional tenía jerarquía débil, demasiadas superficies competidoras, navegación incompleta y estados visuales inconsistentes. El rediseño prioriza claridad, confianza, una acción principal por pantalla y velocidad para reportar incidencias.

## Scope

- `app/(funcionario)/**`
- `src/features/solicitudes/**`
- Tokens y componentes compartidos mobile visibles por funcionario.

Fuera de alcance: API, contratos, web, auth base, técnico, líder y `mobile_flutter/`.

## Delivered

- Home con saludo contextual, CTA único para reportar, resumen compacto y actividad reciente.
- Bottom tabs funcionales: `Inicio`, `Crear`, `Solicitudes` y `Cuenta`.
- Historial con búsqueda, filtros, pull-to-refresh, skeleton, error con retry y empty state accionable.
- Cuenta real con correo, rol, centro, privacidad de sesión y logout confirmado.
- Detalle con código, badge, timeline, metadatos, descripción y evidencia en superficies separadas.
- Nueva solicitud con CTA fijo, `KeyboardAvoidingView`, campos con focus/error, picker nativo de cámara o galería, preview y eliminación de evidencia.
- La foto seleccionada ahora se envía realmente en el multipart de creación.
- Tokens institucionales y componentes de estados, botones, búsqueda, selects, badges y listas normalizados.
- Feedback de presión/haptics y targets táctiles mínimos en acciones principales.

## Decisions

- Marca: `#04324D` / `#39A900`; fondo claro y elevación mínima.
- Tipografía: Inter ya cargada por el root layout.
- Espaciado basado en escala de 4 px, padding horizontal de 20 px y radios semánticos.
- Se conserva la navegación tipada con rutas relativas para el nuevo tab de creación.
- No se agregaron dependencias ni cambios de plataforma.

## Verification

- `cd mobile/MiAyudaTIC-Mobile && pnpm typecheck` — PASS
- `cd mobile/MiAyudaTIC-Mobile && pnpm test` — PASS, 14 archivos / 91 tests
- `git diff --check` — PASS
- `pnpm validate` — pendiente por inconsistencia preexistente: `dev:emulator` está en `package.json` pero no documentado en `MOBILE_DEV.md`.

## Open risks

- Falta smoke visual manual en emulador/dispositivo para confirmar teclado, safe areas, cámara y comportamiento del nuevo tab en Android/iOS.
- Los tipos generados de Expo Router (`.expo/types`) pueden requerir regeneración al iniciar Expo para reflejar el nuevo grupo `(crear)`.
- La analítica de `mobile_solicitud_created` sigue pendiente de instrumentación de plataforma.

## Next owner

Mobile Engineer + Design Engineer: ejecutar smoke UI en Android físico/emulador, revisar screenshots a 375×812 y firmar el checklist de aceptación mobile.
