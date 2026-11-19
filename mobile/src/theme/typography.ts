import type { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 32,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const typography = {
  screenTitle: {
    fontSize: fontSizes.xxl,
    lineHeight: 34,
    fontWeight: fontWeights.bold,
  },

  sectionTitle: {
    fontSize: fontSizes.xl,
    lineHeight: 28,
    fontWeight: fontWeights.bold,
  },

  cardTitle: {
    fontSize: fontSizes.md,
    lineHeight: 22,
    fontWeight: fontWeights.semibold,
  },

  body: {
    fontSize: fontSizes.md,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
  },

  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
  },

  caption: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
    fontWeight: fontWeights.regular,
  },

  price: {
    fontSize: fontSizes.xl,
    lineHeight: 28,
    fontWeight: fontWeights.bold,
  },

  button: {
    fontSize: fontSizes.md,
    lineHeight: 22,
    fontWeight: fontWeights.semibold,
  },
} satisfies Record<string, TextStyle>;
