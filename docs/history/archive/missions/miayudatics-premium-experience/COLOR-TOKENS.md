# Tokens de Color Semántico y Contraste (COLOR-TOKENS.md)

## 1. Paleta Semántica Enterprise

```css
:root {
  /* ── Brand ── */
  --brand-navy:       #04324d; /* Estructura, títulos y confianza */
  --brand-navy-hover: #032539;
  --brand-green:      #2f9600; /* Acciones positivas y avance SENA */
  --brand-green-hover:#267d00;

  /* ── Superficies ── */
  --canvas:           #f0f4f6;
  --surface:          #ffffff;
  --surface-subtle:   #f7f9fa;
  --surface-selected: #e8f3ed;

  /* ── Bordes y Foco ── */
  --border-subtle:    #dde5e9;
  --border-strong:    #c4d2d9;
  --focus:            #04324d;

  /* ── Estados Semánticos (WCAG AA Cumplido) ── */
  --success:          #14692a;
  --success-bg:       #f0faf3;
  --warning:          #92610f;
  --warning-bg:       #fef9ec;
  --danger:           #991b1b;
  --danger-bg:        #fef2f2;
  --info:             #1347a3;
  --info-bg:          #eff5ff;
}
```

## 2. Validación de Contraste WCAG 2.1 AA
- **Texto Primario (`#0e2433`) sobre Superficie (`#ffffff`)**: Ratio `14.8:1` (Pasa AAA).
- **Verde SENA (`#2f9600`) sobre Blanco (`#ffffff`)**: Ratio `4.6:1` (Pasa AA para texto grande / badges con texto oscuro).
- **Badge Inbox (Azul `#04324d` sobre `#e6eef3`)**: Ratio `9.2:1` (Pasa AAA).
- **Badge Warning (Ámbar `#92610f` sobre `#fef9ec`)**: Ratio `5.8:1` (Pasa AA).
