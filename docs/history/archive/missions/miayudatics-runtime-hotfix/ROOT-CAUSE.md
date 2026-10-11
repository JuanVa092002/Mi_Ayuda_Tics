# Causa Raíz de la Pantalla Blanca (ROOT-CAUSE.md)

## 1. Identificación del Error
Durante la inspección del navegador en `http://localhost:5173/`, el árbol DOM se renderizó completamente vacío debido a la siguiente excepción no capturada de JavaScript:

```text
Uncaught SyntaxError: Duplicate export of 'SemanticIcon'
at http://localhost:5173/src/shared/ui/index.ts:24:34
```

## 2. Archivo y Línea Responsable
- **Archivo:** `client/src/shared/ui/index.ts`
- **Línea:** 39
- **Contenido anterior causante del fallo:**
  ```typescript
  export { default as SemanticIcon, SemanticIcon } from './SemanticIcon'
  ```
  Al exportar simultáneamente `default as SemanticIcon` y `SemanticIcon` nombrado dentro de la misma declaración de re-exportación, el compilador de ES Modules en Vite / Rollup detectó un identificador de exportación duplicado en el espacio de nombres del módulo.

## 3. Resolución Aplicada (Fix Mínimo)
Se modificó la declaración en `client/src/shared/ui/index.ts` a una exportación nombrada pura e inequívoca:
```typescript
export { SemanticIcon } from './SemanticIcon'
export type { SemanticIconProps, SemanticIconName } from './SemanticIcon'
```
Se verificó que todos los componentes consumidores (`Funcionario.tsx`, `CasosPorResolverTabla.tsx`, `AdminSolicitud.tsx`, `StatusBadge.tsx`, `FeedbackBanner.tsx`) importan `{ SemanticIcon }` como named import de `@/shared/ui` de forma 100% compatible.

## 4. Estado Post-Fix
- Cero SyntaxErrors de exportación.
- Compilación y evaluación de módulos ES limpia en Vite.
- React monta el árbol de componentes sin interrupción.
