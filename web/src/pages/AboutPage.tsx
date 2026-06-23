import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  WALLET_TRACKING_ENABLED,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import '../components/TerminalUnavailable.css';
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
          {WALLET_TRACKING_ENABLED ? TERMINAL_NAME : `${TERMINAL_NAME} — indisponible`}
        </Link>
      </header>

      <main className="about-main">
        <p className="about-eyebrow">À propos</p>
        <h1>{BRAND_NAME}</h1>
        {!WALLET_TRACKING_ENABLED && (
          <div className="landing-unavailable-banner" role="status">
            <div>
              <strong>Terminal indisponible</strong>
              <p>
                Le suivi public du wallet Hyperliquid est suspendu. Positions, historique
                et alertes ne sont plus publiés.
              </p>
            </div>
          </div>
        )}
        <p className="about-lead">
          Structure de trading privée, guidée par la discipline plutôt que par la
          promesse.
          {WALLET_TRACKING_ENABLED ? (
            <>
              {' '}
              Nous publions notre activité Hyperliquid en lecture seule via le{' '}
              {TERMINAL_NAME}, accessible sur{' '}
              <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>.
            </>
          ) : (
            <>
              {' '}
              Le {TERMINAL_NAME} ne publie plus les données du wallet pour le moment.
              Ce site reste accessible sur{' '}
              <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a> à titre
              informatif.
            </>
          )}
        </p>

        <section className="about-block">
          <h2>Nos principes</h2>
          <div className="about-people">
            <article>
              <h3>Discipline</h3>
              <p className="about-role">Le process avant le résultat</p>
              <p>
                Chaque position est prise avec un stop et un objectif définis à l&apos;avance.
                Les données affichées proviennent directement du wallet Hyperliquid, sans
                retouche.
              </p>
            </article>
            <article>
              <h3>Transparence</h3>
              <p className="about-role">Rien à dissimuler</p>
              <p>
                {BRAND_NAME} publie en lecture seule l&apos;activité d&apos;un wallet public —
                crypto, indices et matières premières. Vous voyez exactement les mêmes
                chiffres que nous, vérifiables on-chain.
              </p>
            </article>
          </div>
        </section>

        <section className="about-block">
          <h2>Pourquoi « La Vie de César » ?</h2>
          <p>
            Un nom qui rappelle qu&apos;aucune conquête ne tient sans rigueur ni sang-froid.
            Le {TERMINAL_NAME} en est l&apos;expression publique : un tableau de bord gratuit,
            sans inscription, où la donnée parle d&apos;elle-même.
          </p>
        </section>

        <section className="about-block">
          <h2>Ce que nous proposons</h2>
          <ul className="about-list">
            {WALLET_TRACKING_ENABLED ? (
              <>
                <li>Positions ouvertes en temps réel (long / short, SL, TP, PnL)</li>
                <li>Historique des opérations fermées sur Hyperliquid</li>
                <li>Alertes push optionnelles à l&apos;ouverture d&apos;une position</li>
                <li>Export CSV du journal</li>
              </>
            ) : (
              <>
                <li>Positions en temps réel — suspendues</li>
                <li>Historique des opérations — suspendu</li>
                <li>Alertes push — désactivées</li>
                <li>Export CSV — indisponible</li>
              </>
            )}
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
