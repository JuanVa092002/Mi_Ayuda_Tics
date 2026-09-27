# Video de Lanzamiento Institucional MiAyudaTIC con HyperFrames (HeyGen)

Este proyecto contiene la producción completa del **video vertical de lanzamiento (1080 × 1920, 9:16, 30 fps, 85 segundos)** para **MiAyudaTIC**, desarrollado con **HyperFrames** de HeyGen.

> **Importante:** Este proyecto no utiliza Remotion ni altera ningún archivo productivo (`server/`, `client/`, `mobile/`, `packages/`). Se ubica de forma 100% aislada en `marketing/hyperframes-miayudatics-launch/`.

---

## 1. Propuesta de Valor y Mensaje Central

- **Propósito:** Explicar visualmente en menos de 10 segundos cómo MiAyudaTIC organiza el soporte técnico institucional (reportar, asignar, atender, documentar y confirmar soluciones).
- **Narrativa:**
  - *Antes:* Las incidencias se pierden entre llamadas, mensajes de chat y notas en papel.
  - *Después:* Cada solicitud tiene un código único, un responsable claro, un historial inmutable y una solución verificable.
- **Mensaje final obligatorio:**
  > *"Una solicitud. Un responsable. Un historial. Una solución verificable."*

---

## 2. Especificaciones Técnicas

| Parámetro | Valor |
|---|---|
| **Motor de Render** | HyperFrames (HeyGen) v0.8.33 |
| **Resolución** | 1080 × 1920 (Vertical 9:16 para Reels, TikTok y Shorts) |
| **FPS** | 30 fotogramas por segundo |
| **Duración Total** | 85 segundos (10 escenas secuenciales) |
| **Librería de Animación** | GSAP 3.14.2 (seekable determinista) |
| **Paleta Institucional** | Azul SENA (`#04324D`), Verde SENA (`#39A900`), Superficies claras (`#F8FAFC`, `#FFFFFF`) |
| **Safe Zones** | Respetadas (160px margen superior, 220px margen inferior libre de UI crítica) |

---

## 3. Estructura de Archivos del Proyecto

```
marketing/hyperframes-miayudatics-launch/
├── hyperframes.json               # Configuración de rutas y resolución
├── package.json                   # Dependencias y scripts de HyperFrames
├── index.html                     # Orquestador maestro de la composición completa (85s)
├── index.css                      # Variables de diseño, fuentes y tokens
├── assets-manifest.md             # Inventario de assets y certificación de privacidad
├── audio-cues.md                  # Mapa sonoro y sincronización de efectos
├── captions.srt                   # Subtítulos oficiales sincronizados
├── voiceover-script.md            # Guion de locución en español neutro (98 palabras)
├── storyboard.md                  # Storyboard escena por escena con visuales y tiempos
├── assets/
│   └── logoSena.png               # Logo institucional SENA autorizado
├── components/
│   ├── phone-mockup.css           # Mockup de smartphone ultra realista
│   ├── browser-mockup.css         # Mockup de navegador de escritorio
│   └── workflow-line.css          # Conectores y nodos de flujo
├── compositions/                  # 10 Escenas modulares como sub-composiciones
│   ├── scene-01-hook.html         # 00–03s: Dolor reconocible y notas dispersas
│   ├── scene-02-orden.html        # 03–07s: Caos transformado en flujo ordenado
│   ├── scene-03-funcionario.html  # 07–16s: Funcionario reporta desde móvil
│   ├── scene-04-confianza.html    # 16–23s: Ticket 2026-09-00042 registrado
│   ├── scene-05-lider.html        # 23–34s: Líder TIC opera mesa web (/adminSolicitud)
│   ├── scene-06-tecnico.html      # 34–46s: Técnico atiende caso en móvil
│   ├── scene-07-historial.html    # 46–58s: Historial append-only y avance
│   ├── scene-08-solucion.html     # 58–68s: Solución aplicada y confirmada
│   ├── scene-09-ecosistema.html   # 68–80s: Los tres roles y dispositivos conectados
│   ├── scene-10-cierre.html       # 80–85s: Marca, 4 pilares y CTA editable
│   └── preview-short.html         # Composición standalone de preview corto (12s)
└── renders/
    └── preview-12s.mp4            # Video MP4 renderizado del preview corto (12s)
```

---

## 4. Guía de Ejecución y Comandos

### Pre-requisito: FFmpeg en PATH (Windows)
HyperFrames requiere FFmpeg y FFprobe para renderizar video. Si no está en tu PATH global:
```powershell
$env:PATH = "C:\Users\JuanC\tools\ffmpeg\ffmpeg-master-latest-win64-gpl\bin;" + $env:PATH
```

### A. Abrir Preview en Vivo (Studio Interactivo)
Inicia el servidor interactivo de HyperFrames Studio en el navegador:
```bash
npm run dev
# o directamente:
npx hyperframes preview
```
Abre la URL indicada (ej. `http://localhost:3002/#project/hyperframes-miayudatics-launch`) para recorrer la línea de tiempo completa, editar elementos o ver la previsualización a 30 fps.

### B. Validar Composición (Linter y Browser Check)
HyperFrames audita estáticamente y mediante sesión headless de navegador la sintaxis, compatibilidad, contrastes WCAG AA y tiempos:
```bash
npm run lint
npm run check
```
*(Resultado actual: 0 errores, 0 advertencias, 79/79 textos cumplen estándar de contraste WCAG AA).*

### C. Renderizar Preview Corto (12 segundos)
Genera el render de muestra local (Hook + Orden + Reporte en móvil):
```bash
npm run render:preview
```
El video generado se guarda en `renders/preview-12s.mp4`.

### D. Renderizar Video Final Completo (85 segundos)
*Solo ejecutar cuando el cliente haya aprobado la revisión:*
```bash
npm run render -- --quality high --output renders/miayudatics-lanzamiento-final.mp4
```

---

## 5. Personalización y Configuración

### Modificar el Llamado a la Acción (CTA)
En `compositions/scene-10-cierre.html`:
```html
<div id="cta-button-el" class="btn-cta-10">
  Conoce MiAyudaTIC <!-- Editar este texto según campaña -->
</div>
```

### Integrar Locución Grabada (Voiceover)
1. Exportar pista de voz en MP3/WAV a 48 kHz.
2. Guardar el archivo en `assets/voiceover.mp3`.
3. Agregar la etiqueta de audio en `index.html`:
```html
<audio id="vo" src="assets/voiceover.mp3" data-start="0" data-duration="85"></audio>
```

---

## 6. Reporte de Cumplimiento de las 12 Reglas de Validación

- [x] **1. El hook se entiende sin audio:** Tarjetas flotantes amarillas y rojas con mensajes de dolor institucional son 100% legibles visualmente.
- [x] **2. La propuesta de valor se entiende en menos de 10 segundos:** Entre el segundo 0 y el 7 se muestra la transición de caos a flujo ordenado con el mensaje claro.
- [x] **3. Se muestran claramente web y mobile:** Mockups vectoriales diferenciados de smartphone (Funcionario y Técnico) y browser web (Líder TIC `/adminSolicitud`).
- [x] **4. Se entienden los tres roles:** Laura Martínez (Funcionario), Coordinación TIC (Líder) y Andrés Rojas (Técnico).
- [x] **5. El workflow completo se entiende visualmente:** `Reportar → Asignar → Atender → Resolver → Confirmar`.
- [x] **6. Ninguna capacidad es inventada:** Cero mención a IA, chatbots, SLAs ficticios o autoasignaciones no existentes.
- [x] **7. El texto se lee en pantalla de teléfono:** Fuentes entre 24px y 68px, alto contraste y safe zones respetadas.
- [x] **8. No hay datos reales o secretos:** Solo datos de demostración ficticios especificados en el prompt.
- [x] **9. No hay logos o música sin licencia:** Únicamente logo SENA autorizado; cero logos de terceros (WhatsApp, Gmail, etc.).
- [x] **10. No hay errores ortográficos:** Revisión ortográfica y gramatical completa en todos los textos.
- [x] **11. No se excede 90 segundos:** Duración exacta de 85 segundos.
- [x] **12. El CTA es editable:** Configurable en un solo selector de `scene-10-cierre.html`.
