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
          Société de trading spécialisée dans les <strong>actions</strong> et les{' '}
          <strong>matières premières</strong>, fondée par un couple,{' '}
          <strong>Annissa</strong> et <strong>Thanh</strong>. Nous publions chaque
          position en temps réel sur{' '}
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>, pour que vous
          puissiez la suivre comme un signal.
        </p>

        <section className="about-block">
          <h2>Les fondateurs</h2>
          <div className="about-people">
            <article>
              <h3>Thanh</h3>
              <p className="about-role">Exécution</p>
              <p>
                Il prend et gère les positions affichées. Les données viennent
                directement de son wallet Hyperliquid, on-chain, sans aucune retouche.
              </p>
            </article>
            <article>
              <h3>Annissa</h3>
              <p className="about-role">Direction</p>
              <p>
                Elle pilote {BRAND_NAME} avec Thanh et porte notre engagement de
                transparence totale. La structure est dirigée à deux.
              </p>
            </article>
          </div>
        </section>

        <section className="about-block">
          <h2>Notre conviction</h2>
          <p>
            La plupart des traders ne montrent que leurs gains. Nous montrons{' '}
            <strong>tout</strong> : entrées, stops, objectifs, pertes comme profits, en
            direct et vérifiable on-chain. La transparence n&apos;est pas une option, c&apos;est
            notre standard.
          </p>
        </section>

        <section className="about-block">
          <h2>Ce que nous proposons</h2>
          <ul className="about-list">
            <li>Chaque position en temps réel (long / short, levier, SL, TP, P&amp;L)</li>
            <li>Un track record public et vérifiable on-chain</li>
            <li>Des notifications à chaque ouverture, ajustement et clôture</li>
            <li>Des signaux à suivre librement, pour profiter avec nous</li>
          </ul>
        </section>

        <section className="about-block">
          <h2>Ce que nous ne faisons pas</h2>
          <ul className="about-list about-list--muted">
            <li>Pas de gestion de capital pour le compte de tiers</li>
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
          <Link to="/methodology">Notre approche</Link>
          <span> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
        </div>
      </main>
    </div>
  );
}
