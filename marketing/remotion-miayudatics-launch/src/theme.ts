export const LAUNCH_THEME = {
  colors: {
    // Institutional Brand Colors (SENA / MiAyudaTIC)
    senaNavy: '#04324D',
    senaGreen: '#39A900',
    senaGreenHover: '#2E8500',
    senaNavyDark: '#021B2A',

    // Surfaces & Neutrals
    surfaceDefault: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    surfaceSubtle: '#F1F5F9',
    surfaceCard: '#FFFFFF',
    surfaceBorder: '#E2E8F0',
    borderLight: '#EDF2F7',

    // Typography
    textPrimary: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    textLink: '#04324D',

    // Semantic States
    stateSuccess: '#39A900',
    stateSuccessBg: '#E8F5E0',
    stateInfo: '#04324D',
    stateInfoBg: '#E8EEF2',
    stateWarning: '#D97706',
    stateWarningBg: '#FEF3C7',
    stateError: '#DC2626',
    stateErrorBg: '#FEE2E2',

    // Shadows
    shadowCard: '0 8px 30px -4px rgba(4, 50, 77, 0.08), 0 4px 12px -2px rgba(4, 50, 77, 0.04)',
    shadowModal: '0 24px 60px -12px rgba(4, 50, 77, 0.25)',
    shadowSubtle: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  springs: {
    smooth: { damping: 20, mass: 0.9, stiffness: 100 },
    snappy: { damping: 16, mass: 0.7, stiffness: 130 },
    gentle: { damping: 24, mass: 1.1, stiffness: 80 },
  },
  safeZones: {
    vertical: {
      top: 160,
      bottom: 340,
      side: 72,
      subtitleY: 1460,
    },
    horizontal: {
      top: 100,
      bottom: 120,
      side: 100,
      subtitleY: 900,
    },
  },
};
