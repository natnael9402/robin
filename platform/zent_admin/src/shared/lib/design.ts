export const colors = {
  primary: '#ccff00',
  primaryHover: '#bbe000',
  primaryActive: '#99bf00',
  primaryForeground: '#0a0a0a',
  primaryMuted: 'rgba(204, 255, 0, 0.1)',

  surface: '#ffffff',
  surfaceHover: '#fafafa',
  surfaceElevated: '#ffffff',

  borderLight: '#e4e4e7',
  borderMedium: '#d4d4d8',
  borderDark: '#a1a1aa',

  destructive: '#ef4444',
  destructiveHover: '#dc2626',
  destructiveMuted: 'rgba(239, 68, 68, 0.1)',

  warning: '#f59e0b',
  warningHover: '#d97706',
  warningMuted: 'rgba(245, 158, 11, 0.1)',

  success: '#22c55e',
  successHover: '#16a34a',
  successMuted: 'rgba(34, 197, 94, 0.1)',

  info: '#3b82f6',
  infoHover: '#2563eb',
  infoMuted: 'rgba(59, 130, 246, 0.1)',

  mutedForeground: '#71717a',
  subtleForeground: '#a1a1aa',

  dark: {
    primary: '#ccff00',
    primaryHover: '#bbe000',
    primaryActive: '#99bf00',
    primaryForeground: '#0a0a0a',
    primaryMuted: 'rgba(204, 255, 0, 0.15)',

    surface: '#18181b',
    surfaceHover: '#27272a',
    surfaceElevated: '#1f1f23',

    borderLight: '#27272a',
    borderMedium: '#3f3f46',
    borderDark: '#52525b',

    destructive: '#ef4444',
    destructiveHover: '#f87171',
    destructiveMuted: 'rgba(239, 68, 68, 0.15)',

    warning: '#f59e0b',
    warningHover: '#fbbf24',
    warningMuted: 'rgba(245, 158, 11, 0.15)',

    success: '#22c55e',
    successHover: '#4ade80',
    successMuted: 'rgba(34, 197, 94, 0.15)',

    info: '#3b82f6',
    infoHover: '#60a5fa',
    infoMuted: 'rgba(59, 130, 246, 0.15)',

    mutedForeground: '#a1a1aa',
    subtleForeground: '#71717a',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
};

export const zIndex = {
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

export const design = {
  colors,
  spacing,
  radius,
  shadows,
  transitions,
  zIndex,
};

export type ColorScale = keyof typeof colors;
export type SpacingScale = keyof typeof spacing;
export type RadiusScale = keyof typeof radius;