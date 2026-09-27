#!/bin/bash
# Script para renderizar el preview de validación de 15 segundos
set -e
echo "🎬 Renderizando preview de 15 segundos de MiAyudaTIC Launch..."
mkdir -p out
pnpm remotion render src/index.ts PreviewShort out/preview-15s.mp4
echo "✅ Preview generado con éxito en out/preview-15s.mp4"
