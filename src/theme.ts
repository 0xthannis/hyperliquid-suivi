import { Platform } from 'react-native';

/** Design system Anthan — fintech premium, sombre & accent bleu (aligné web) */
export const colors = {
  bg: '#05060a',
  bgElevated: '#0a0c12',
  card: '#0e1119',
  card2: '#141826',
  cardBorder: 'rgba(255, 255, 255, 0.09)',
  line: 'rgba(255, 255, 255, 0.07)',
  text: '#f3f5f9',
  textMuted: '#9aa0b0',
  textDim: '#5e6474',
  // Accent bleu institutionnel (remplace l'or). Les alias gold/goldLight
  // pointent dessus pour que tous les composants existants suivent.
  accent: '#7c9cff',
  accentMuted: 'rgba(124, 156, 255, 0.14)',
  gold: '#7c9cff',
  goldLight: '#aeb9ff',
  green: '#34d39e',
  greenMuted: 'rgba(52, 211, 158, 0.12)',
  red: '#ff6b6b',
  redMuted: 'rgba(255, 107, 107, 0.12)',
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
