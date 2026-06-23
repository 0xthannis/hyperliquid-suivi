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
  WALLET_TRACKING_ENABLED,
  hyperliquidExplorerUrl,
} from '../constants';
import { truncateWallet } from '../lib/wallet';
import '../components/TerminalUnavailable.css';
import './LandingPage.css';

const STATS = WALLET_TRACKING_ENABLED
  ? [
      { value: '0 €', label: 'Site et terminal gratuits' },
      { value: 'On-chain', label: 'Chaque position vérifiable' },
      { value: 'Live', label: 'Positions lues sur Hyperliquid' },
    ]
  : [
      { value: '0 €', label: 'Site en accès libre' },
      { value: 'On-chain', label: 'Activité vérifiable' },
      { value: 'Off', label: 'Suivi wallet suspendu' },
    ];

const TEAM = [
  {
    name: 'Discipline',
    role: 'Le process avant le résultat',
    text: 'Chaque position est prise avec un stop et un objectif définis à l\'avance. Pas d\'improvisation, pas de pari émotionnel.',
  },
  {
    name: 'Transparence',
    role: 'Rien à dissimuler',
    text: 'Tout ce qui s\'affiche provient d\'un wallet Hyperliquid public. Les mêmes données que nous, lisibles par tous, sans filtre.',
  },
  {
    name: 'Liberté',
    role: 'Vous restez maître',
    text: 'Aucun signal vendu, aucun capital géré pour autrui. Vous observez, vous décidez, vous assumez vos choix.',
  },
];

const FEATURES = WALLET_TRACKING_ENABLED
  ? [
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
    ]
  : [
      {
        title: 'Positions en temps réel',
        text: 'Indisponible pour le moment. Le terminal n\'affiche plus de positions live.',
      },
      {
        title: 'Historique des trades fermés',
        text: 'Indisponible pour le moment. Le journal des opérations n\'est plus publié.',
      },
      {
        title: 'Alertes optionnelles',
        text: 'Désactivées tant que le suivi wallet est suspendu.',
      },
    ];

const STEPS = WALLET_TRACKING_ENABLED
  ? [
      {
        n: '01',
        title: 'Ouvrir le Terminal LVDC',
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
        text: 'Observer, s\'inspirer ou copier reste votre choix. La Vie de César ne vend pas de signaux et ne gère pas d\'argent pour vous.',
      },
    ]
  : [
      {
        n: '01',
        title: 'Consulter le statut du terminal',
        text: 'Le Terminal LVDC affiche un message d\'indisponibilité : le suivi wallet est suspendu.',
      },
      {
        n: '02',
        title: 'Lire notre méthodologie',
        text: 'Les pages À propos et Méthodologie expliquent comment fonctionnait le terminal et ses limites.',
      },
      {
        n: '03',
        title: 'Nous contacter si besoin',
        text: 'Pour toute question sur la suspension du suivi, écrivez-nous à l\'adresse indiquée en bas de page.',
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
    a: 'Oui. Le site et le Terminal LVDC sont en accès libre, sans inscription ni paiement.',
  },
  {
    q: 'Puis-je copier vos trades ?',
    a: 'Vous pouvez observer et décider par vous-même. La Vie de César ne vous demande pas d\'argent et ne gère pas de compte pour vous.',
  },
  {
    q: 'Qui exécute les positions ?',
    a: 'Le trader derrière La Vie de César, sur un wallet Hyperliquid public. Tout est exécuté sur ce wallet : crypto, indices et matières premières.',
  },
  {
    q: 'Pourquoi seulement Hyperliquid ?',
    a: 'Le terminal affiche uniquement ce que Hyperliquid enregistre pour ce wallet, tous marchés confondus. L\'activité sur d\'autres exchanges n\'y figure pas.',
  },
  {
    q: 'Les alertes sont-elles obligatoires ?',
    a: 'Non. Vous pouvez consulter le terminal sans activer les notifications push.',
  },
  ...(WALLET_TRACKING_ENABLED
    ? []
    : [
        {
          q: 'Pourquoi le terminal est-il indisponible ?',
          a: 'Le suivi public du wallet Hyperliquid est suspendu pour le moment. Le site reste en ligne pour présenter La Vie de César et indiquer clairement que les données live ne sont plus publiées.',
        },
      ]),
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
          {WALLET_TRACKING_ENABLED ? TERMINAL_NAME : `${TERMINAL_NAME} — indisponible`}
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          {!WALLET_TRACKING_ENABLED && (
            <div className="landing-unavailable-banner" role="status">
              <div>
                <strong>Terminal indisponible</strong>
                <p>
                  Le suivi public du wallet Hyperliquid est suspendu. Positions, historique
                  et alertes ne sont plus publiés sur ce site.
                </p>
              </div>
            </div>
          )}
          <p className="landing-eyebrow">
            {WALLET_TRACKING_ENABLED
              ? 'Structure de trading · Hyperliquid · Accès public'
              : 'Structure de trading · Site informatif'}
          </p>
          <h1>
            {WALLET_TRACKING_ENABLED ? (
              <>
                Suivez nos positions
                <br />
                <span className="highlight">en direct et gratuitement.</span>
              </>
            ) : (
              <>
                {BRAND_NAME}
                <br />
                <span className="highlight">suivi wallet suspendu.</span>
              </>
            )}
          </h1>
          <p className="landing-lead">
            <strong>{BRAND_NAME}</strong> est une structure de trading privée, guidée
            par une seule règle : la discipline avant la promesse.
            {WALLET_TRACKING_ENABLED ? (
              <>
                {' '}
                Nous publions ici l'activité du wallet Hyperliquid sur lequel nous
                tradons crypto, indices et matières premières. Le{' '}
                <strong>{TERMINAL_NAME}</strong> permet à n'importe qui de voir les
                mêmes données que nous, sans payer, sans compte.
              </>
            ) : (
              <>
                {' '}
                Le <strong>{TERMINAL_NAME}</strong> ne publie plus les positions ni
                l'historique du wallet pour le moment. Ce site reste en ligne pour présenter
                la structure et signaler clairement l'indisponibilité du suivi.
              </>
            )}
          </p>
          <ul className="landing-audience">
            {WALLET_TRACKING_ENABLED ? (
              <>
                <li>Voir les positions ouvertes et leurs stops / take profits</li>
                <li>Consulter l'historique des trades fermés sur Hyperliquid</li>
                <li>Recevoir une alerte quand une nouvelle position s'ouvre (optionnel)</li>
              </>
            ) : (
              <>
                <li>Positions en temps réel — indisponibles</li>
                <li>Historique des trades — indisponible</li>
                <li>Alertes push liées au wallet — désactivées</li>
              </>
            )}
          </ul>
          <div className="landing-activity" aria-live="polite">
            <span
              className={`landing-activity-dot${WALLET_TRACKING_ENABLED ? '' : ' landing-activity-dot--off'}`}
            />
            <span>{formatLandingActivity(snapshot)}</span>
          </div>
          <div className="landing-hero-actions">
            <Link to="/app" className="btn btn-primary">
              {WALLET_TRACKING_ENABLED
                ? `Ouvrir le ${TERMINAL_NAME}`
                : 'Voir le statut du terminal'}
            </Link>
            {WALLET_TRACKING_ENABLED && (
              <a
                href={hyperliquidExplorerUrl(TRADER_WALLET)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Vérifier sur Hyperliquid
              </a>
            )}
            {WALLET_TRACKING_ENABLED &&
              pushState !== 'unsupported' &&
              pushState !== 'denied' && (
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
        <h2>Notre ligne de conduite</h2>
        <p className="landing-section-lead">
          {BRAND_NAME} est une structure de trading privée. Les positions affichées sur
          ce site sont celles d'un wallet Hyperliquid public — crypto, indices et matières
          premières. Nous avons créé le {TERMINAL_NAME} pour documenter cette activité de
          façon claire, sans marketing ni promesse de gains. Trois principes la gouvernent.
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
          <strong>La Vie de César</strong> : un nom qui rappelle qu'aucune victoire ne
          tient sans rigueur. Le {TERMINAL_NAME} en est l'expression publique — notre
          espace de lecture transparente des trades.
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
          {WALLET_TRACKING_ENABLED
            ? "Un tableau de bord en lecture seule, branché sur l'API Hyperliquid. Vous ne tradez pas depuis ce site : vous observez ce qui se passe sur le wallet suivi."
            : 'Le terminal était un tableau de bord en lecture seule branché sur Hyperliquid. Ces fonctionnalités sont suspendues pour le moment.'}
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
            <h2>
              {WALLET_TRACKING_ENABLED
                ? `Prêt à découvrir le ${TERMINAL_NAME} ?`
                : `${TERMINAL_NAME} — indisponible`}
            </h2>
            <p>
              {WALLET_TRACKING_ENABLED
                ? `Accès gratuit, sans inscription. Vous voyez les trades Hyperliquid du wallet suivi par ${BRAND_NAME}. Vous restez libre et seul responsable de vos décisions.`
                : 'Le suivi public du wallet est suspendu. Consultez la page du terminal pour le détail ou contactez-nous si vous avez une question.'}
            </p>
            <div className="cta-buttons">
              <Link to="/app" className="btn btn-primary btn-large">
                {WALLET_TRACKING_ENABLED
                  ? `Ouvrir le ${TERMINAL_NAME}`
                  : 'Voir le statut du terminal'}
              </Link>
              {WALLET_TRACKING_ENABLED &&
                pushState !== 'unsupported' &&
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
          {BRAND_NAME} · {TERMINAL_NAME} · Discipline, transparence, liberté
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
