#!/bin/bash
# Script para renderizar composiciones completas (requiere aprobación previa del preview)
set -e
echo "🎬 Renderizando composición Vertical 9:16 (85 segundos)..."
mkdir -p out
pnpm remotion render src/index.ts MiAyudaTICLaunchVertical out/miayudatics-launch-vertical.mp4

echo "🎬 Generando fotogramas clave de cada escena..."
pnpm run render:stills
echo "✅ Renderizado completado con éxito en carpeta out/"
