# Diagnóstico de Producto (PRODUCT-DIAGNOSIS.md)

## Calificación de la Experiencia Inicial: 1/10

### 1. Funcionario (`/funcionario`)
- **Problema de fondo:** Trata al funcionario como un digitador de tickets y luego como un lector de tablas de base de datos.
- **Falta de certeza:** Los estados son técnicos (`solicitado`, `asignado`, `en_progreso`). No le explican al usuario qué está pasando en su ambiente ni si debe estar físicamente en el aula.
- **Sobrecarga cognitiva:** La pantalla presenta múltiples elementos compitiendo por atención (cards estadísticas poco informativas, tablas con fechas crudas).
- **Sensación:** “Dejé mi reporte en un buzón ciego y no sé si alguien vendrá”.

### 2. Técnico (`/casos-por-resolver`)
- **Problema de fondo:** Trata al técnico como un oficinista que llena formularios en vez de un especialista en campo que necesita velocidad de intervención.
- **Pérdida de contexto:** Para ver la foto del fallo o la ubicación, el técnico tenía que inspeccionar filas o cambiar de vistas.
- **Acciones ambiguas:** Múltiples botones para iniciar o resolver compitiendo con la tabla.
- **Sensación:** “Tengo que descifrar una tabla para saber a qué aula ir primero”.

### 3. Líder TIC (`/adminSolicitud`)
- **Problema de fondo:** No es un centro de comando, es una lista sin priorización clara.
- **Falta de inteligencia de despacho:** El líder no ve de inmediato cuántos casos tiene cada técnico asignado ni quién está disponible ahora mismo para emergencias en aulas.
- **Sobrecarga de clics:** Navegación torpe entre tablas y modales.
- **Sensación:** “No sé dónde está el cuello de botella ni si el laboratorio de redes está desatendido”.

## Metas de Elevación Radical
1. **Humanizar el Funcionario:** Convertir la experiencia en un asistente personal de seguimiento con un timeline claro, un solo caso activo dominante y un botón directo para radicar o aportar datos.
2. **Potenciar al Técnico:** Convertir la vista en una cabina de comando táctil/operativa con Focus Case superior, ficha técnica de ambiente/contacto, evidencia visual directa y transiciones de 1 toque (Iniciar -> Bitácora -> Resolver).
3. **Empoderar al Líder TIC:** Visión panorámica del piso/centro de formación, conteo real de capacidad técnica, cola priorizada con alertas de tickets estancados y despacho en 1 toque.
