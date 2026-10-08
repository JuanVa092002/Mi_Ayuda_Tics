export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  p1: {
    fontFamily: fontFamilies.medium,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0,
  },
  p2: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  button: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: 0.105,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  badge: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
