/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#04324d',
        accent:  '#39a900',
        'verde-sena': '#39a900',
        'azul-sena': '#04324d',
        // New Mockup 2026 colors
        'primary-container': '#002b40',
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b',
        'outline-variant': 'rgba(203, 213, 225, 0.8)',
        secondary: '#226d00',
        'on-secondary': '#ffffff',
        'on-primary': '#ffffff',
        // Layered semantic tokens
        canvas: '#e9eff2',
        'canvas-deep': '#dfe8ec',
        'surface-subtle': '#f6f9fa',
        'surface-selected': '#edf7f2',
        'border-subtle': '#d5e0e5',
        'border-strong': '#b9cbd3',
        ink: '#102c3b',
        'ink-muted': '#607783',
        'brand-deep': '#04324d',
        'brand-mid': '#0b536f',
        'brand-green': '#39a900',
        tertiary: '#0a1b2e',
        background: '#e9eff2',
        surface: '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f3ff',
        'primary-fixed': '#cbe6ff',
        'on-primary-fixed': '#001e30',
        'tertiary-fixed-dim': '#b7c8e1',
        'on-primary-container': '#759bba',
      },
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
