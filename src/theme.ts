import { Platform } from 'react-native';

/** Design system Thannis — clair (noir sur blanc), esprit Trade Republic */
export const colors = {
  bg: '#ffffff',
  bgElevated: '#f7f7f8',
  card: '#ffffff',
  card2: '#f7f7f8',
  cardBorder: 'rgba(0, 0, 0, 0.10)',
  line: 'rgba(0, 0, 0, 0.08)',
  text: '#0a0a0b',
  textMuted: '#6b6f76',
  textDim: '#9a9ea4',
  // Accent = noir. gold/goldLight = alias noir pour compat.
  accent: '#0a0a0b',
  accentMuted: 'rgba(0, 0, 0, 0.06)',
  gold: '#0a0a0b',
  goldLight: '#0a0a0b',
  green: '#00a878',
  greenMuted: 'rgba(0, 168, 120, 0.12)',
  red: '#e5342a',
  redMuted: 'rgba(229, 52, 42, 0.12)',
  white: '#FFFFFF',
};

export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
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
