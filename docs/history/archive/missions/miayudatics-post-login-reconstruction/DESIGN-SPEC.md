# Especificación de Diseño Radical Post-Login — Misión P0

## 1. Fundamentos del Sistema Visual (Superficies, Capas y Tipografía)

### 1.1 Paleta y Capas (Canvas vs Superficies)
Alineado con los requisitos del diseño:
- `--canvas: #f0f4f6`: Lienzo general frío y limpio de fondo.
- `--canvas-deep: #e2ebf0`: Fondos de contraste y áreas de reposo.
- `--surface: #ffffff`: Tarjetas y paneles principales elevados.
- `--surface-subtle: #f8fafb`: Sub-superficies para metadatos y contenedores internos.
- `--surface-selected: #eaf5ee`: Superficie de elemento enfocado/seleccionado con matiz verde sutil.
- `--border-subtle: #dbe4e8`: Delimitadores nítidos de 1px.
- `--border-strong: #b8c9d2`: Bordes con foco o estado activo.
- `--ink: #0b2230`: Texto principal de alto contraste y legibilidad.
- `--ink-muted: #506775`: Texto secundario y metadatos.
- `--brand-deep: #04324d`: Azul SENA institucional para jerarquía directiva y botones primarios.
- `--brand-green: #2f9600`: Verde SENA de confirmación, resolución y progreso activo.
- `--warning: #b45309`: Alertas de SLA o atención requerida.
- `--danger: #b91c1c`: Casos bloqueados o errores.

---

## 2. Dirección Específica por Rol

### 2.1 Rol 1: Funcionario — "Centro de Acompañamiento y Tranquilidad"
*Mental Model: Un usuario que necesita saber que su incidente no fue olvidado, qué paso sigue y quién lo está cuidando.*

1. **Header de Bienvenida Cálida:**
   - Saludo personalizado: "Hola, {nombre} 👋" con estado general sintetizado: "¿Tienes algún problema con tus equipos hoy?".
   - Botón Primario Dominante: `+ Radicar nueva incidencia` (abre el `SlideOverDrawer` lateral limpio, nunca más deformando la página).
2. **Hero del Caso Activo Protagonista (Si existe ticket en curso):**
   - Tarjeta protagonista con elevación suave y acento de estado.
   - **Stepper de 4 Fases Integrado (PAIR):**
     1. `Radicado` -> 2. `Asignado a Especialista` -> 3. `En Atención Técnica` -> 4. `Solucionado`.
   - **Tarjeta de Acompañamiento Personal:**
     - Avatar del técnico asignado, nombre, estado ("En sitio", "Diagnóstico remoto") y teléfono directo o extensión para contacto inmediato.
     - Indicador claro de "¿Debo hacer algo?": Si está en `esperando_usuario`, alerta con acción de respuesta; si no, mensaje de tranquilidad.
3. **Historial Compacto y Trazable:**
   - Sección inferior que lista requerimientos anteriores en formato limpio con fechas, ambiente y estado.
   - Clic en cualquier ticket abre la inspección sin recargas.
4. **Radicación Asistida en SlideOverDrawer:**
   - Formulario completo con selector de Ambiente, Categoría, Detalle y Carga de Foto en un panel lateral de ancho `lg` con footer de acciones claras: `Cancelar` y `Radicar Incidencia`.

---

### 2.2 Rol 2: Técnico — "Consola de Resolución Operativa de Alta Densidad"
*Mental Model: Un especialista técnico que entra a resolver, no a pasear por menús. Necesita saber cuál caso es el más crítico AHORA.*

1. **Panel Superior: "Focus Case Console" (El caso prioritario activo):**
   - Si tiene un caso en atención o el más antiguo por iniciar, se presenta en una barra/panel superior prominente con:
     - Código del caso, prioridad, tiempo transcurrido desde radicación.
     - Ubicación exacta (Ambiente/Laboratorio) y Solicitante.
     - Botones de 1 solo toque:
       - `Iniciar Atención` (si está asignado).
       - `Bitácora / Avance` (actualización rápida).
       - `Solicitar Información` (si falta evidencia).
       - `Resolver Caso` (botón verde de cierre exitoso).
2. **Selector de Colas Operativas:**
   - Pestañas con contadores vivos:
     - `Por Iniciar`
     - `En Atención Activa`
     - `Esperando Funcionario`
     - `Esperando Confirmación`
3. **Workspace de Dos Columnas con Foco:**
   - **Columna Izquierda (Cola Priorizada):** Tarjetas con indicador visual de urgencia, ambiente y tiempo.
   - **Columna Derecha (Inspector Contextual Fijo):**
     - Detalle de la falla, evidencia fotográfica con visor lightbox.
     - Historial de bitácora y acciones inmediatas.

---

### 2.3 Rol 3: Líder TIC — "Centro de Decisión y Capacidad de Equipo"
*Mental Model: Un director de operaciones que monitorea capacidad de técnicos, evita cuellos de botella y despacha inmediatamente.*

1. **Panel de Capacidad de Equipo en Vivo:**
   - Visualización de Técnicos del CTPI con su carga actual (Casos activos, estado disponible/ocupado).
   - Permite arrastrar o asignar en 1 toque conociendo quién tiene menos saturación.
2. **Barra de Decisión y Cuellos de Botella:**
   - Casos sin asignar > 24h (Riesgo SLA).
   - Casos bloqueados o en espera de piezas/información.
3. **Mesa de Despacho Ágil:**
   - Lista priorizada de solicitudes nuevas.
   - Inspector lateral con previsualización completa de la falla y selector de técnico inteligente con recomendación de carga equilibrada.
