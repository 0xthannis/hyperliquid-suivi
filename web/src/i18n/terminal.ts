import type { Lang } from '../i18n';
import type { WatchBias } from '../hooks/useWatchlist';

export type TerminalCopy = {
  live: string;
  sync: string;
  tabs: { positions: string; watchlist: string; history: string; track: string };
  foot: { legal: string; approach: string; verified: string; about: string };
  periods: Record<'day' | 'week' | 'month' | 'allTime', string>;
  accountValue: string;
  onThePeriod: string;
  pnlOpen: string;
  pnlTotal: string;
  winRate: string;
  exposure: string;
  maxDrawdown: string;
  positions: string;
  emptyTitle: string;
  emptyText: string;
  emptyAlertsPre: string;
  emptyAlertsPost: string;
  homePage: string;
  long: string;
  short: string;
  entry: string;
  pnlCard: string;
  verifiedOnchain: string;
  alertsTitle: string;
  alertsText: string;
  alertsEnabling: string;
  alertsBlocked: string;
  alertsBtn: string;
  // Watchlist
  wlTitle: string;
  wlSub: string;
  wlUpdated: (d: string) => string;
  wlEmptyTitle: string;
  wlEmptyText: string;
  bias: (b: WatchBias) => string;
  // Onboarding
  onbTitle: string;
  onbSteps: string[];
  // Track record
  trkLabel: string;
  trkSub: (count: number, win: number) => string;
  trkProfitFactor: string;
  trkAvgWin: string;
  trkAvgLoss: string;
  trkDrawdown: string;
  trkMonthly: string;
  trkBest: string;
  trkWorst: string;
  trkDisclaimer: string;
  trkEmptyTitle: string;
  trkEmptyText: string;
  // History
  histWeekly: string;
  histMetricPnl: string;
  histMetricWin: string;
  histMetricClosed: string;
  histWinShort: string;
  histLossShort: string;
  histJournal: string;
  histExport: string;
  histSearch: string;
  histAllAssets: string;
  histAllPeriod: string;
  histLast7: string;
  histLast30: string;
  histEmptyTitle: string;
  histEmptyText: string;
  histNoResultTitle: string;
  histNoResultText: string;
  histThDate: string;
  histThAsset: string;
  histThOp: string;
  histThPnl: string;
};

const FR: TerminalCopy = {
  live: 'En direct',
  sync: 'Synchro',
  tabs: { positions: 'Positions', watchlist: 'Watchlist', history: 'Historique', track: 'Track record' },
  foot: { legal: 'Données Hyperliquid · pas un conseil en investissement', approach: 'Notre approche', verified: 'Vérifié', about: 'À propos' },
  periods: { day: '1J', week: '1S', month: '1M', allTime: 'MAX' },
  accountValue: 'Valeur du compte',
  onThePeriod: 'sur la période',
  pnlOpen: 'PnL ouvert',
  pnlTotal: 'PnL total',
  winRate: 'Réussite',
  exposure: 'Exposition',
  maxDrawdown: 'Drawdown max',
  positions: 'Positions',
  emptyTitle: 'Aucune position ouverte',
  emptyText: "Dès qu'une position s'ouvre, elle apparaît ici en temps réel.",
  emptyAlertsPre: 'Activez les alertes depuis la ',
  emptyAlertsPost: '.',
  homePage: "page d'accueil",
  long: 'Long',
  short: 'Short',
  entry: 'entrée',
  pnlCard: 'Carte PnL ↗',
  verifiedOnchain: 'Vérifié on-chain ↗',
  alertsTitle: 'Activez les alertes',
  alertsText: "Recevez chaque signal, ouverture, SL/TP, clôture, en temps réel, dès qu'une position bouge.",
  alertsEnabling: 'Activation',
  alertsBlocked: 'Bloquées',
  alertsBtn: 'Activer les alertes',
  wlTitle: "Ce qu'on surveille",
  wlSub: "Les marchés que nous guettons avant d'ouvrir une position. Ce ne sont pas encore des positions, juste notre radar.",
  wlUpdated: (d) => `Mis à jour le ${d}`,
  wlEmptyTitle: "Rien sur le radar pour l'instant",
  wlEmptyText: 'Les marchés surveillés apparaîtront ici.',
  bias: (b) => (b === 'long' ? 'Biais long' : b === 'short' ? 'Biais short' : 'Sous surveillance'),
  onbTitle: 'Comment lire ce terminal',
  onbSteps: [
    'Chaque position affichée est réelle et publique, lue directement on-chain.',
    'Sens, levier, entrée, stop et objectif sont visibles. Suivez-les comme des signaux.',
    'Activez les alertes pour être prévenu à chaque ouverture, ajustement et clôture.',
  ],
  trkLabel: 'Performance cumulée · net',
  trkSub: (count, win) => `${count} trades clôturés · ${win}% de réussite`,
  trkProfitFactor: 'Profit factor',
  trkAvgWin: 'Gain moyen',
  trkAvgLoss: 'Perte moyenne',
  trkDrawdown: 'Drawdown max',
  trkMonthly: 'Résultat mensuel',
  trkBest: 'Meilleur trade',
  trkWorst: 'Pire trade',
  trkDisclaimer: "Les performances passées ne préjugent pas des performances futures. Ceci n'est pas un conseil en investissement.",
  trkEmptyTitle: "Aucun trade clôturé pour l'instant",
  trkEmptyText: 'Le track record se construit à chaque position fermée, public et vérifiable.',
  histWeekly: 'Résumé des 7 derniers jours',
  histMetricPnl: 'PnL All Time',
  histMetricWin: 'Taux de réussite',
  histMetricClosed: 'Opérations fermées',
  histWinShort: 'G',
  histLossShort: 'P',
  histJournal: 'Journal des opérations',
  histExport: 'Export CSV',
  histSearch: 'Rechercher actif ou opération…',
  histAllAssets: 'Tous les actifs',
  histAllPeriod: 'Toute la période',
  histLast7: '7 derniers jours',
  histLast30: '30 derniers jours',
  histEmptyTitle: 'Historique vide',
  histEmptyText: "Les opérations enregistrées par Hyperliquid s'afficheront ici dès qu'une activité sera disponible sur le wallet suivi.",
  histNoResultTitle: 'Aucun résultat',
  histNoResultText: "Modifiez les filtres ou la recherche pour afficher d'autres opérations.",
  histThDate: 'Date',
  histThAsset: 'Actif',
  histThOp: 'Opération',
  histThPnl: 'PnL net',
};

const EN: TerminalCopy = {
  live: 'Live',
  sync: 'Syncing',
  tabs: { positions: 'Positions', watchlist: 'Watchlist', history: 'History', track: 'Track record' },
  foot: { legal: 'Hyperliquid data · not investment advice', approach: 'Our approach', verified: 'Verified', about: 'About' },
  periods: { day: '1D', week: '1W', month: '1M', allTime: 'MAX' },
  accountValue: 'Account value',
  onThePeriod: 'over the period',
  pnlOpen: 'Open PnL',
  pnlTotal: 'Total PnL',
  winRate: 'Win rate',
  exposure: 'Exposure',
  maxDrawdown: 'Max drawdown',
  positions: 'Positions',
  emptyTitle: 'No open position',
  emptyText: 'As soon as a position opens, it shows here in real time.',
  emptyAlertsPre: 'Turn on alerts from the ',
  emptyAlertsPost: '.',
  homePage: 'home page',
  long: 'Long',
  short: 'Short',
  entry: 'entry',
  pnlCard: 'PnL card ↗',
  verifiedOnchain: 'Verified on-chain ↗',
  alertsTitle: 'Turn on alerts',
  alertsText: 'Get every signal, opens, SL/TP, closes, in real time, the moment a position moves.',
  alertsEnabling: 'Enabling',
  alertsBlocked: 'Blocked',
  alertsBtn: 'Turn on alerts',
  wlTitle: "What we're watching",
  wlSub: 'The markets we watch before opening a position. Not positions yet, just our radar.',
  wlUpdated: (d) => `Updated ${d}`,
  wlEmptyTitle: 'Nothing on the radar yet',
  wlEmptyText: 'Watched markets will show here.',
  bias: (b) => (b === 'long' ? 'Long bias' : b === 'short' ? 'Short bias' : 'Watching'),
  onbTitle: 'How to read this terminal',
  onbSteps: [
    'Every position shown is real and public, read straight from the chain.',
    'Side, leverage, entry, stop and target are visible. Follow them as signals.',
    'Turn on alerts to get notified on every open, adjustment and close.',
  ],
  trkLabel: 'Cumulative performance · net',
  trkSub: (count, win) => `${count} closed trades · ${win}% win rate`,
  trkProfitFactor: 'Profit factor',
  trkAvgWin: 'Avg win',
  trkAvgLoss: 'Avg loss',
  trkDrawdown: 'Max drawdown',
  trkMonthly: 'Monthly result',
  trkBest: 'Best trade',
  trkWorst: 'Worst trade',
  trkDisclaimer: 'Past performance does not guarantee future results. This is not investment advice.',
  trkEmptyTitle: 'No closed trade yet',
  trkEmptyText: 'The track record builds with every closed position, public and verifiable.',
  histWeekly: 'Last 7 days summary',
  histMetricPnl: 'All-time PnL',
  histMetricWin: 'Win rate',
  histMetricClosed: 'Closed trades',
  histWinShort: 'W',
  histLossShort: 'L',
  histJournal: 'Operations journal',
  histExport: 'Export CSV',
  histSearch: 'Search asset or operation…',
  histAllAssets: 'All assets',
  histAllPeriod: 'All time',
  histLast7: 'Last 7 days',
  histLast30: 'Last 30 days',
  histEmptyTitle: 'Empty history',
  histEmptyText: 'Operations recorded by Hyperliquid will show here as soon as there is activity on the tracked wallet.',
  histNoResultTitle: 'No result',
  histNoResultText: 'Change the filters or the search to show other operations.',
  histThDate: 'Date',
  histThAsset: 'Asset',
  histThOp: 'Operation',
  histThPnl: 'Net PnL',
};

export function getTerminalCopy(lang: Lang): TerminalCopy {
  return lang === 'fr' ? FR : EN;
}
