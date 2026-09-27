# MiAyudaTICS — Crítica Visual y de Experiencia de Producto (FAANG / B2B World-Class Standard)

**Fecha:** 2026-09-27  
**Evaluador:** Executive Product Design Director & Staff Product Designer  
**Entorno evaluado:** Servidor de desarrollo local Vite (`http://localhost:5173/`), código fuente en `client/`, estado Git HEAD `d1cdf44`.

---

## 1. Veredicto Ejecutivo

El refactor técnico previo (`a5d6476` a `d1cdf44`) resolvió con éxito la deuda arquitectónica más grave: eliminó layouts duplicados, erradicó el scroll trap y creó componentes reutilizables con pruebas de regresión. **Sin embargo, el producto sigue viéndose y sintiéndose como un prototipo o un software administrativo gubernamental genérico de los 2010s**.

No tiene carácter propio. Si se cambian los logos del SENA, la interfaz podría ser cualquier plantilla de panel de control administrativo de código abierto.

### Puntuación de Calidad Real (Escala 1 a 10)

| Dimensión | Puntuación | Diagnóstico |
|---|:---:|---|
| **Impacto y Excelencia Visual (Aesthetic WOW)** | **4.2 / 10** | Muy plano, dominado por blanco crudo y grises fríos genéricos, tarjetas repetitivas con bordes estándar y tipografía sin ritmo editorial. |
| **Jerarquía y Escaneabilidad Operativa** | **5.5 / 10** | El usuario no sabe de un vistazo qué hacer primero. La información crítica (urgencia, SLA, bloqueos) está oculta en tablas densas. |
| **Diferenciación de Personalidad por Rol** | **3.8 / 10** | Los tres roles comparten exactamente el mismo patrón: Header con título -> 3 tarjetas KPI -> Tabla ancha de datos. |
| **Emoción y Confianza B2B** | **4.8 / 10** | No transmite la precisión ni la sofisticación de Stripe, Linear o GitHub Enterprise. Se siente frágil y burocrático. |
| **Score Global de Producto** | **4.6 / 10** | **INSUFICIENTE para estándar World-Class.** Requiere rediseño de producto. |

---

## 2. Diagnóstico Visual y Operativo Detallado por Superficie

### 2.1 Portal de Acceso (`/loginMain`)
- **Problema:** Pantalla dividida en dos (50% azul oscuro SENA con orbes abstractos y 50% caja blanca centrada). Es un patrón cliché de landing de marketing SaaS de 2018.
- **Falta de foco:** La caja de formulario flota con sombra pesada `shadow-md`, input borders genéricos de Tailwind y botón azul estándar.
- **Oportunidad:** Convertirlo en un portal de entrada sobrio, institucional de alto nivel, con tipografía nítida, micro-interacciones pulidas y credenciales guiadas para pruebas operativas de cada rol.

### 2.2 Pantalla Crítica Líder TIC (`/adminSolicitud` & `/seguimiento`)
- **Problema de jerarquía:** Muestra 3 tarjetas KPI planas arriba (`Nuevos v2`, `Solicitados v1`, etc.) que no invitan a la acción. Luego una tabla masiva.
- **Ausencia de visión ejecutiva:** El Líder TIC no entra a revisar registros uno a uno como un empleado de ventanilla; necesita **visión de cuello de botella**:
  1. ¿Qué incidentes llevan más de 24h sin asignar?
  2. ¿Qué técnicos tienen sobrecarga de tickets?
  3. ¿Qué ambientes (laboratorios, aulas) están paralizados por fallas críticas de red o hardware?
- **Defecto visual:** El botón "Asignar" compite visualmente con el botón "Cancelar" y la evidencia fotográfica es una miniatura sin zoom interactivo inmediato.

### 2.3 Pantalla Crítica Funcionario (`/funcionario`)
- **El error del dashboard plano:** El funcionario ingresa para **reportar un daño urgente** o saber **cuándo van a arreglar su equipo**. En su lugar, se encuentra con una pantalla partida en 12 columnas: 3 columnas para un formulario vertical alargado y 9 columnas para una tabla gigante con historial.
- **Sobrecarga de inputs:** El formulario tiene aspecto de encuesta burocrática en lugar de un flujo asistido donde el ambiente y la categoría se reconozcan con contexto visual.
- **Falta de seguimiento vivo:** No hay línea de tiempo ni indicador de progreso del trámite ("Radicado" -> "Asignado a Técnico X" -> "En sitio" -> "Resuelto"). El estado es solo una píldora estática.

### 2.4 Pantalla Crítica Técnico (`/casos-por-resolver`)
- **El error de la tabla plana para un trabajador de campo/soporte:** Un técnico no trabaja como un operador de call center leyendo tablas infinitas. El técnico necesita:
  1. **Qué atender AHORA MISMO (Caso activo prioritario con SLA en curso).**
  2. **Cola de trabajo ordenada por urgencia e impacto en la formación.**
  3. **Acceso instantáneo a la evidencia (foto de la falla, contacto del docente/funcionario, ambiente físico).**
  4. **Acciones de resolución directas y sin fricción (Solución rápida con un clic, pedir info o escalamiento).**
- **Defecto visual actual:** Una fila de botones tipo "Trabajo técnico", "Por iniciar", "En atención", sobre una tabla monocromática donde todo luce igual de importante.

---

## 3. Elementos que Deben ser Erradicados
1. **La "Trinidad de Tarjetas KPI" obligatoria:** No poner 3 tarjetas en todas las páginas por inercia si no generan una decisión.
2. **El blanco hospitalario absoluto (`#ffffff` sobre `#f1f5f9` sin textura ni capas):** Falta profundidad, contraste tonal sutil y jerarquía de superficies.
3. **Tablas con demasiadas columnas sin jerarquía:** Toda celda tiene el mismo peso visual; el código del ticket (#123) no debe competir con el texto de la descripción.
4. **Badges de estado sin significado preatencional:** Colores apagados o genéricos que obligan a leer la palabra en lugar de comunicar el estado de un vistazo.

---

## 4. Conclusión de la Fase 0
Se aprueba formalmente el pase a la **Fase 1 (Nueva Dirección de Producto)** y **Fase 2 (Rediseño de las Tres Superficies Críticas)**. Se prohíbe continuar agregando componentes genéricos sin una propuesta de diseño integral y transformadora.
