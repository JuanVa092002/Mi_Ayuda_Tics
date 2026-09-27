# Superficie Marketing y Video — Perfil de Contexto Agéntico

## Propósito
Producción y renderizado de material audiovisual de lanzamiento, showcases de producto, videos promocionales e institucionales utilizando Remotion y Hyperframes.

## Rutas que el agente DEBE leer
- `marketing/product-film/src/` (Composición 16:9 de showcase de producto en Remotion)
- `marketing/remotion-miayudatics-launch/` (Composiciones verticales de lanzamiento)
- `marketing/hyperframes-miayudatics-launch/` (Composiciones web y motion con Hyperframes)
- `.agents/skills/` (Skills multimedia de Remotion, audio y animación bajo demanda)

## Fuente de verdad
- Composición principal Showcase: `marketing/product-film/src/Root.tsx` y `MainVideo.tsx`
- Tokens y colores de marca: `marketing/product-film/src/theme.ts`
- Skills multimedia: `.agents/skills/remotion/` y `.agents/skills/heygen/`

## Comandos de validación
```bash
pnpm -C marketing/product-film run build --help
```

## Rutas que DEBE excluir
- `client/` (Frontend Web operativo)
- `server/` (Backend API operativo)
- `mobile/` (App Móvil nativa)
- `marketing/**/out/`, `marketing/**/renders/` (Salidas de video renderizadas)

## Riesgos y archivos protegidos
- **Archivos protegidos:** Assets originales en `marketing/product-film/public/assets/`, archivos de audio y voces narradas.
- **Prohibiciones:** No renderizar MP4 finales pesados durante sesiones interactivas de código a menos que se solicite explícitamente. Mantener las salidas de render en directorios ignorados por Git.
