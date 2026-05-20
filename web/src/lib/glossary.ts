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
  | 'valeurCompte'
  | 'pnlOuvert'
  | 'pnlAllTime'
  | 'tauxReussite'
  | 'operationsFermees'
  | 'long'
  | 'short'
  | 'levier'
  | 'progressionTp';

export const GLOSSARY: Record<
  GlossaryKey,
  { short: string; description: string }
> = {
  pnlNonRealise: {
    short: 'PnL non réalisé',
    description:
      'Gain ou perte latent sur la position ouverte, calculé au prix mark actuel. Non encaissé tant que la position n\'est pas fermée.',
  },
  mark: {
    short: 'Mark',
    description:
      'Prix de référence Hyperliquid pour le PnL et la marge. Peut différer légèrement du dernier prix exécuté.',
  },
  entree: {
    short: 'Entrée',
    description: 'Prix moyen auquel la position a été ouverte sur ce marché.',
  },
  notionnel: {
    short: 'Notionnel',
    description:
      'Valeur nominale de la position (taille × prix). Indique l\'exposition au marché, pas le capital misé après levier.',
  },
  distanceSl: {
    short: 'Distance SL',
    description:
      'Écart en % entre le prix mark actuel et le stop loss. Plus le % est bas, plus le prix est proche du stop.',
  },
  distanceTp: {
    short: 'Distance TP',
    description:
      'Écart en % entre le prix mark actuel et le take profit. Indique la marge restante avant le niveau de prise de profit.',
  },
  riskReward: {
    short: 'R:R',
    description:
      'Ratio risque / récompense entre l\'entrée, le stop loss et le take profit (ex. 1:2 = gain cible deux fois la perte max).',
  },
  stopLoss: {
    short: 'Stop loss',
    description:
      'Ordre de sortie qui limite la perte si le marché évolue défavorablement. Déclenché au prix indiqué.',
  },
  takeProfit: {
    short: 'Take profit',
    description:
      'Ordre de sortie qui réalise le gain au prix cible si le marché évolue favorablement.',
  },
  valeurCompte: {
    short: 'Valeur du compte',
    description:
      'Équité totale du wallet sur Hyperliquid (positions, marge et soldes inclus).',
  },
  pnlOuvert: {
    short: 'PnL ouvert',
    description: 'Somme des PnL non réalisés sur toutes les positions encore ouvertes.',
  },
  pnlAllTime: {
    short: 'PnL All Time',
    description:
      'PnL cumulé enregistré par Hyperliquid sur ce wallet, selon l\'historique disponible sur la plateforme.',
  },
  tauxReussite: {
    short: 'Taux de réussite',
    description:
      'Part des opérations fermées avec PnL net positif, sur la période affichée dans le journal.',
  },
  operationsFermees: {
    short: 'Opérations fermées',
    description:
      'Nombre de clôtures (totales ou partielles) enregistrées dans l\'historique Hyperliquid affiché.',
  },
  long: {
    short: 'LONG',
    description: 'Position acheteuse : vous gagnez si le prix monte.',
  },
  short: {
    short: 'SHORT',
    description: 'Position vendeuse : vous gagnez si le prix baisse.',
  },
  levier: {
    short: 'Levier',
    description:
      'Multiplicateur d\'exposition par rapport à la marge déposée. Un levier ×10 amplifie gains et pertes.',
  },
  progressionTp: {
    short: 'Progression vers le TP',
    description:
      'Avancement du prix entre l\'entrée et le take profit. 0 % à l\'entrée, 100 % au TP. La barre rouge signale la proximité du stop.',
  },
};
