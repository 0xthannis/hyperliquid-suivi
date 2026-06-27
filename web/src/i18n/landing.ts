import type { Lang } from '../i18n';

export type Step = { k: string; title: string; text: string };
export type Benefit = { title: string; text: string };
export type Market = { tag: string; title: string; sub: string; text: string };
export type Faq = { q: string; a: string };

export type LandingCopy = {
  nav: { how: string; founders: string; track: string; open: string };
  hero: {
    pill: string;
    titleLine1: string;
    titlePre: string;
    titleAccent: string;
    titlePost: string;
    lead: string;
    open: string;
    verify: string;
  };
  term: { accountLabel: string; deltaSuffix: string; pnlAllTime: string; win: string; positions: string };
  activity: {
    loading: string;
    error: string;
    none: string;
    open: (n: number, coins: string) => string;
    last: (what: string, when: string) => string;
  };
  stats: { verifiable: string; win: string; closed: string; free: string };
  how: { kicker: string; h2: string; lead: string; steps: Step[] };
  benefits: { kicker: string; h2: string; items: Benefit[] };
  markets: { kicker: string; h2: string; items: Market[]; note: string };
  track: {
    kicker: string;
    h2: string;
    lead: string;
    pnl: string;
    win: string;
    closed: string;
    cta: string;
  };
  founders: {
    kicker: string;
    h2: string;
    lead: string;
    thanhRole: string;
    thanhText: string;
    annissaRole: string;
    annissaText: string;
  };
  profit: {
    kicker: string;
    h2: string;
    steps: Step[];
    ctaTerminal: string;
    alertsOn: string;
    alertsEnabling: string;
    alertsGet: string;
  };
  appband: { title: string; text: string; btn: string };
  faq: { kicker: string; h2: string; items: Faq[] };
  footer: {
    desc: string;
    legal: string;
    home: string;
    approach: string;
    verified: string;
    wallet: string;
  };
};

const FR: LandingCopy = {
  nav: { how: 'Comment ça marche', founders: 'Les fondateurs', track: 'Track record', open: 'Ouvrir le terminal' },
  hero: {
    pill: 'Société de trading. Actions et matières premières.',
    titleLine1: 'Voyez ce que nous tradons.',
    titlePre: 'En ',
    titleAccent: 'temps réel',
    titlePost: '.',
    lead: "THANNIS publie chaque position au moment où elle est prise, avec son entrée, son stop et son objectif. Suivez nos signaux librement, activez les alertes, profitez avec nous. Ce n'est pas un conseil financier.",
    open: 'Ouvrir le terminal',
    verify: 'Vérifier on-chain',
  },
  term: { accountLabel: 'Valeur du compte', deltaSuffix: 'perf cumulée', pnlAllTime: 'PnL all-time', win: 'Réussite', positions: 'Positions' },
  activity: {
    loading: "Chargement de l'activité",
    error: 'Activité indisponible pour le moment',
    none: 'Aucune position ouverte pour le moment',
    open: (n, coins) => `${n} position${n > 1 ? 's' : ''} ouverte${n > 1 ? 's' : ''} (${coins})`,
    last: (what, when) => `Dernière opération ${what} · ${when}`,
  },
  stats: { verifiable: 'Vérifiable on-chain', win: 'Taux de réussite', closed: 'Trades clôturés', free: 'Accès libre' },
  how: {
    kicker: 'Comment ça marche',
    h2: "Trois étapes. Aucune zone d'ombre.",
    lead: "Vous n'avez pas besoin de nous connaître pour commencer. Vous regardez, vous comprenez, vous suivez. Tout est lisible dès la première minute.",
    steps: [
      { k: '01', title: 'Nous tradons', text: 'Actions et matières premières, prises en conviction, avec un risque borné sur chaque position.' },
      { k: '02', title: "Tout s'affiche en direct", text: 'Sens, levier, entrée, stop, objectif et P&L. Lu directement on-chain, sans la moindre retouche.' },
      { k: '03', title: 'Vous suivez', text: 'Une notification à chaque mouvement. Vous décidez de copier ou non. Vous gardez le contrôle.' },
    ],
  },
  benefits: {
    kicker: 'Ce que vous y gagnez',
    h2: 'Un avantage simple. La vérité.',
    items: [
      { title: 'Transparence totale', text: 'Chaque position visible, les gains comme les pertes. Aucun trade caché, aucun récit arrangé.' },
      { title: 'Des signaux gratuits', text: 'Suivez nos trades en temps réel, sans inscription et sans abonnement.' },
      { title: 'Vérifiable on-chain', text: 'Recoupez chaque chiffre vous-même sur la blockchain Hyperliquid. La preuve, pas la promesse.' },
      { title: 'Alertes en temps réel', text: "Soyez prévenu à l'ouverture, à l'ajustement du stop ou de l'objectif, et à la clôture." },
    ],
  },
  markets: {
    kicker: "Univers d'investissement",
    h2: "Deux classes d'actifs réels.",
    items: [
      { tag: '01', title: 'Matières premières', sub: 'Métaux · énergie · agricoles', text: "Or, argent, cuivre, aluminium, Brent, WTI, gaz naturel, céréales. Les actifs qui font tourner l'économie réelle." },
      { tag: '02', title: "Actions d'entreprises", sub: 'Large caps mondiales', text: 'Les leaders cotés en technologie, industrie et consommation. La qualité et le momentum des entreprises qui pèsent.' },
    ],
    note: "Pas de crypto à l'avant. Pas de tokens à la mode. Des actifs que l'on comprend.",
  },
  track: {
    kicker: 'Track record',
    h2: 'La performance, à découvert.',
    lead: "Voici nos chiffres en direct, calculés sur l'activité réelle du wallet. Rien n'est sélectionné, rien n'est lissé.",
    pnl: 'PnL cumulé net',
    win: 'Taux de réussite',
    closed: 'Trades clôturés',
    cta: 'Voir le track record complet',
  },
  founders: {
    kicker: 'Les fondateurs',
    h2: 'Thanh et Annissa.',
    lead: "Deux fondateurs, une conviction. Rendre le trading vérifiable. Un capital propre, engagé sur les marchés réels, avec l'exigence de tout rendre public.",
    thanhRole: 'Trading et exécution',
    thanhText: 'Il prend et gère chaque position affichée. Tout vient de son wallet Hyperliquid, lisible on-chain, sans aucune retouche.',
    annissaRole: 'Co-fondatrice',
    annissaText: 'Elle bâtit THANNIS avec Thanh. La même exigence, rendre chaque trade public et vérifiable, sans compromis.',
  },
  profit: {
    kicker: 'Comment en profiter',
    h2: 'Suivez. Décidez. Gardez le contrôle.',
    steps: [
      { k: '01', title: 'Ouvrez le terminal', text: 'Aucun compte, aucun frais. Vous voyez immédiatement nos positions en cours.' },
      { k: '02', title: 'Activez les alertes', text: 'Vous êtes prévenu à chaque ouverture, ajustement et clôture, au moment où cela se passe.' },
      { k: '03', title: 'Suivez nos signaux', text: 'À votre rythme, selon votre propre jugement. Vous restez seul maître de votre capital.' },
    ],
    ctaTerminal: 'Entrer dans le terminal',
    alertsOn: 'Alertes activées',
    alertsEnabling: 'Activation',
    alertsGet: 'Recevoir les alertes',
  },
  appband: {
    title: "L'app THANNIS sur Android",
    text: 'Les positions et les alertes dans votre poche. Téléchargement direct, un clic.',
    btn: "Télécharger l'app",
  },
  faq: {
    kicker: 'Questions fréquentes',
    h2: "Avant d'entrer.",
    items: [
      { q: 'Que tradez-vous exactement ?', a: "Uniquement des matières premières (métaux, énergie, agricoles) et des actions d'entreprises cotées. Des actifs réels, opérés en conviction." },
      { q: "Comment vérifier que c'est réel ?", a: 'Tout est exécuté sur un wallet public, lisible on-chain. Le terminal affiche exactement ce que la plateforme enregistre. Vous recoupez chaque chiffre.' },
      { q: "C'est vraiment gratuit ?", a: 'Oui. Le site et le terminal sont en accès libre, sans inscription. Aucun signal vendu, aucun capital géré pour des tiers.' },
      { q: 'Puis-je suivre vos trades comme des signaux ?', a: "Oui. Chaque position s'affiche en temps réel avec entrée, stop, objectif et levier, et vous pouvez activer les notifications. Vous décidez de copier ou non. THANNIS ne gère pas votre argent et ne donne aucun conseil financier." },
    ],
  },
  footer: {
    desc: 'Commodities & Equities · Thanh & Annissa',
    legal: 'Données on-chain uniquement. Accès libre. Aucune sollicitation, aucune promesse de performance, pas un conseil en investissement.',
    home: 'La maison',
    approach: 'Notre approche',
    verified: 'Vérifié',
    wallet: 'Wallet',
  },
};

const EN: LandingCopy = {
  nav: { how: 'How it works', founders: 'Founders', track: 'Track record', open: 'Open the terminal' },
  hero: {
    pill: 'Trading firm. Equities and commodities.',
    titleLine1: 'See what we trade.',
    titlePre: 'In ',
    titleAccent: 'real time',
    titlePost: '.',
    lead: 'THANNIS publishes every position the moment it is taken, with its entry, stop and target. Follow our signals freely, turn on alerts, profit with us. This is not financial advice.',
    open: 'Open the terminal',
    verify: 'Verify on-chain',
  },
  term: { accountLabel: 'Account value', deltaSuffix: 'cumulative perf', pnlAllTime: 'PnL all-time', win: 'Win rate', positions: 'Positions' },
  activity: {
    loading: 'Loading activity',
    error: 'Activity unavailable right now',
    none: 'No open position right now',
    open: (n, coins) => `${n} open position${n > 1 ? 's' : ''} (${coins})`,
    last: (what, when) => `Last operation ${what} · ${when}`,
  },
  stats: { verifiable: 'Verifiable on-chain', win: 'Win rate', closed: 'Closed trades', free: 'Free access' },
  how: {
    kicker: 'How it works',
    h2: 'Three steps. Nothing in the dark.',
    lead: 'You do not need to know us to start. You watch, you understand, you follow. Everything is readable from the first minute.',
    steps: [
      { k: '01', title: 'We trade', text: 'Equities and commodities, taken with conviction, with bounded risk on every position.' },
      { k: '02', title: 'Everything shows live', text: 'Side, leverage, entry, stop, target and P&L. Read straight from the chain, with no edits.' },
      { k: '03', title: 'You follow', text: 'A notification on every move. You decide whether to copy. You stay in control.' },
    ],
  },
  benefits: {
    kicker: 'What you gain',
    h2: 'One simple edge. The truth.',
    items: [
      { title: 'Total transparency', text: 'Every position visible, the gains and the losses. No hidden trade, no curated story.' },
      { title: 'Free signals', text: 'Follow our trades in real time, with no sign-up and no subscription.' },
      { title: 'Verifiable on-chain', text: 'Recheck every number yourself on the Hyperliquid blockchain. Proof, not promises.' },
      { title: 'Real-time alerts', text: 'Get notified on every open, stop or target adjustment, and close.' },
    ],
  },
  markets: {
    kicker: 'Investment universe',
    h2: 'Two real asset classes.',
    items: [
      { tag: '01', title: 'Commodities', sub: 'Metals · energy · agricultural', text: 'Gold, silver, copper, aluminium, Brent, WTI, natural gas, grains. The assets that drive the real economy.' },
      { tag: '02', title: 'Company equities', sub: 'Global large caps', text: 'The listed leaders in tech, industry and consumer. The quality and momentum of companies that matter.' },
    ],
    note: 'No crypto up front. No trendy tokens. Assets we understand.',
  },
  track: {
    kicker: 'Track record',
    h2: 'Performance, in the open.',
    lead: "Here are our live numbers, computed on the wallet's real activity. Nothing is cherry-picked, nothing is smoothed.",
    pnl: 'Cumulative net P&L',
    win: 'Win rate',
    closed: 'Closed trades',
    cta: 'See the full track record',
  },
  founders: {
    kicker: 'Founders',
    h2: 'Thanh and Annissa.',
    lead: 'Two founders, one conviction. Make trading verifiable. Our own capital, committed to real markets, with the discipline to make everything public.',
    thanhRole: 'Trading and execution',
    thanhText: 'He takes and manages every position shown. Everything comes from his Hyperliquid wallet, readable on-chain, with no edits.',
    annissaRole: 'Co-founder',
    annissaText: 'She builds THANNIS with Thanh. The same standard, making every trade public and verifiable, with no compromise.',
  },
  profit: {
    kicker: 'How to profit',
    h2: 'Follow. Decide. Stay in control.',
    steps: [
      { k: '01', title: 'Open the terminal', text: 'No account, no fees. You immediately see our open positions.' },
      { k: '02', title: 'Turn on alerts', text: 'Get notified on every open, adjustment and close, as it happens.' },
      { k: '03', title: 'Follow our signals', text: 'At your own pace, on your own judgment. You remain the sole owner of your capital.' },
    ],
    ctaTerminal: 'Enter the terminal',
    alertsOn: 'Alerts on',
    alertsEnabling: 'Enabling',
    alertsGet: 'Get alerts',
  },
  appband: {
    title: 'The THANNIS app on Android',
    text: 'Positions and alerts in your pocket. Direct download, one click.',
    btn: 'Download the app',
  },
  faq: {
    kicker: 'Frequently asked',
    h2: 'Before you step in.',
    items: [
      { q: 'What exactly do you trade?', a: 'Only commodities (metals, energy, agricultural) and listed company equities. Real assets, traded with conviction.' },
      { q: "How can I check it's real?", a: 'Everything is executed on a public wallet, readable on-chain. The terminal shows exactly what the platform records. You recheck every number.' },
      { q: 'Is it really free?', a: 'Yes. The site and the terminal are free, with no sign-up. No signal sold, no capital managed for third parties.' },
      { q: 'Can I follow your trades as signals?', a: 'Yes. Every position shows in real time with entry, stop, target and leverage, and you can turn on notifications. You decide whether to copy. THANNIS does not manage your money and gives no financial advice.' },
    ],
  },
  footer: {
    desc: 'Commodities & Equities · Thanh & Annissa',
    legal: 'On-chain data only. Free access. No solicitation, no performance promise, not investment advice.',
    home: 'The firm',
    approach: 'Our approach',
    verified: 'Verified',
    wallet: 'Wallet',
  },
};

export function getLandingCopy(lang: Lang): LandingCopy {
  return lang === 'fr' ? FR : EN;
}
