import { Link } from 'react-router-dom';
import {
  API_SOURCE_LABEL,
  BRAND_NAME,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import './MethodologyPage.css';

const SECTIONS = [
  {
    title: 'Qui nous sommes',
    body: `${BRAND_NAME} est une société de trading spécialisée dans les actions et les matières premières, fondée par un couple, Thanh et Annissa. Nous opérons notre propre capital — les positions affichées sont les nôtres.`,
  },
  {
    title: 'Transparence totale',
    body: 'Chaque position que nous prenons est publique et visible en temps réel : sens, levier, point d\'entrée, stop, objectif et P&L. Rien n\'est retouché ni sélectionné après coup — tout est lu directement on-chain.',
  },
  {
    title: 'Suivre nos signaux',
    body: 'Vous pouvez suivre nos positions comme des signaux et en profiter avec nous. Activez les notifications pour être prévenu à chaque ouverture, ajustement de stop ou d\'objectif, et clôture — au moment où cela se passe.',
  },
  {
    title: 'Des données vérifiables',
    body: 'Les chiffres proviennent directement de la blockchain Hyperliquid : positions, ordres, historique et portfolio. Vous pouvez tout recouper vous-même via l\'explorateur public, à l\'adresse indiquée ci-dessous. Aucune donnée n\'est saisie à la main.',
  },
  {
    title: 'Ce que ce n\'est pas',
    body: `${BRAND_NAME} ne gère pas de capital pour le compte de tiers et ne délivre aucun conseil en investissement. Suivre nos signaux relève de votre seule décision. Les performances passées ne préjugent pas des performances futures.`,
  },
];

export function MethodologyPage() {
  return (
    <div className="methodology">
      <header className="methodology-nav">
        <Link to="/" className="methodology-back">
          Accueil
        </Link>
        <span className="methodology-logo">{BRAND_NAME}</span>
        <Link to="/about" className="methodology-back-secondary">
          À propos
        </Link>
        <Link to="/app" className="methodology-cta">
          {TERMINAL_NAME}
        </Link>
      </header>

      <main className="methodology-main">
        <p className="methodology-eyebrow">Notre approche</p>
        <h1>Comment nous opérons</h1>
        <p className="methodology-lead">
          Une société de trading qui rend chaque position publique, en temps réel et
          vérifiable. Voici comment, et ce que cela signifie pour vous.
        </p>

        <div className="methodology-wallet">
          <span className="metric-label">Wallet suivi</span>
          <a
            href={hyperliquidExplorerUrl(TRADER_WALLET)}
            target="_blank"
            rel="noopener noreferrer"
            className="methodology-wallet-link tabular"
          >
            {truncateWallet(TRADER_WALLET, 8, 6)}
          </a>
          <span className="methodology-wallet-hint">{API_SOURCE_LABEL}</span>
        </div>

        {SECTIONS.map((s) => (
          <section key={s.title} className="methodology-section">
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </main>

      <footer className="methodology-footer">
        Accès gratuit · Données Hyperliquid · Pas un conseil en investissement
      </footer>
    </div>
  );
}
