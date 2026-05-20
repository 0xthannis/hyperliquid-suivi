import { Link } from 'react-router-dom';
import {
  API_SOURCE_LABEL,
  BRAND_NAME,
  DATA_SCOPE,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import './MethodologyPage.css';

const SECTIONS = [
  {
    title: 'Objet du service',
    body: `${BRAND_NAME} propose le ${TERMINAL_NAME}, un terminal gratuit de lecture. Il affiche l'activité du wallet Hyperliquid indiqué ci-dessous : positions ouvertes, paramètres de sortie et journal des opérations enregistrées par la plateforme.`,
  },
  {
    title: 'Périmètre des données',
    body: 'Seules les données exposées par l\'API Hyperliquid pour ce wallet sont affichées. L\'historique détaillé correspond à l\'activité enregistrée sur Hyperliquid (souvent une à quelques semaines). Les années passées sur Binance, Bybit, Bitget ou tout autre exchange ne sont pas importées ni reconstructibles via ce site.',
  },
  {
    title: 'Source et fraîcheur',
    body: 'Les chiffres proviennent de l\'endpoint info Hyperliquid (clearinghouseState, frontendOpenOrders, userFills, portfolio). Les prix de marché utilisent allMids et le WebSocket lorsque disponible. Un polling de secours maintient la cohérence si le flux coupe.',
  },
  {
    title: 'Notifications',
    body: 'Les alertes push web, si activées, signalent l\'ouverture d\'une nouvelle position sur ce wallet. Elles ne constituent pas une recommandation d\'investissement ni un engagement de réactivité en temps réel.',
  },
  {
    title: 'Ce que le service n\'est pas',
    body: `Pas de gestion pour compte tiers. Pas de conseil en investissement. Pas de promesse de performance. Pas de relation contractuelle entre l'utilisateur et ${BRAND_NAME}. L'utilisateur reste seul responsable de ses décisions.`,
  },
  {
    title: 'Réplication',
    body: 'Toute réplication d\'exécution reste sous la responsabilité du lecteur. Slippage, latence, taille de position et frais peuvent différer. Les scénarios SL/TP affichés reflètent les ordres visibles sur Hyperliquid au moment de la requête.',
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
        <p className="methodology-eyebrow">Documentation</p>
        <h1>Méthodologie</h1>
        <p className="methodology-lead">{DATA_SCOPE}</p>

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
