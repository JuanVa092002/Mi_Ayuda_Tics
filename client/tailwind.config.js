/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Brand ── */
        brand:       '#04324d',
        'brand-hover': '#032539',
        'brand-subtle': '#e6eef3',
        'brand-muted':  '#cddce6',
        accent:      '#2f9600',
        'accent-subtle': '#eaf5e6',

        /* ── Legacy aliases (keep for existing components) ── */
        primary:          '#04324d',
        'verde-sena':     '#2f9600',
        'azul-sena':      '#04324d',
        'primary-container': '#002b40',
        'on-surface':     '#0e2433',
        'on-surface-variant': '#3d5a6a',
        secondary:        '#226d00',
        'on-secondary':   '#ffffff',
        'on-primary':     '#ffffff',

        /* ── Canvas ── */
        canvas:           '#f0f4f6',
        'canvas-deep':    '#e8eef2',

        /* ── Surface layers ── */
        surface:          '#ffffff',
        'surface-raised': '#ffffff',
        'surface-subtle': '#f7f9fa',
        'surface-selected': '#e8f3ed',

        /* ── Borders ── */
        'border-subtle':  '#dde5e9',
        'border-strong':  '#c4d2d9',

        /* ── Ink ── */
        ink:              '#0e2433',
        'ink-muted':      '#3d5a6a',

        /* ── Brand deep (token) ── */
        'brand-deep':     '#04324d',
        'brand-mid':      '#0b536f',
        'brand-green':    '#2f9600',

        /* ── States ── */
        warning:          '#92610f',
        danger:           '#991b1b',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(4,50,77,.04)',
        '2xs': '0 1px 1px rgba(4,50,77,.03)',
        'card': '0 2px 6px rgba(4,50,77,.06), 0 1px 2px rgba(4,50,77,.04)',
        'panel': '0 4px 16px rgba(4,50,77,.08), 0 2px 4px rgba(4,50,77,.05)',
        'modal': '0 20px 60px rgba(4,50,77,.16), 0 4px 16px rgba(4,50,77,.10)',
      },
    },
  },
  plugins: [],
}
