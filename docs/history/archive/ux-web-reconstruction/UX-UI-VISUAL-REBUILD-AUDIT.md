# Auditoría de Reconstrucción Visual de Nivel Élite (Fase 0)

## 1. Análisis de Problemas Visuales Actuales

| Rol / Superficie | Problema Visual Identificado | Causa Raíz | Impacto Operativo | Patrón de Referencia Aplicable (Untitled UI / Linear / CraftUI) | Cambio Propuesto | Criterio de Aceptación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Líder TIC** (`AdminSolicitud.tsx`) | • Hero oscuro `#04324d` sobredimensionado que consume ~220px de altura inicial.<br>• Botones de asignación parecen etiquetas sin peso táctil.<br>• Exceso de uppercase y texto pequeño de 10px en badges. | • Header gigante con gradiente decorativo.<br>• Clases ad-hoc `uppercase tracking-widest text-[11px]`. | • El líder debe hacer scroll para ver la cola de triaje.<br>• Dificultad para discernir acciones primarias de meras etiquetas informativas. | • **Compact Operational Header** (estilo Untitled UI / Linear): Título editorial claro (28px) con status dot y botón primario alineado a la derecha.<br>• **Standard Action Buttons**: Altura mínima de 40px con texto a 13-14px en Sentence case. | • Reemplazar el hero oscuro por un Header de Operaciones limpio y compacto con métricas sutiles.<br>• Sistema de botones con variantes primarias, secundarias y destructivas. | • El 100% de la cola y del inspector de despacho quedan visibles en un viewport de 900px de altura sin scroll del viewport. |
| **Técnico** (`CasosPorResolverTabla.tsx`) | • Estructura idéntica al Líder TIC (mismo hero oscuro).<br>• Acciones "Avance", "Pedir info" en texto pequeño plano.<br>• Exceso de cápsulas (`rounded-full`) que infantilizan la interfaz. | • Falta de diferenciación de personalidad por rol.<br>• Adopción de `rounded-full` como estilo universal. | • Sensación de estar usando una plantilla genérica.<br>• Dificultad en campo (móvil/tablet) para presionar botones pequeños de 11px. | • **Terminal de Resolución Focalizada**: Barra de estado del caso en curso con acento verde SENA sobrio, lista de trabajo a la izquierda con avatares/iniciales y panel de detalle con tabs de acción estructurados. | • Header compacto específico de terminal de soporte.<br>• Botones con radio moderado (`rounded-xl` / `10-12px`) y altura de 40-44px.<br>• Texto a 13-14px. | • Las 4 acciones operativas del técnico ("Iniciar Atención", "Bitácora", "Pedir Información", "Finalizar") son botones físicos claramente distinguibles por jerarquía. |
| **Funcionario** (`Funcionario.tsx` / `HistorialFuncionario.tsx`) | • Banner de bienvenida genérico tipo blog ("¿En qué podemos apoyarte hoy?").<br>• Tarjeta de caso activo con gradiente ámbar chillón.<br>• Demasiado espacio en blanco sin datos útiles. | • Enfoque de landing page en vez de portal de autoservicio de soporte.<br>• Contenedores sobredimensionados. | • El funcionario no tiene certeza inmediata de quién atiende su caso ni cuál es la siguiente acción requerida. | • **Customer Portal Tracking**: Header minimalista con botón "+ Radicar Incidencia" en primario azul, panel de caso activo con Stepper de 4 etapas sobrio y lista histórica compacta. | • Transformar el hero en un Header de Asistencia editorial.<br>• Stepper con círculos numerados e indicadores de progreso sobrios.<br>• Panel de detalle con resumen ejecutivo del requerimiento. | • El caso activo muestra con claridad cristalina el técnico asignado, la fecha estimada y el estado actual sin ruido visual. |

---

## 2. Principios de Diseño Extraídos de las Referencias Visuales
1. **Tipografía Editorial con Jerarquía Rigurosa**:
   - `Display/H1`: 28-32px / Bold (700-800) en color tinta profunda (`#102c3b`).
   - `Section/Card Titles`: 16-18px / Bold (700) sin uppercase forzado.
   - `Body/Description`: 14px / Regular (400-500) con altura de línea 1.5 para máxima legibilidad.
   - `Labels & Metadata`: 12-13px / Medium (500) en tonos neutros contrastados (`#607783`).
   - **Regla de Oro**: Se destierra el uppercase de frases y párrafos largos; solo se preserva para acrónimos o tags técnicos breves (e.g. `CTPI`, `TIC`, `ID`).

2. **Sistema de Botones con Presencia Física**:
   - Altura estándar: 40px en desktop / 44px en targets móviles.
   - Radio moderado (`rounded-xl` / 10-12px), abandonando el `rounded-full` indiscriminado.
   - Tipografía: 13-14px / Semibold (600) en Sentence case (e.g. *"Asignar especialista"*, *"Iniciar atención"*, *"Añadir bitácora"*).
   - Jerarquía clara:
     - `Primary`: Azul SENA `#04324d` o Verde SENA `#39a900` sólido.
     - `Secondary`: Blanco con borde `#d5e0e5` y texto `#102c3b` con hover `#f6f9fa`.
     - `Destructive`: Rojo `#b42318` con hover `#911b12` para cancelaciones.

3. **Arquitectura de Superficies por Capas**:
   - Nivel 0 (Canvas): `--canvas: #e9eff2` (gris azulado sobrio con contraste perceptible frente al blanco).
   - Nivel 1 (Paneles y Contenedores): `--surface: #ffffff` con bordes nítidos de 1px `--border: #d5e0e5`.
   - Nivel 2 (Sub-bloques de contexto e inspectores): `--surface-subtle: #f6f9fa` con bordes `--border: #d5e0e5`.
   - Nivel 3 (Fila seleccionada): `--surface-selected: #edf7f2` con acento lateral verde/azul.
