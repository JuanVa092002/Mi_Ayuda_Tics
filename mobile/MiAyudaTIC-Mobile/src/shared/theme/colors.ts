import { semanticColors } from './semantic-colors';

/** Legacy flat API — kept for screens not yet migrated to semantic tokens. */
export const colors = {
  brandGreen: semanticColors.brand.green,
  brandBlue: semanticColors.brand.blue,
  panelGray: semanticColors.surface.muted,
  inputWhite: semanticColors.surface.card,
  textDark: semanticColors.text.primary,
  white: semanticColors.surface.default,
  error: semanticColors.state.error,
} as const;

export { semanticColors };
