# MiAyudaTICS — Dirección de Producto y Lenguaje Visual Premium (B2B World-Class)

**Fecha:** 2026-09-27  
**Autor:** Executive Product Design Director & Staff Product Designer  
**Aplicabilidad:** Todas las experiencias web en `client/` (Líder TIC, Funcionario, Técnico).

---

## 1. La Idea Central de Experiencia: "Operación en Tiempo Real y Confianza Institucional"

### ¿Por qué esta interfaz pertenece a MiAyudaTICS y no a cualquier otro SaaS genérico?
MiAyudaTICS no es una herramienta contable, ni un e-commerce, ni un CRM de ventas. Es el **sistema nervioso tecnológico del Centro de Teleinformática y Producción Industrial (CTPI - SENA)**, donde un proyector dañado, un switch sin conectividad o una sala de cómputo inhabilitada detiene la formación de cientos de aprendices.

Por tanto, la interfaz debe comunicar:
1. **Gravedad y Precisión:** La infraestructura educativa importa. La interfaz no debe sentirse como un juguete ni como un formulario aburrido. Debe transmitir la serenidad y exactitud de una sala de control moderna.
2. **Identidad SENA Elevada:** No usando logos gigantescos ni manchones de verde estridente, sino reinterpretando el `azul-sena` (`#04324d`) como el lecho estructural de orden y el `verde-sena` (`#39a900`) como el pulso vital de resolución, servicio activo y éxito técnico.
3. **Flujo de Trabajo Especializado:** Cada rol tiene una relación única con el tiempo y la acción.

---

## 2. Las Tres Personalidades Operativas del Sistema

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           MIAYUDATICS WEB                               │
│              Sistema de Diseño Institucional World-Class                │
├───────────────────┬─────────────────────────┬───────────────────────────┤
│   LÍDER TIC       │      FUNCIONARIO        │          TÉCNICO          │
│ "Control & Visión"│ "Claridad & Acompañamiento"│   "Foco & Resolución"     │
├───────────────────┼─────────────────────────┼───────────────────────────┤
│ • Cuellos de      │ • Solicitud asistida    │ • Ticket prioritario      │
│   botella en 5s   │ • Trazabilidad de       │   inmediato               │
│ • Asignación      │   progreso paso a paso  │ • Cola Kanban/Split de    │
│   inteligente     │ • Estado visual claro   │   atención activa         │
│ • Balance de carga│ • Cero terminología     │ • Acceso a evidencia      │
│   técnica         │   técnica confusa       │   en 1 clic               │
└───────────────────┴─────────────────────────┴───────────────────────────┘
```

### 2.1 Líder TIC: "Centro de Despacho y Mando"
- **Mentalidad del usuario:** "¿Hay incidentes graves sin atender? ¿Quién está libre para ir al ambiente 204? ¿Estamos cumpliendo con la sede?"
- **Diseño de la pantalla crítica (`/adminSolicitud`):**
  - **Hero de Despacho:** Muestra los casos no asignados agrupados por criticidad e impacto en ambientes de formación.
  - **Selector de Técnico con Contexto Operativo:** Al asignar, muestra no solo una lista plana de nombres, sino cuántos casos tiene cada técnico en curso para evitar sobrecargas.
  - **Acción Rápida de Despacho:** Asignación en dos toques con atajos de teclado.

### 2.2 Funcionario: "Portal de Asistencia y Tranquilidad"
- **Mentalidad del usuario:** "Tengo clase en 15 minutos y no da video el televisor del aula. Necesito ayuda ya y saber si alguien viene."
- **Diseño de la pantalla crítica (`/funcionario`):**
  - **Tarjeta de Caso Activo / En Progreso:** Si el funcionario tiene un ticket en atención, ese ticket es el **protagonista absoluto**, con el nombre del técnico, foto y estado actual ("El técnico Juan está en camino").
  - **Acción Primaria "Reportar Incidente":** Botón de alto relieve visual que abre un formulario conversacional fluido con selector visual de ambiente y cámara/evidencia.
  - **Historial Resumido:** Línea de vida clara, no una tabla fría con códigos hexadecimales de base de datos.

### 2.3 Técnico: "Terminal de Operación y Foco"
- **Mentalidad del usuario:** "Tengo 5 casos hoy. ¿Cuál es el más urgente? ¿Dónde queda el ambiente? ¿Qué problema reportó el docente?"
- **Diseño de la pantalla crítica (`/casos-por-resolver`):**
  - **Modo Enfoque (Current Active Ticket):** El caso que el técnico está atendiendo actualmente se despliega con tarjeta de inmersión, ubicación exacta, teléfono del funcionario y cronómetro de atención.
  - **Bandeja de Trabajo Dividida (Master-Detail):** En lugar de una tabla interminable que obliga a hacer scroll horizontal, una lista rápida a la izquierda y el detalle con acciones directas a la derecha ("Iniciar Atención", "Registrar Avance", "Finalizar con Evidencia").

---

## 3. Principios de Superficie, Jerarquía y Composición

### 3.1 Materialidad y Fondo
- **Background Primario:** `#F8FAFC` (Slate 50 refinado).
- **Superficies Elevadas (Cards & Containers):** `#FFFFFF` puro con borde de precisión `border border-slate-200/70` y sombra sutil difusa `shadow-[0_2px_8px_rgba(4,50,77,0.04)]`.
- **Superficies de Énfasis:** Fondos tintados en azul sena al 3% (`bg-[#04324d]/[0.03]`) para agrupar metadatos técnicos.

### 3.2 Tipografía con Ritmo Editorial
- **Familia tipográfica:** `Plus Jakarta Sans` y `Public Sans`.
- **Jerarquía:**
  - Títulos de Sección: `text-xl` a `text-2xl font-extrabold tracking-tight text-[#04324d]`.
  - Códigos de Ticket: `font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md`.
  - Acciones Primarias: Botones sólidos con `bg-[#04324d] hover:bg-[#032539] text-white shadow-sm`.
  - Micro-etiquetas: `text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400`.

### 3.3 Micro-interacciones con Sentido
- Hover en elementos accionables: Elevación de `1px` en Y (`hover:-translate-y-0.5`) con transición de 150ms.
- Indicador de estado "En Vivo": Punto pulsante en verde SENA (`animate-pulse bg-[#39a900]`) para tickets que están siendo atendidos en tiempo real.

---

## 4. Plan de Ejecución de las Tres Pantallas Críticas (Fase 2)

1. **Pantalla Funcionario (`/funcionario`):**
   - Transformar la vista en un **Centro de Asistencia** con widget de "Ticket en Curso" (si existe), botón de "Nueva Solicitud" asistida y tabla/timeline limpia de historial.
2. **Pantalla Técnico (`/casos-por-resolver`):**
   - Implementar vista operativa de alta productividad con métricas de urgencia, cola de trabajo organizada y modal/panel de acción rápida con un solo toque.
3. **Pantalla Líder TIC (`/adminSolicitud`):**
   - Reemplazar la tabla plana por una **Mesa de Despacho de Incidentes**, con balance de técnicos y asignación instantánea.
