export const colors = {
  background: '#f4f7fb',
  foreground: '#0b0f17',
  card: '#ffffff',
  cardForeground: '#0b0f17',
  popover: '#ffffff',
  popoverForeground: '#0b0f17',
  primary: '#10b981',
  primaryHover: '#059669',
  primaryBorder: '#047857',
  primaryForeground: '#ffffff',
  secondary: '#eef2f7',
  secondaryForeground: '#0b0f17',
  muted: '#eef2f7',
  mutedForeground: '#5b6472',
  accent: '#e6ebf2',
  accentForeground: '#0b0f17',
  destructive: '#ef4444',
  destructiveHover: '#f05a4f',
  destructiveBorder: '#c0362d',
  destructiveForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#1a1205',
  success: '#10b981',
  surface: '#ffffff',
  surfaceHover: '#eef2f7',
  surfaceActive: '#ffffff',
  border: '#e2e7ef',
  borderLight: 'rgba(15, 23, 42, 0.07)',
  borderHover: 'rgba(16,185,129, 0.4)',
  input: '#e2e7ef',
  ring: '#10b981',
} as const;

export type ColorKey = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  weight: {
    normal: 400,
    bold: 700,
    black: 900,
  },
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  nav: 30,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export const design = {
  colors,
  spacing,
  radius,
  typography,
  zIndex,
} as const;

export type Design = typeof design;
