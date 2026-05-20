/** Palette inspirée Hyperliquid — sobre, pro, sans effets « arcade » */
export const colors = {
  bg: '#0B0E11',
  bgElevated: '#111418',
  card: '#15191E',
  cardBorder: 'rgba(151, 163, 175, 0.12)',
  text: '#F0F4F8',
  textMuted: '#6B7A8C',
  textDim: '#4A5568',
  /** Vert Hyperliquid */
  accent: '#50D2C1',
  accentMuted: 'rgba(80, 210, 193, 0.12)',
  green: '#3DD68C',
  greenMuted: 'rgba(61, 214, 140, 0.1)',
  red: '#E5484D',
  redMuted: 'rgba(229, 72, 77, 0.1)',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
};

export const typography = {
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
};
