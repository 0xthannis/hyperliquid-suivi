import { Platform } from 'react-native';

/** Design system AT Trading — noir & blanc, esprit Trade Republic */
export const colors = {
  bg: '#000000',
  bgElevated: '#0a0a0a',
  card: '#0c0c0c',
  card2: '#161616',
  cardBorder: 'rgba(255, 255, 255, 0.10)',
  line: 'rgba(255, 255, 255, 0.08)',
  text: '#ffffff',
  textMuted: '#8a8d93',
  textDim: '#5a5d63',
  // Accent = blanc (aucune couleur de marque). gold/goldLight = alias blanc
  // pour que les composants existants suivent.
  accent: '#ffffff',
  accentMuted: 'rgba(255, 255, 255, 0.10)',
  gold: '#ffffff',
  goldLight: '#ffffff',
  green: '#16d195',
  greenMuted: 'rgba(22, 209, 149, 0.12)',
  red: '#ff4d4d',
  redMuted: 'rgba(255, 77, 77, 0.12)',
  white: '#FFFFFF',
};

/** Police mono pour les chiffres (feel terminal). */
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
