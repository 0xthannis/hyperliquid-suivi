/** Design system La Vie de César — monochrome, stoïque, premium */
export const colors = {
  bg: '#000000',
  bgElevated: '#0A0A0A',
  card: '#0E0E0E',
  cardBorder: 'rgba(255, 255, 255, 0.10)',
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
  accent: '#FFFFFF',
  accentMuted: 'rgba(255, 255, 255, 0.08)',
  gold: '#F4F4F5',
  goldLight: '#FFFFFF',
  green: '#4ADE80',
  greenMuted: 'rgba(74, 222, 128, 0.1)',
  red: '#F87171',
  redMuted: 'rgba(248, 113, 113, 0.1)',
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
  sm: 2,
  md: 4,
  lg: 6,
  pill: 999,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
};
