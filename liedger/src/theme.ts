/**
 * Liedger design tokens. Dark, private, a little mischievous.
 */
export const colors = {
  bg: '#0B0B0F',
  surface: '#15151D',
  surfaceAlt: '#1E1E29',
  border: '#2A2A38',
  text: '#F4F4F8',
  textMuted: '#9A9AAE',
  textFaint: '#6A6A7E',
  primary: '#7C5CFF',
  primaryDim: '#43386E',
  // Risk levels for how exposed a lie is.
  riskLow: '#3DD68C',
  riskMed: '#F5B14C',
  riskHigh: '#FF6B6B',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const font = {
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 26, xxl: 34 },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
