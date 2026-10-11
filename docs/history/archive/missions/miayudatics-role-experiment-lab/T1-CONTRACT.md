# Contrato de Producto — T1: Workbench de Intervención

- **Usuario:** Técnico de campo asignado a múltiples casos que necesita todo el contexto técnico en su estación de trabajo.
- **Job Principal:** Diagnosticar la falla, revisar antecedentes del aula, iniciar la atención y formalizar la solución con soporte documental.
- **Problema:** Cambiar de pantalla entre la cola, la bitácora y el formulario de cierre causa pérdida de tiempo y contexto.
- **Hipótesis:** Un workbench integrado con Active Job dominante (8 cols) y cola persistente (4 cols) más un Action Rail lateral maximiza la velocidad operativa.
- **Composición:** Split workbench (pantalla dividida 4:8) con Action Rail persistente para mutaciones rápidas.
- **Flujo:** Seleccionar caso → Preparar visita → Iniciar atención → Registrar bitácora de avance → Formalizar solución.
- **Copy:** "Caso en atención técnica", "Preparación de visita", "Próxima acción", "Registrar avance en bitácora".
- **CTA Principal:** `Iniciar atención` / `Formalizar solución técnica`.
- **Acciones Secundarias:** Registrar bitácora de campo, Solicitar información al usuario, Registrar solución parcial.
- **Estados:** Asignado, En Atención, Esperando Usuario, Resuelto.
- **Métrica:** Tiempo mínimo entre asignación e inicio de atención efectiva en sitio.
- **Tradeoff:** Mayor densidad visual en pantallas de menor tamaño.
