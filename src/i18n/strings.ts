import type { Lang } from '../i18n';
import type { WatchBias } from '../hooks/useWatchlist';

export type Copy = {
  live: string;
  sync: string;
  tabs: { positions: string; history: string; track: string; about: string };
  live_: {
    accountValue: string;
    periods: Record<'day' | 'week' | 'month' | 'allTime', string>;
    pnlOpen: string;
    pnlTotal: string;
    winRate: string;
    exposure: string;
    maxDrawdown: string;
    positions: string;
    emptyTitle: string;
    emptyText: string;
    seeHistory: string;
    long: string;
    short: string;
    entry: string;
    pnlCard: string;
    alertsTitle: string;
    alertsText: string;
    alertsEnabling: string;
    alertsBtn: string;
    alertsOk: string;
    alertsKo: string;
  };
  watch: { title: string; bias: (b: WatchBias) => string };
  track: {
    label: string;
    sub: (count: number, win: number) => string;
    profitFactor: string;
    avgWin: string;
    avgLoss: string;
    drawdown: string;
    monthly: string;
    best: string;
    worst: string;
    disclaimer: string;
    emptyTitle: string;
    emptyText: string;
  };
  hist: {
    pnlClosed: string;
    winRate: string;
    daySuffix: string;
    opsHint: (closed: number, win: number, loss: number) => string;
    emptyTitle: string;
    emptyText: (days: number) => string;
  };
  about: {
    lead: string;
    thanhRole: string;
    thanhText: string;
    annissaRole: string;
    annissaText: string;
    convictionTitle: string;
    convictionText: string;
    notifTitle: string;
    notifText: (url: string) => string;
    alertsServerBtn: string;
    registering: string;
    linksTitle: string;
    downloadApk: string;
    opening: string;
    hint: (terminal: string) => string;
    replayTour: string;
  };
  card: {
    title: string;
    subtitle: string;
    downloadShare: string;
    close: string;
    error: string;
  };
};

const FR: Copy = {
  live: 'En direct',
  sync: 'Synchro',
  tabs: { positions: 'Positions', history: 'Historique', track: 'Track', about: 'À propos' },
  live_: {
    accountValue: 'Valeur du compte',
    periods: { day: '1J', week: '1S', month: '1M', allTime: 'MAX' },
    pnlOpen: 'PnL ouvert',
    pnlTotal: 'PnL total',
    winRate: 'Réussite',
    exposure: 'Exposition',
    maxDrawdown: 'Drawdown max',
    positions: 'Positions',
    emptyTitle: 'Aucune position ouverte',
    emptyText: "Dès qu'une position s'ouvre, elle apparaît ici en temps réel.",
    seeHistory: "Voir l'historique",
    long: 'Long',
    short: 'Short',
    entry: 'entrée',
    pnlCard: 'Carte PnL ↗',
    alertsTitle: 'Activez les alertes',
    alertsText: "Recevez chaque signal, ouverture, SL/TP et clôture, en temps réel, dès qu'une position bouge.",
    alertsEnabling: 'Activation',
    alertsBtn: 'Activer les alertes',
    alertsOk: 'Alertes activées. Vous serez prévenu à chaque mouvement.',
    alertsKo: 'Autorisez les notifications dans les réglages du téléphone.',
  },
  watch: {
    title: "Ce qu'on surveille",
    bias: (b) => (b === 'long' ? 'Biais long' : b === 'short' ? 'Biais short' : 'Sous surveillance'),
  },
  track: {
    label: 'Performance cumulée · net',
    sub: (count, win) => `${count} trades clôturés · ${win}% de réussite`,
    profitFactor: 'Profit factor',
    avgWin: 'Gain moyen',
    avgLoss: 'Perte moyenne',
    drawdown: 'Drawdown max',
    monthly: 'Résultat mensuel',
    best: 'Meilleur trade',
    worst: 'Pire trade',
    disclaimer: "Les performances passées ne préjugent pas des performances futures. Ceci n'est pas un conseil en investissement.",
    emptyTitle: "Aucun trade clôturé pour l'instant",
    emptyText: 'Le track record se construit à chaque position fermée, public et vérifiable.',
  },
  hist: {
    pnlClosed: 'PnL fermé',
    winRate: 'Réussite',
    daySuffix: 'j',
    opsHint: (closed, win, loss) => `${closed} op. · ${win}G/${loss}P`,
    emptyTitle: 'Aucune opération',
    emptyText: (days) => `Aucun trade sur ${days} jours. Essayez 30j ou attendez une nouvelle clôture.`,
  },
  about: {
    lead: 'Société de trading spécialisée dans les actions et les matières premières, fondée par un couple, Annissa et Thanh. Chaque position est publique et en temps réel, à suivre comme un signal.',
    thanhRole: 'Exécution',
    thanhText: 'Il prend et gère les positions affichées. Données lues directement on-chain depuis Hyperliquid, sans aucune retouche.',
    annissaRole: 'Direction',
    annissaText: 'Elle pilote THANNIS avec Thanh et porte notre engagement de transparence totale.',
    convictionTitle: 'Notre conviction',
    convictionText: 'Nous montrons tout : entrées, stops, objectifs, pertes comme profits. En direct et vérifiable on-chain. La transparence est notre standard.',
    notifTitle: 'Notifications (app fermée)',
    notifText: (url) => `Les alertes passent par ${url}. Appuyez ci-dessous pour enregistrer ce téléphone sur le serveur.`,
    alertsServerBtn: 'Activer les alertes serveur',
    registering: 'Enregistrement…',
    linksTitle: 'Liens',
    downloadApk: 'Télécharger la dernière APK',
    opening: 'Ouverture…',
    hint: (terminal) => `Partagez ce lien pour installer l'app Android (${terminal}).`,
    replayTour: 'Revoir le guide de démarrage',
  },
  card: {
    title: 'Carte PnL',
    subtitle: 'Image brandée THANNIS · sans lien · prête pour les réseaux',
    downloadShare: 'Télécharger / Partager',
    close: 'Fermer',
    error: 'Impossible de générer la carte.',
  },
};

const EN: Copy = {
  live: 'Live',
  sync: 'Syncing',
  tabs: { positions: 'Positions', history: 'History', track: 'Track', about: 'About' },
  live_: {
    accountValue: 'Account value',
    periods: { day: '1D', week: '1W', month: '1M', allTime: 'MAX' },
    pnlOpen: 'Open PnL',
    pnlTotal: 'Total PnL',
    winRate: 'Win rate',
    exposure: 'Exposure',
    maxDrawdown: 'Max drawdown',
    positions: 'Positions',
    emptyTitle: 'No open position',
    emptyText: 'As soon as a position opens, it shows here in real time.',
    seeHistory: 'See history',
    long: 'Long',
    short: 'Short',
    entry: 'entry',
    pnlCard: 'PnL card ↗',
    alertsTitle: 'Turn on alerts',
    alertsText: 'Get every signal, opens, SL/TP and closes, in real time, the moment a position moves.',
    alertsEnabling: 'Enabling',
    alertsBtn: 'Turn on alerts',
    alertsOk: 'Alerts on. You will be notified on every move.',
    alertsKo: 'Allow notifications in your phone settings.',
  },
  watch: {
    title: "What we're watching",
    bias: (b) => (b === 'long' ? 'Long bias' : b === 'short' ? 'Short bias' : 'Watching'),
  },
  track: {
    label: 'Cumulative performance · net',
    sub: (count, win) => `${count} closed trades · ${win}% win rate`,
    profitFactor: 'Profit factor',
    avgWin: 'Avg win',
    avgLoss: 'Avg loss',
    drawdown: 'Max drawdown',
    monthly: 'Monthly result',
    best: 'Best trade',
    worst: 'Worst trade',
    disclaimer: 'Past performance does not guarantee future results. This is not investment advice.',
    emptyTitle: 'No closed trade yet',
    emptyText: 'The track record builds with every closed position, public and verifiable.',
  },
  hist: {
    pnlClosed: 'Closed PnL',
    winRate: 'Win rate',
    daySuffix: 'd',
    opsHint: (closed, win, loss) => `${closed} ops · ${win}W/${loss}L`,
    emptyTitle: 'No operation',
    emptyText: (days) => `No trade over ${days} days. Try 30d or wait for a new close.`,
  },
  about: {
    lead: 'A trading firm specialised in equities and commodities, founded by a couple, Annissa and Thanh. Every position is public and in real time, to follow as a signal.',
    thanhRole: 'Execution',
    thanhText: 'He takes and manages the positions shown. Data read straight from his Hyperliquid wallet, on-chain, with no edits.',
    annissaRole: 'Direction',
    annissaText: 'She runs THANNIS with Thanh and carries our commitment to total transparency.',
    convictionTitle: 'Our conviction',
    convictionText: 'We show everything: entries, stops, targets, losses and profits. Live and verifiable on-chain. Transparency is our standard.',
    notifTitle: 'Notifications (app closed)',
    notifText: (url) => `Alerts go through ${url}. Tap below to register this phone with the server.`,
    alertsServerBtn: 'Enable server alerts',
    registering: 'Registering…',
    linksTitle: 'Links',
    downloadApk: 'Download the latest APK',
    opening: 'Opening…',
    hint: (terminal) => `Share this link to install the Android app (${terminal}).`,
    replayTour: 'Replay the getting-started guide',
  },
  card: {
    title: 'PnL card',
    subtitle: 'THANNIS-branded image · no link · ready for social',
    downloadShare: 'Download / Share',
    close: 'Close',
    error: 'Could not generate the card.',
  },
};

export function getCopy(lang: Lang): Copy {
  return lang === 'fr' ? FR : EN;
}
