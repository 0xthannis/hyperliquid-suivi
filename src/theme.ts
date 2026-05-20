/** Design system A&T CAPITAL — aligné landing / terminal web */
export const colors = {
  bg: '#060608',
  bgElevated: '#0E0E12',
  card: '#141418',
  cardBorder: 'rgba(201, 169, 98, 0.14)',
  text: '#F5F0E6',
  textMuted: '#B8B4AC',
  textDim: '#7A7670',
  accent: '#C9A962',
  accentMuted: 'rgba(201, 169, 98, 0.12)',
  gold: '#C9A962',
  goldLight: '#E8D5A3',
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
