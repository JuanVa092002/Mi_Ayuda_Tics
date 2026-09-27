# Onboarding — especificación Figma (extracción completa)

Fuente: [Chefio UI Kit — Onboarding](https://www.figma.com/design/Gi6VjjQY1j40IVAVQMfhdf/Chefio---Recipe-App-UI-Kit?node-id=11993-576)

| Campo | Valor |
|-------|-------|
| File key | `Gi6VjjQY1j40IVAVQMfhdf` |
| Página | `Fullscreen` (`156:0`) |
| Frame | `Onboarding` (`11993:576`) |
| Viewport | **375 × 812** (iPhone X class) |
| Extraído | 2026-06-15 vía Figma MCP |

## Archivos en este directorio

| Archivo | Contenido |
|---------|-----------|
| `tokens.json` | Colores, tipografía, spacing, componentes |
| `layers.json` | Árbol de capas, posiciones exactas, ritmo vertical |
| `reference-web.tsx` | Código de referencia (Tailwind) del MCP |
| `assets/onboarding-screen@2x.png` | Export PNG @2x del frame completo |
| `assets/onboarding-reference.png` | Screenshot de referencia |
| `assets/logo-sena.png` | Imagen original del logo SENA |
| `assets/status-bar-*.png` | Iconos decorativos del status bar mockup |

---

## Vista general

Pantalla de bienvenida con:

1. Status bar iOS (decorativo en Figma)
2. Wordmark **MI** + **AYUDA** + **TICS** (tres textos separados)
3. Logo SENA
4. Título de valor
5. Descripción
6. Botón **Login** (azul oscuro)
7. Botón **Sign Up** (verde)
8. Home indicator (decorativo en Figma)

```
┌─────────────────────────────┐  y=0
│ 9:41          ▂▄▆█ 🔋       │  Status bar (44px)
├─────────────────────────────┤
│                             │
│      MI AYUDA TICS          │  y=192
│         [SENA logo]         │  y=224 (178×163)
│                             │
│  Gestiona el soporte        │  y=368
│   técnico del CTPI          │
│                             │
│  Reporta incidencias...     │  y=439
│                             │
│  ┌─────────────────────┐    │
│  │       Login         │    │  y=540 (#04324D)
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │      Sign Up        │    │  y=621 (#39A900)
│  └─────────────────────┘    │
│         ─────────           │  y=778 Home indicator
└─────────────────────────────┘  y=812
```

---

## Colores

| Token | Hex | Uso en Onboarding |
|-------|-----|-------------------|
| White | `#FFFFFF` | Fondo de pantalla |
| Main Text | `#2E3E5C` | Título y párrafo |
| Brand Dark | `#04324D` | "MI", "TICS", botón Login |
| Brand Green | `#39A900` | "AYUDA", botón Sign Up, logo SENA |
| Button label | `#FFFFFF` | Texto de ambos botones |
| Status / Home | `#000000` | Status bar mockup, home indicator |

> El componente base `Primary / Default` usa `#1FCC79` en el design system, pero **las instancias de Onboarding lo sobreescriben** a `#04324D` y `#39A900`.

---

## Tipografía

Fuente principal: **Inter** (cargar en app: `@expo-google-fonts/inter` o equivalente).

### Wordmark (MI / AYUDA / TICS)

| Propiedad | Valor |
|-----------|-------|
| Font | Inter Bold (700) |
| Size | 22px |
| Line height | 32px |
| Letter spacing | 0.5px |
| MI | `#04324D` |
| AYUDA | `#39A900` |
| TICS | `#04324D` |

### Título — token H1

| Propiedad | Valor |
|-----------|-------|
| Texto | `Gestiona el soporte`<br>`técnico del CTPI` |
| Font | Inter Bold 22/32 |
| Color | `#2E3E5C` |
| Align | center |

### Descripción — token P2

| Propiedad | Valor |
|-----------|-------|
| Texto | `Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.` |
| Font | Inter Medium 15/25 |
| Color | `#2E3E5C` |
| Letter spacing | 0.5px |
| Align | center |
| Max width visual | 364px (puede extenderse 4px fuera del frame a la izquierda en Figma) |

### Botones

| Propiedad | Valor |
|-----------|-------|
| Font | Inter Bold 15px |
| Letter spacing | 0.105px |
| Color | `#FFFFFF` |

### Status bar (solo mockup)

| Propiedad | Valor |
|-----------|-------|
| Font | SF Pro Text Semibold 15px |
| Letter spacing | -0.3px |
| Texto | `9:41` |

---

## Copy (textos exactos)

| Node ID | Contenido |
|---------|-----------|
| `12000:547` | `MI` |
| `12000:549` | `AYUDA` |
| `12000:552` | `TICS` |
| `11993:598` | `Gestiona el soporte`<br>`técnico del CTPI` |
| `11993:597` | `Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.` |
| `11993:595` | `Login` |
| `11993:594` | `Sign Up` |

---

## Layout — posiciones absolutas (375×812)

Todas las coordenadas son **desde la esquina superior izquierda del frame**.

| Elemento | x | y | w | h |
|----------|---|---|---|---|
| Status bar | 0 | 0 | 375 | 44 |
| MI | 119 | 192 | 27 | 32 |
| AYUDA | 146 | 192 | 81 | 32 |
| TICS | 223 | 192 | 54 | 32 |
| Logo SENA | 105 | 224 | 178 | 163 |
| Título | 78 | 368 | 220 | 64 |
| Descripción | -4 | 439 | 364 | 50 |
| Login | 31 | 540 | 327 | 56 |
| Sign Up | 25 | 621 | 327 | 56 |
| Home indicator frame | 121 | 778 | 134 | 34 |

### Ritmo vertical (gaps)

| Entre | Gap |
|-------|-----|
| Wordmark → logo | 32px |
| Título → descripción | ~7px |
| Descripción → Login | ~51px |
| Login → Sign Up | **25px** |
| Sign Up → home area | ~101px |

### Alineación horizontal

- Logo: `x=105` (centro matemático del frame sería `98.5` → **+6.5px** a la derecha)
- Botón Login: margen izq. **31px**, der. **17px**
- Botón Sign Up: margen izq. **25px**, der. **23px** (ligeramente descentrado respecto a Login)

---

## Componente: Primary / Default

| Campo | Valor |
|-------|-------|
| Symbol ID | `156:2395` |
| Ancho default | auto (en instancias: **327**) |
| Alto | **56** |
| Border radius | **32** (pill) |
| Padding | **32** horizontal, **19** vertical |
| Label default | `Default` |
| BG default (symbol) | `#1FCC79` |

### Overrides en Onboarding

| Instancia | Node | Label | Background |
|-----------|------|-------|------------|
| Login | `11993:595` | Login | `#04324D` |
| Sign Up | `11993:594` | Sign Up | `#39A900` |

Estados hover/pressed/disabled **no están definidos** en este frame; ver página `Style Guide & Component` → `Buttons` para variantes completas.

---

## Assets

| Asset | Archivo local | Dimensiones en diseño |
|-------|---------------|----------------------|
| Logo SENA | `assets/logo-sena.png` | 178×163, `object-fit: cover` |
| Pantalla completa | `assets/onboarding-screen@2x.png` | 750×1624 export (@2x) |
| Referencia visual | `assets/onboarding-reference.png` | 375×812 |

**Nota:** Las URLs temporales del MCP expiran en ~7 días. Los PNG en `assets/` son la copia persistente.

---

## Implementación React Native (blueprint)

```tsx
// Valores en lógica — escalar con Dimensions si se requiere responsive
const COLORS = {
  background: '#FFFFFF',
  mainText: '#2E3E5C',
  brandDark: '#04324D',
  brandGreen: '#39A900',
};

// Estructura sugerida
<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
  <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }}>
    {/* Wordmark: row con 3 Text o un componente BrandTitle */}
    <View style={{ marginTop: 148 }}>{/* 192 - status offset aprox */}</View>

    <Image source={require('./assets/logo-sena.png')} style={{ width: 178, height: 163, marginTop: 32 }} />

    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 32, color: COLORS.mainText, textAlign: 'center', marginTop: -19 }}>
      {'Gestiona el soporte\ntécnico del CTPI'}
    </Text>

    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 25, letterSpacing: 0.5, color: COLORS.mainText, textAlign: 'center', maxWidth: 364, marginTop: 7 }}>
      Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.
    </Text>

    <View style={{ marginTop: 'auto', width: 327, gap: 25, marginBottom: 101 }}>
      <Pressable style={{ height: 56, borderRadius: 32, backgroundColor: COLORS.brandDark, justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#FFF', textAlign: 'center', letterSpacing: 0.105 }}>Login</Text>
      </Pressable>
      <Pressable style={{ height: 56, borderRadius: 32, backgroundColor: COLORS.brandGreen, justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#FFF', textAlign: 'center', letterSpacing: 0.105 }}>Sign Up</Text>
      </Pressable>
    </View>
  </View>
</SafeAreaView>
```

**En dispositivo real:** omitir status bar y home indicator de Figma; el OS los provee.

---

## Variables Figma enlazadas al nodo

```json
{
  "White": "#FFFFFF",
  "Main Text": "#2E3E5C",
  "P2": "Inter Medium 15/25, tracking 0.5",
  "H1": "Inter Bold 22/32, tracking 0.5"
}
```

---

## Navegación esperada (inferida)

| Control | Acción |
|---------|--------|
| Login | → pantalla `Sign In` (`160:22`) |
| Sign Up | → flujo de registro (no visible en este frame) |

---

## Checklist para réplica pixel-perfect

- [ ] Fondo `#FFFFFF` full screen
- [ ] Inter Bold/Medium cargadas
- [ ] Wordmark con colores split: `#04324D` / `#39A900` / `#04324D`
- [ ] Logo 178×163 en posición relativa correcta
- [ ] Título 22/32 centrado, 2 líneas
- [ ] Body 15/25, tracking 0.5, centrado, ~364px ancho
- [ ] Botones 327×56, radius 32, gap 25px
- [ ] Login `#04324D`, Sign Up `#39A900`
- [ ] Label botón: Inter Bold 15, tracking 0.105, blanco
- [ ] Safe area inferior para home indicator del dispositivo
- [ ] Comparar contra `assets/onboarding-screen@2x.png`
