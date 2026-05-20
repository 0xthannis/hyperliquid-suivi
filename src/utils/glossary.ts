export type GlossaryKey =
  | 'pnlNonRealise'
  | 'mark'
  | 'entree'
  | 'notionnel'
  | 'distanceSl'
  | 'distanceTp'
  | 'riskReward'
  | 'stopLoss'
  | 'takeProfit'
  | 'valeurCompte';

export const GLOSSARY: Record<
  GlossaryKey,
  { short: string; description: string }
> = {
  pnlNonRealise: {
    short: 'PnL non réalisé',
    description:
      'Gain ou perte latent sur la position ouverte, au prix mark actuel.',
  },
  mark: {
    short: 'Mark',
    description: 'Prix de référence Hyperliquid pour le PnL et la marge.',
  },
  entree: {
    short: 'Entrée',
    description: 'Prix moyen d\'ouverture de la position.',
  },
  notionnel: {
    short: 'Notionnel',
    description:
      'Valeur nominale de la position (taille × prix), exposition au marché.',
  },
  distanceSl: {
    short: 'Distance SL',
    description:
      'Écart en % entre le mark et le stop loss. Plus bas = plus proche du stop.',
  },
  distanceTp: {
    short: 'Distance TP',
    description:
      'Écart en % entre le mark et le take profit.',
  },
  riskReward: {
    short: 'R:R',
    description: 'Ratio risque / récompense entre entrée, SL et TP.',
  },
  stopLoss: {
    short: 'Stop loss',
    description: 'Ordre limitant la perte au prix indiqué.',
  },
  takeProfit: {
    short: 'Take profit',
    description: 'Ordre de prise de profit au prix cible.',
  },
  valeurCompte: {
    short: 'Valeur du compte',
    description: 'Équité totale du wallet sur Hyperliquid.',
  },
};
