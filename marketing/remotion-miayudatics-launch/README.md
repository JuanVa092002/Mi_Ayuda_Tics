# Video de Lanzamiento Oficial — MiAyudaTIC (Remotion)

Proyecto de video de producto premium desarrollado de forma aislada e independiente con **Remotion** para presentar **MiAyudaTIC** ante la comunidad institucional y centros de formación.

---

## 🎯 Propuesta de Valor y Transformación Narrativa

El video vende la transformación operativa real:
```text
Incidencias dispersas y sin responsable
→ solicitud trazable
→ asignación clara
→ atención en campo
→ evidencia
→ solución verificable
→ control para la institución
```

En los primeros 10 segundos, el espectador comprende con claridad:  
> **"MiAyudaTIC organiza y hace trazable el soporte técnico institucional."**

Al finalizar el video, el espectador retiene los cuatro pilares fundamentales:  
> **"Una solicitud. Un responsable. Un historial. Una solución verificable."**

---

## 📐 Especificaciones de Formato

| Parámetro | Formato Principal (Vertical) | Formato Derivado (Horizontal) |
| :--- | :--- | :--- |
| **Resolución** | `1080 × 1920` (9:16) | `1920 × 1080` (16:9) |
| **Duración** | 85 segundos (2550 cuadros) | 85 segundos (2550 cuadros) |
| **FPS** | 30 cuadros por segundo | 30 cuadros por segundo |
| **Uso previsto** | TikTok, Instagram Reels, YouTube Shorts | Pantallas, auditorios, YouTube estándar |
| **Composición** | `MiAyudaTICLaunchVertical` | `MiAyudaTICLaunchHorizontal` |

---

## 📁 Estructura del Proyecto

```text
marketing/remotion-miayudatics-launch/
├── remotion.config.ts          # Configuración del motor de renderizado
├── tsconfig.json               # Configuración TypeScript bundler
├── package.json                # Scripts y dependencias Remotion
├── README.md                   # Esta documentación
├── voiceoverScript.md          # Guion oficial de locución (98 palabras)
├── captions.srt                # Subtítulos estándar sincronizados
├── audio-cues.md               # Guía de efectos sonoros y niveles
├── assets-manifest.md          # Licencias y sanitización de datos
├── docs/
│   └── visual-storyboard.md    # Storyboard escena por escena
├── public/
│   └── assets/
│       └── logoSena.png        # Emblema institucional
├── scripts/
│   ├── render-preview.sh       # Script para preview corto (15s)
│   └── render-all.sh           # Script para render completo
└── src/
    ├── index.ts                # Entrada raíz de Remotion
    ├── Root.tsx                # Registro de composiciones
    ├── theme.ts                # Tokens de color (#04324D, #39A900), fuentes y safe-zones
    ├── MainVertical.tsx        # Composición vertical 9:16 completa
    ├── MainHorizontal.tsx      # Composición horizontal 16:9 adaptada
    ├── PreviewShort.tsx        # Composición de validación corta (15s)
    ├── components/
    │   ├── BrandFrame.tsx      # Cabecera de marca y logo SENA
    │   ├── Caption.tsx         # Subtítulos quemados de alto contraste
    │   ├── StatusPill.tsx      # Pastillas de estado del sistema real
    │   ├── PhoneMockup.tsx     # Mockup de smartphone vertical
    │   ├── BrowserMockup.tsx   # Mockup de navegador para Líder TIC
    │   ├── WorkflowLine.tsx    # Ciclo de vida: Reportar → Asignar → Atender → Resolver → Confirmar
    │   ├── TimelineEvent.tsx   # Eventos cronológicos inmutables
    │   ├── SanitizedScreenFuncionario.tsx  # Vista de reporte en campo
    │   ├── SanitizedScreenWebLider.tsx     # Vista web /adminSolicitud
    │   └── SanitizedScreenTecnico.tsx      # Vista móvil del técnico
    ├── data/
    │   ├── scriptData.ts       # Datos demo sanitizados (Laura, Andrés, Lab A-201)
    │   └── captions.ts         # Timings de subtítulos por cuadro
    └── scenes/
        ├── Scene01Hook.tsx             # 0–3s: El caos de las incidencias dispersas
        ├── Scene02Positioning.tsx      # 3–7s: Presentación de MiAyudaTIC
        ├── Scene03FuncionarioReport.tsx # 7–15s: Reporte en el ambiente
        ├── Scene04ImmediateTrust.tsx   # 15–22s: Solicitud registrada #2026-09-00042
        ├── Scene05WebLeader.tsx        # 22–31s: Control web y asignación a técnico
        ├── Scene06TechnicianField.tsx  # 31–42s: Técnico con contexto completo
        ├── Scene07ProgressPartial.tsx  # 42–52s: Solución temporal y avances documentados
        ├── Scene08VerifiableSolution.tsx # 52–62s: Solución confirmada por el usuario
        ├── Scene09CompleteProduct.tsx  # 62–75s: Móvil + Web: una sola fuente de verdad
        └── Scene10CTA.tsx              # 75–85s: Los cuatro pilares y llamado a la acción
```

---

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
Desde la carpeta del proyecto:
```bash
cd marketing/remotion-miayudatics-launch
pnpm install
```

### 2. Abrir Remotion Studio (Vista previa interactiva)
Permite inspeccionar cada escena, reproducir a cualquier velocidad y ajustar cuadros en vivo:
```bash
pnpm start
```
Se abrirá automáticamente el navegador en `http://localhost:3000`.

### 3. Verificar tipado de código
```bash
pnpm run typecheck
```

---

## 🎬 Guía de Renderizado

> **⚠️ REGLA DE VALIDACIÓN:**  
> Según la directriz de proyecto, **no debe renderizarse ni publicarse el video final completo de 85s** hasta que el usuario o comité apruebe explícitamente el preview, el CTA y la voz.

### Renderizar el Preview de Validación (15 segundos)
Genera un corte rápido de 15 segundos que abarca la Escena 1 (Caos), Escena 2 (Posicionamiento) y Escena 3 (Reporte en campo) en formato vertical 9:16 con subtítulos:
```bash
pnpm run render:preview
```
*Salida:* `out/preview-15s.mp4`.

### Renderizar Fotogramas Clave de Cada Escena (Stills)
Permite generar una imagen estática de alta resolución de las 10 escenas simultáneamente para revisión editorial:
```bash
pnpm run render:stills
```
*Salida:* `out/still-01-hook.png` hasta `out/still-10-cta.png`.

### Renderizar el Video Vertical Completo (Tras aprobación)
```bash
pnpm run render:vertical
```
*Salida:* `out/miayudatics-launch-vertical.mp4`.

### Renderizar la Versión Horizontal (16:9)
```bash
pnpm run render:horizontal
```
*Salida:* `out/miayudatics-launch-horizontal.mp4`.

---

## 🛠️ Personalización de Datos y CTA

### Cambiar el CTA final o URL
Los textos y enlaces se pueden sobreescribir vía props en `src/data/scriptData.ts` o directamente al invocar el renderizado por CLI:

```bash
pnpm remotion render src/index.ts MiAyudaTICLaunchVertical out/video.mp4 --props='{"ctaText":"Solicita tu Demostración","ctaUrl":"https://soporte.sena.edu.co"}'
```

Props soportadas:
- `ctaText` (string): Texto del botón de acción final (por defecto: `"Conoce MiAyudaTIC"`).
- `ctaUrl` (string): URL o dominio mostrado debajo del botón.
- `captionsEnabled` (boolean): Activar o desactivar subtítulos quemados en pantalla.
- `voiceoverEnabled` (boolean): Integrar pista de locución cuando esté disponible.

### Modificar o sustituir datos demo
Todos los nombres y detalles de incidencias se encuentran centralizados en `src/data/scriptData.ts`. Para ajustarlos de forma institucional, editar las constantes `DEMO_CASE`.

---

## ✅ Checklist de Validación Institucional

- [x] **Typecheck limpio:** `tsc --noEmit` completado con 0 errores.
- [x] **Propuesta en primeros 10s:** El caos y el posicionamiento de MiAyudaTIC se transmiten en los primeros 7 segundos.
- [x] **Identidad visual oficial:** Uso exclusivo de Azul `#04324D`, Verde `#39A900`, fondos claros y tipografía limpia.
- [x] **Safe zones verticales 9:16:** Subtítulos y elementos críticos posicionados fuera de las zonas de interfaz de Reels/TikTok.
- [x] **Roles representados:** Funcionario (Móvil), Líder TIC (Web), Técnico (Móvil).
- [x] **Workflow exacto:** Solicitado → Asignado → En Progreso → Solución Parcial → Resuelto/Confirmado.
- [x] **Sanitización de datos:** 100% libre de datos personales, correos reales, teléfonos o tokens.
- [x] **Sin claims falsos:** Cero referencias a IA, chatbots o SLAs inventados.
- [x] **Arquitectura horizontal 16:9:** Lista y desacoplada para futuras presentaciones institucionales.
