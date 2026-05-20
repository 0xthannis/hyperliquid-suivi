import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { MobileAppBanner } from '../components/MobileAppBanner';
import { LuxuryHeroVisual } from '../components/LuxuryHeroVisual';
import {
  formatLandingActivity,
  useLandingSnapshot,
} from '../hooks/useLandingSnapshot';
import { getPushSupport, requestPushPermission } from '../lib/push';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_URL,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import './LandingPage.css';

const STATS = [
  { value: '0 €', label: 'Site et terminal gratuits' },
  { value: '2', label: 'Fondateurs (Annissa & Thanh)' },
  { value: 'Live', label: 'Positions lues sur Hyperliquid' },
];

const TEAM = [
  {
    name: 'Thanh',
    role: 'Trader principal',
    text: 'Il exécute les positions sur Hyperliquid. Tout ce qui s\'affiche sur le terminal provient de son wallet : entrées, stops, take profits, tailles.',
  },
  {
    name: 'Annissa',
    role: 'Co-fondatrice',
    text: 'Elle structure A&T CAPITAL avec Thanh et porte ce projet de transparence. L\'exécution des trades est assurée par le trader principal ; ils dirigent la structure à deux.',
  },
];

const FEATURES = [
  {
    title: 'Positions en temps réel',
    text: 'Quand une position s\'ouvre, elle apparaît ici avec son sens (long ou short), son levier, son stop loss et son take profit.',
  },
  {
    title: 'Historique des trades fermés',
    text: 'Liste des opérations clôturées avec le PnL enregistré par Hyperliquid. Export CSV possible.',
  },
  {
    title: 'Alertes optionnelles',
    text: 'Vous pouvez activer une notification quand une nouvelle position s\'ouvre sur le wallet suivi. Rien n\'est obligatoire.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Ouvrir le Terminal 277',
    text: 'Accédez au tableau de bord public : positions ouvertes, PnL, niveaux de sortie.',
  },
  {
    n: '02',
    title: 'Comprendre ce que vous voyez',
    text: 'Survolez les termes (notionnel, distance SL, R:R…) pour lire une définition simple. Consultez la page Méthodologie pour le détail technique.',
  },
  {
    n: '03',
    title: 'Décider de votre côté',
    text: 'Observer, s\'inspirer ou copier reste votre choix. A&T CAPITAL ne vend pas de signaux et ne gère pas d\'argent pour vous.',
  },
];

const NOT_PROMISES = [
  'Pas de gestion de capital pour des tiers',
  'Pas de signaux payants ni d\'abonnement',
  'Pas de promesse de gains ou de performance',
  'Pas de conseil en investissement personnalisé',
];

const FAQ = [
  {
    q: 'C\'est vraiment gratuit ?',
    a: 'Oui. Le site et le Terminal 277 sont en accès libre, sans inscription ni paiement.',
  },
  {
    q: 'Puis-je copier vos trades ?',
    a: 'Vous pouvez observer et décider par vous-même. A&T CAPITAL ne vous demande pas d\'argent et ne gère pas de compte pour vous.',
  },
  {
    q: 'Qui exécute les positions ?',
    a: 'Thanh, trader principal, sur un wallet Hyperliquid public. Annissa co-fonde la structure avec lui.',
  },
  {
    q: 'Pourquoi seulement Hyperliquid ?',
    a: 'Le terminal affiche uniquement ce que Hyperliquid enregistre pour ce wallet. L\'activité sur d\'autres exchanges n\'y figure pas.',
  },
  {
    q: 'Les alertes sont-elles obligatoires ?',
    a: 'Non. Vous pouvez consulter le terminal sans activer les notifications push.',
  },
];

const LIMITS = [
  {
    title: 'Un seul exchange',
    text: 'Seul Hyperliquid est affiché. Les trades passés sur Binance, Bybit ou Bitget n\'apparaissent pas sur ce site.',
  },
  {
    title: 'Historique limité',
    text: 'Hyperliquid ne remonte souvent que quelques jours ou semaines d\'historique. On n\'invente pas un track record sur d\'autres plateformes.',
  },
  {
    title: 'Pas de conseil financier',
    text: 'Ce site documente une activité de trading. Ce n\'est ni une recommandation d\'investissement, ni une promesse de performance.',
  },
];

export function LandingPage() {
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const pushState = getPushSupport();
  const snapshot = useLandingSnapshot();

  async function handlePush() {
    setPushLoading(true);
    setPushMsg(null);
    const result = await requestPushPermission();
    setPushMsg(result.message);
    setPushLoading(false);
  }

  return (
    <div className="landing">
      <div className="landing-noise" aria-hidden />

      <header className="landing-nav">
        <div className="landing-brand">
          <BrandLogo />
          <span className="landing-logo-sub">{TERMINAL_NAME}</span>
        </div>
        <Link to="/app" className="landing-nav-cta">
          {TERMINAL_NAME}
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-eyebrow">Structure de trading · Hyperliquid · Accès public</p>
          <h1>
            Suivez nos trades crypto
            <br />
            <span className="highlight">en direct et gratuitement.</span>
          </h1>
          <p className="landing-lead">
            <strong>{BRAND_NAME}</strong> est une structure privée fondée par{' '}
            <strong>Annissa</strong> et <strong>Thanh</strong>. Nous publions ici l'activité
            du wallet Hyperliquid sur lequel <strong>Thanh</strong> trade au quotidien.
            Le <strong>{TERMINAL_NAME}</strong> permet à n'importe qui de voir les mêmes
            données que nous, sans payer, sans compte.
          </p>
          <ul className="landing-audience">
            <li>Voir les positions ouvertes et leurs stops / take profits</li>
            <li>Consulter l'historique des trades fermés sur Hyperliquid</li>
            <li>Recevoir une alerte quand une nouvelle position s'ouvre (optionnel)</li>
          </ul>
          <div className="landing-activity" aria-live="polite">
            <span className="landing-activity-dot" />
            <span>{formatLandingActivity(snapshot)}</span>
          </div>
          <div className="landing-hero-actions">
            <Link to="/app" className="btn btn-primary">
              Ouvrir le {TERMINAL_NAME}
            </Link>
            <a
              href={hyperliquidExplorerUrl(TRADER_WALLET)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Vérifier sur Hyperliquid
            </a>
            {pushState !== 'unsupported' && pushState !== 'denied' && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePush}
                disabled={pushLoading || pushState === 'granted'}
              >
                {pushState === 'granted'
                  ? 'Alertes activées'
                  : pushLoading
                    ? 'Activation…'
                    : 'Activer les alertes'}
              </button>
            )}
          </div>
          {pushMsg && <p className="landing-push-msg">{pushMsg}</p>}
        </div>
        <LuxuryHeroVisual />
      </section>

      <section className="landing-section landing-about">
        <h2>Qui sommes-nous ?</h2>
        <p className="landing-section-lead">
          {BRAND_NAME} (Annissa &amp; Thanh) est une structure de trading à deux. Les
          positions affichées sur ce site sont celles du <strong>trader principal</strong>{' '}
          sur un wallet Hyperliquid public. Nous avons créé le {TERMINAL_NAME} pour
          documenter cette activité de façon claire, sans marketing ni promesse de gains.
        </p>
        <div className="team-grid">
          {TEAM.map((person) => (
            <article key={person.name} className="team-card">
              <p className="team-name">{person.name}</p>
              <p className="team-role">{person.role}</p>
              <p className="team-text">{person.text}</p>
            </article>
          ))}
        </div>
        <p className="landing-about-note">
          Le chiffre <strong>277</strong> est une référence personnelle pour nous. Le{' '}
          {TERMINAL_NAME} en est le nom : notre espace de lecture publique des trades.
        </p>
      </section>

      <section className="landing-promises">
        <h2>Ce que {BRAND_NAME} ne promet pas</h2>
        <ul>
          {NOT_PROMISES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="landing-stats">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="landing-section">
        <h2>Que propose le {TERMINAL_NAME} ?</h2>
        <p className="landing-section-lead">
          Un tableau de bord en lecture seule, branché sur l'API Hyperliquid. Vous ne
          tradez pas depuis ce site : vous observez ce qui se passe sur le wallet suivi.
        </p>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card">
              <div className="feature-line" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-steps-section">
        <h2>Comment utiliser le site ?</h2>
        <p className="landing-section-lead">
          Trois étapes suffisent pour un premier passage, même si vous ne connaissez pas
          encore {BRAND_NAME}.
        </p>
        <ol className="steps-list">
          {STEPS.map((s) => (
            <li key={s.n} className="step-item">
              <span className="step-num">{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-faq">
        <h2>Questions fréquentes</h2>
        <div className="faq-list">
          {FAQ.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-section landing-transparency">
        <h2>Ce qu'il faut savoir avant de suivre</h2>
        <p className="landing-section-lead">
          Nous préférons être transparents sur les limites du site plutôt que de laisser
          croire à un historique complet sur toutes les plateformes.
        </p>
        <div className="transparency-grid">
          {LIMITS.map((item) => (
            <article key={item.title} className="transparency-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta-block">
        <div className="cta-inner">
          <LuxuryHeroVisual compact />
          <div className="cta-text">
            <h2>Prêt à découvrir le {TERMINAL_NAME} ?</h2>
            <p>
              Accès gratuit, sans inscription. Vous voyez les trades Hyperliquid du wallet
              suivi par {BRAND_NAME}. Vous restez libre et seul responsable de vos
              décisions.
            </p>
            <div className="cta-buttons">
              <Link to="/app" className="btn btn-primary btn-large">
                Ouvrir le {TERMINAL_NAME}
              </Link>
              {pushState !== 'unsupported' &&
                pushState !== 'granted' &&
                pushState !== 'denied' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePush}
                    disabled={pushLoading}
                  >
                    Activer les alertes
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>
          {BRAND_NAME} · {TERMINAL_NAME} · Annissa &amp; Thanh
        </p>
        <p className="landing-footer-sub">
          Données Hyperliquid uniquement. Accès gratuit. Pas un conseil en investissement.
        </p>
        <p className="landing-footer-links">
          <Link to="/about">À propos</Link>
          <span> · </span>
          <Link to="/methodology">Méthodologie</Link>
          <span> · </span>
          <Link to="/app">{TERMINAL_NAME}</Link>
          <span> · </span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="landing-footer-domain">
          <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>
          {' · '}
          Wallet {truncateWallet(TRADER_WALLET)}
        </p>
      </footer>
      <MobileAppBanner />
    </div>
  );
}
