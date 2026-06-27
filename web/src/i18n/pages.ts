import type { Lang } from '../i18n';

export type Section = { title: string; body: string };

export type PagesCopy = {
  common: { home: string; back: string; about: string; approach: string; verified: string; terminal: string };
  verified: {
    eyebrow: string;
    h1: string;
    lead: string;
    daysLabel: string;
    tradesLabel: string;
    hiddenLabel: string;
    walletTitle: string;
    walletText: string;
    copy: string;
    copied: string;
    seeExplorer: string;
    riskTitle: string;
    riskText: string;
    accountValue: string;
    exposure: string;
    drawdown: string;
    proofTitle: string;
    proofText: string;
    message: string;
    signature: string;
    proofSoon: string;
  };
  about: {
    eyebrow: string;
    leadPre: string;
    leadMid: string;
    leadPost: string;
    foundersTitle: string;
    thanhRole: string;
    thanhText: string;
    annissaRole: string;
    annissaText: string;
    convictionTitle: string;
    convictionText: string;
    offerTitle: string;
    offer: string[];
    notTitle: string;
    not: string[];
    contactTitle: string;
    walletLine: string;
    walletVerify: string;
    emailLine: string;
  };
  methodology: {
    eyebrow: string;
    h1: string;
    lead: string;
    walletLabel: string;
    sections: Section[];
    footer: string;
  };
  trade: {
    eyebrow: string;
    netResult: string;
    closedOn: string;
    fees: string;
    share: string;
    verify: string;
    note: (brand: string) => string;
    notFoundTitle: string;
    notFoundText: string;
    seeAll: string;
  };
};

const BRAND = 'THANNIS';

const FR: PagesCopy = {
  common: { home: 'Accueil', back: 'Accueil', about: 'À propos', approach: 'Notre approche', verified: 'Vérifié', terminal: 'Terminal' },
  verified: {
    eyebrow: 'Vérifié',
    h1: 'La preuve, pas la promesse.',
    lead: 'Tout ce que nous affichons vient directement de la blockchain. Voici comment le recouper vous-même, en quelques secondes.',
    daysLabel: 'Jours de trading public',
    tradesLabel: 'Trades clôturés',
    hiddenLabel: 'Trade caché',
    walletTitle: 'Le wallet, en clair',
    walletText: "Une seule adresse, publique. Chaque position, chaque ordre et chaque clôture y est inscrit. Vérifiez sur l'explorateur Hyperliquid.",
    copy: 'Copier',
    copied: 'Copié',
    seeExplorer: "Voir l'explorateur",
    riskTitle: 'Transparence du risque',
    riskText: 'Nous ne montrons pas que les gains. Voici notre exposition et notre pire baisse, en direct.',
    accountValue: 'Valeur du compte',
    exposure: 'Exposition actuelle',
    drawdown: 'Drawdown max',
    proofTitle: 'Preuve de propriété',
    proofText: `Ce message a été signé par le wallet ${BRAND}. Il prouve que l'adresse ci-dessus est bien la nôtre, sans révéler la moindre clé.`,
    message: 'Message',
    signature: 'Signature',
    proofSoon: "Signature publiée prochainement. En attendant, l'historique on-chain ci-dessus se vérifie déjà sans nous faire confiance.",
  },
  about: {
    eyebrow: 'À propos',
    leadPre: 'Société de trading spécialisée dans les actions et les matières premières, fondée par un couple, Annissa et Thanh. Nous publions chaque position en temps réel sur ',
    leadMid: '',
    leadPost: ', pour que vous puissiez la suivre comme un signal.',
    foundersTitle: 'Les fondateurs',
    thanhRole: 'Exécution',
    thanhText: 'Il prend et gère les positions affichées. Les données viennent directement de son wallet Hyperliquid, on-chain, sans aucune retouche.',
    annissaRole: 'Direction',
    annissaText: `Elle pilote ${BRAND} avec Thanh et porte notre engagement de transparence totale. La structure est dirigée à deux.`,
    convictionTitle: 'Notre conviction',
    convictionText: 'La plupart des traders ne montrent que leurs gains. Nous montrons tout : entrées, stops, objectifs, pertes comme profits, en direct et vérifiable on-chain. La transparence n\'est pas une option, c\'est notre standard.',
    offerTitle: 'Ce que nous proposons',
    offer: [
      'Chaque position en temps réel (long / short, levier, SL, TP, P&L)',
      'Un track record public et vérifiable on-chain',
      'Des notifications à chaque ouverture, ajustement et clôture',
      'Des signaux à suivre librement, pour profiter avec nous',
    ],
    notTitle: 'Ce que nous ne faisons pas',
    not: [
      'Pas de gestion de capital pour le compte de tiers',
      'Pas de promesse de performance',
      'Pas de conseil en investissement',
    ],
    contactTitle: 'Contact et vérification',
    walletLine: 'Wallet suivi :',
    walletVerify: '(vérifier sur Hyperliquid)',
    emailLine: 'E-mail :',
  },
  methodology: {
    eyebrow: 'Notre approche',
    h1: 'Comment nous opérons',
    lead: 'Une société de trading qui rend chaque position publique, en temps réel et vérifiable. Voici comment, et ce que cela signifie pour vous.',
    walletLabel: 'Wallet suivi',
    sections: [
      { title: 'Qui nous sommes', body: `${BRAND} est une société de trading spécialisée dans les actions et les matières premières, fondée par un couple, Thanh et Annissa. Nous opérons notre propre capital, les positions affichées sont les nôtres.` },
      { title: 'Transparence totale', body: "Chaque position que nous prenons est publique et visible en temps réel : sens, levier, point d'entrée, stop, objectif et P&L. Rien n'est retouché ni sélectionné après coup, tout est lu directement on-chain." },
      { title: 'Suivre nos signaux', body: "Vous pouvez suivre nos positions comme des signaux et en profiter avec nous. Activez les notifications pour être prévenu à chaque ouverture, ajustement de stop ou d'objectif, et clôture, au moment où cela se passe." },
      { title: 'Des données vérifiables', body: "Les chiffres proviennent directement de la blockchain Hyperliquid : positions, ordres, historique et portfolio. Vous pouvez tout recouper vous-même via l'explorateur public, à l'adresse indiquée ci-dessous. Aucune donnée n'est saisie à la main." },
      { title: "Ce que ce n'est pas", body: `${BRAND} ne gère pas de capital pour le compte de tiers et ne délivre aucun conseil en investissement. Suivre nos signaux relève de votre seule décision. Les performances passées ne préjugent pas des performances futures.` },
    ],
    footer: 'Accès gratuit · Données Hyperliquid · Pas un conseil en investissement',
  },
  trade: {
    eyebrow: 'Trade vérifié on-chain',
    netResult: 'Résultat net',
    closedOn: 'Clôturé le',
    fees: 'Frais',
    share: 'Partager la carte',
    verify: 'Vérifier on-chain',
    note: (brand) => `Chaque trade ${brand} est public et vérifiable. Les performances passées ne préjugent pas des performances futures. Ce n'est pas un conseil financier.`,
    notFoundTitle: 'Trade introuvable',
    notFoundText: "Ce trade n'existe pas ou n'est plus disponible dans l'historique on-chain.",
    seeAll: 'Voir tous nos trades',
  },
};

const EN: PagesCopy = {
  common: { home: 'Home', back: 'Home', about: 'About', approach: 'Our approach', verified: 'Verified', terminal: 'Terminal' },
  verified: {
    eyebrow: 'Verified',
    h1: 'Proof, not promises.',
    lead: 'Everything we show comes straight from the blockchain. Here is how to recheck it yourself, in seconds.',
    daysLabel: 'Days of public trading',
    tradesLabel: 'Closed trades',
    hiddenLabel: 'Hidden trade',
    walletTitle: 'The wallet, in clear',
    walletText: 'One public address. Every position, order and close is written to it. Check it on the Hyperliquid explorer.',
    copy: 'Copy',
    copied: 'Copied',
    seeExplorer: 'Open the explorer',
    riskTitle: 'Risk transparency',
    riskText: 'We do not only show the gains. Here is our exposure and our worst drawdown, live.',
    accountValue: 'Account value',
    exposure: 'Current exposure',
    drawdown: 'Max drawdown',
    proofTitle: 'Proof of ownership',
    proofText: `This message was signed by the ${BRAND} wallet. It proves the address above is ours, without revealing any key.`,
    message: 'Message',
    signature: 'Signature',
    proofSoon: 'Signature coming soon. In the meantime, the on-chain history above is already verifiable without trusting us.',
  },
  about: {
    eyebrow: 'About',
    leadPre: 'A trading firm specialised in equities and commodities, founded by a couple, Annissa and Thanh. We publish every position in real time on ',
    leadMid: '',
    leadPost: ', so you can follow it as a signal.',
    foundersTitle: 'The founders',
    thanhRole: 'Execution',
    thanhText: 'He takes and manages the positions shown. The data comes straight from his Hyperliquid wallet, on-chain, with no edits.',
    annissaRole: 'Direction',
    annissaText: `She runs ${BRAND} with Thanh and carries our commitment to total transparency. The firm is led by two.`,
    convictionTitle: 'Our conviction',
    convictionText: 'Most traders only show their wins. We show everything: entries, stops, targets, losses and profits, live and verifiable on-chain. Transparency is not an option, it is our standard.',
    offerTitle: 'What we offer',
    offer: [
      'Every position in real time (long / short, leverage, SL, TP, P&L)',
      'A public track record, verifiable on-chain',
      'Notifications on every open, adjustment and close',
      'Signals to follow freely, to profit with us',
    ],
    notTitle: 'What we do not do',
    not: [
      'No capital management for third parties',
      'No performance promise',
      'No investment advice',
    ],
    contactTitle: 'Contact and verification',
    walletLine: 'Tracked wallet:',
    walletVerify: '(check on Hyperliquid)',
    emailLine: 'Email:',
  },
  methodology: {
    eyebrow: 'Our approach',
    h1: 'How we operate',
    lead: 'A trading firm that makes every position public, in real time and verifiable. Here is how, and what it means for you.',
    walletLabel: 'Tracked wallet',
    sections: [
      { title: 'Who we are', body: `${BRAND} is a trading firm specialised in equities and commodities, founded by a couple, Thanh and Annissa. We trade our own capital, the positions shown are ours.` },
      { title: 'Total transparency', body: 'Every position we take is public and visible in real time: side, leverage, entry, stop, target and P&L. Nothing is edited or cherry-picked after the fact, everything is read straight from the chain.' },
      { title: 'Follow our signals', body: 'You can follow our positions as signals and profit with us. Turn on notifications to be alerted on every open, stop or target adjustment, and close, as it happens.' },
      { title: 'Verifiable data', body: 'The numbers come straight from the Hyperliquid blockchain: positions, orders, history and portfolio. You can recheck everything yourself via the public explorer, at the address below. No data is entered by hand.' },
      { title: 'What it is not', body: `${BRAND} does not manage capital for third parties and gives no investment advice. Following our signals is your decision alone. Past performance does not guarantee future results.` },
    ],
    footer: 'Free access · Hyperliquid data · Not investment advice',
  },
  trade: {
    eyebrow: 'Trade verified on-chain',
    netResult: 'Net result',
    closedOn: 'Closed on',
    fees: 'Fees',
    share: 'Share the card',
    verify: 'Verify on-chain',
    note: (brand) => `Every ${brand} trade is public and verifiable. Past performance does not guarantee future results. This is not financial advice.`,
    notFoundTitle: 'Trade not found',
    notFoundText: 'This trade does not exist or is no longer available in the on-chain history.',
    seeAll: 'See all our trades',
  },
};

export function getPagesCopy(lang: Lang): PagesCopy {
  return lang === 'fr' ? FR : EN;
}
