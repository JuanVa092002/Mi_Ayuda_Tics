export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: 17,
    lineHeight: 27,
    letterSpacing: 0.5,
  },
  h3: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: 0.5,
  },
  p1: {
    fontFamily: fontFamilies.medium,
    fontSize: 17,
    lineHeight: 27,
    letterSpacing: 0.5,
  },
  p2: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  button: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: 0.105,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  badge: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
