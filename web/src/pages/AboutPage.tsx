import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import './AboutPage.css';

export function AboutPage() {
  return (
    <div className="about">
      <header className="about-nav">
        <Link to="/" className="about-back">
          Accueil
        </Link>
        <BrandLogo compact />
        <Link to="/app" className="about-cta">
          {TERMINAL_NAME}
        </Link>
      </header>

      <main className="about-main">
        <p className="about-eyebrow">À propos</p>
        <h1>{BRAND_NAME}</h1>
        <p className="about-lead">
          Structure de trading privée fondée par <strong>Annissa</strong> et{' '}
          <strong>Thanh</strong>. Nous publions notre activité Hyperliquid en lecture
          seule via le {TERMINAL_NAME}, accessible sur{' '}
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>.
        </p>

        <section className="about-block">
          <h2>Notre organisation</h2>
          <div className="about-people">
            <article>
              <h3>Thanh</h3>
              <p className="about-role">Trader principal</p>
              <p>
                Il exécute les positions affichées sur le terminal. Les données proviennent
                directement de son wallet Hyperliquid, sans retouche.
              </p>
            </article>
            <article>
              <h3>Annissa</h3>
              <p className="about-role">Co-fondatrice</p>
              <p>
                Elle structure {BRAND_NAME} avec Thanh et porte le projet de transparence
                publique. L&apos;exécution des trades est centralisée sur le trader principal ;
                la direction de la structure est assurée à deux.
              </p>
            </article>
          </div>
        </section>

        <section className="about-block">
          <h2>Pourquoi le Terminal 277 ?</h2>
          <p>
            Le chiffre <strong>277</strong> est une référence personnelle pour nous deux. Le{' '}
            {TERMINAL_NAME} en porte le nom : c&apos;est notre tableau de bord public, gratuit,
            sans inscription.
          </p>
        </section>

        <section className="about-block">
          <h2>Ce que nous proposons</h2>
          <ul className="about-list">
            <li>Positions ouvertes en temps réel (long / short, SL, TP, PnL)</li>
            <li>Historique des opérations fermées sur Hyperliquid</li>
            <li>Alertes push optionnelles à l&apos;ouverture d&apos;une position</li>
            <li>Export CSV du journal</li>
          </ul>
        </section>

        <section className="about-block">
          <h2>Ce que nous ne faisons pas</h2>
          <ul className="about-list about-list--muted">
            <li>Pas de gestion de capital pour des tiers</li>
            <li>Pas de signaux payants ni d&apos;abonnement</li>
            <li>Pas de promesse de performance</li>
            <li>Pas de conseil en investissement</li>
          </ul>
        </section>

        <section className="about-block about-contact">
          <h2>Contact et vérification</h2>
          <p>
            Wallet suivi :{' '}
            <a
              href={hyperliquidExplorerUrl(TRADER_WALLET)}
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              {truncateWallet(TRADER_WALLET)}
            </a>{' '}
            (vérifier sur Hyperliquid)
          </p>
          <p>
            E-mail :{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="about-link">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <div className="about-footer-links">
          <Link to="/methodology">Méthodologie</Link>
          <span> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
        </div>
      </main>
    </div>
  );
}
