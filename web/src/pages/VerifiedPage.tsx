import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLandingSnapshot } from '../hooks/useLandingSnapshot';
import { formatUsd, formatPct } from '../lib/calculations';
import {
  BRAND_NAME,
  OWNERSHIP_MESSAGE,
  OWNERSHIP_SIGNATURE,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import './VerifiedPage.css';

function daysSince(ts: number | null): number | null {
  if (ts == null) return null;
  return Math.max(1, Math.floor((Date.now() - ts) / 86_400_000));
}

export function VerifiedPage() {
  const snap = useLandingSnapshot();
  const [copied, setCopied] = useState(false);
  const days = daysSince(snap.sinceTs);

  function copyWallet() {
    navigator.clipboard?.writeText(TRADER_WALLET).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }

  return (
    <div className="vf">
      <header className="vf-nav">
        <Link to="/" className="vf-back">Accueil</Link>
        <span className="vf-logo">{BRAND_NAME}</span>
        <Link to="/app" className="vf-cta">{TERMINAL_NAME}</Link>
      </header>

      <main className="vf-main">
        <p className="vf-eyebrow">Vérifié</p>
        <h1>La preuve, pas la promesse.</h1>
        <p className="vf-lead">
          Tout ce que nous affichons vient directement de la blockchain. Voici comment le
          recouper vous-même, en quelques secondes.
        </p>

        <div className="vf-counters">
          <div className="vf-counter">
            <span className="vf-counter-value">{days != null ? days : 'n/a'}</span>
            <span className="vf-counter-label">Jours de trading public</span>
          </div>
          <div className="vf-counter">
            <span className="vf-counter-value">{snap.closedCount || 'n/a'}</span>
            <span className="vf-counter-label">Trades clôturés</span>
          </div>
          <div className="vf-counter">
            <span className="vf-counter-value">0</span>
            <span className="vf-counter-label">Trade caché</span>
          </div>
        </div>

        <section className="vf-block">
          <h2>Le wallet, en clair</h2>
          <p>
            Une seule adresse, publique. Chaque position, chaque ordre et chaque clôture y
            est inscrit. Vérifiez sur l'explorateur Hyperliquid.
          </p>
          <div className="vf-wallet">
            <code className="vf-wallet-addr">{TRADER_WALLET}</code>
            <div className="vf-wallet-actions">
              <button type="button" className="vf-wallet-btn" onClick={copyWallet}>
                {copied ? 'Copié' : 'Copier'}
              </button>
              <a
                className="vf-wallet-btn vf-wallet-btn--primary"
                href={hyperliquidExplorerUrl(TRADER_WALLET)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir l'explorateur
              </a>
            </div>
          </div>
        </section>

        <section className="vf-block">
          <h2>Transparence du risque</h2>
          <p>
            Nous ne montrons pas que les gains. Voici notre exposition et notre pire baisse,
            en direct.
          </p>
          <div className="vf-risk">
            <div className="vf-risk-fig">
              <span className="vf-risk-label">Valeur du compte</span>
              <span className="vf-risk-value">
                {snap.accountValue > 0 ? formatUsd(snap.accountValue) : 'n/a'}
              </span>
            </div>
            <div className="vf-risk-fig">
              <span className="vf-risk-label">Exposition actuelle</span>
              <span className="vf-risk-value">
                {snap.exposure > 0 ? formatUsd(snap.exposure) : formatUsd(0)}
              </span>
            </div>
            <div className="vf-risk-fig">
              <span className="vf-risk-label">Drawdown max</span>
              <span className="vf-risk-value neg">
                {snap.maxDrawdownPct != null ? formatPct(-snap.maxDrawdownPct) : 'n/a'}
              </span>
            </div>
          </div>
        </section>

        <section className="vf-block">
          <h2>Preuve de propriété</h2>
          <p>
            Ce message a été signé par le wallet {BRAND_NAME}. Il prouve que l'adresse
            ci-dessus est bien la nôtre, sans révéler la moindre clé.
          </p>
          <div className="vf-proof">
            <span className="vf-proof-label">Message</span>
            <p className="vf-proof-msg">{OWNERSHIP_MESSAGE}</p>
            {OWNERSHIP_SIGNATURE ? (
              <>
                <span className="vf-proof-label">Signature</span>
                <code className="vf-proof-sig">{OWNERSHIP_SIGNATURE}</code>
              </>
            ) : (
              <p className="vf-proof-soon">
                Signature publiée prochainement. En attendant, l'historique on-chain
                ci-dessus se vérifie déjà sans nous faire confiance.
              </p>
            )}
          </div>
        </section>

        <div className="vf-foot-links">
          <Link to="/app">{TERMINAL_NAME}</Link>
          <span aria-hidden> · </span>
          <Link to="/methodology">Notre approche</Link>
          <span aria-hidden> · </span>
          <Link to="/about">La maison</Link>
        </div>
      </main>
    </div>
  );
}
