import { Link } from 'react-router-dom';
import { BRAND_NAME, CONTACT_EMAIL, TERMINAL_NAME } from '../constants';
import './TerminalUnavailable.css';

type Props = {
  /** Vue intégrée dans le terminal (avec lien accueil) */
  embedded?: boolean;
};

export function TerminalUnavailable({ embedded = false }: Props) {
  return (
    <div className={`terminal-unavailable ${embedded ? 'terminal-unavailable--embedded' : ''}`}>
      <div className="terminal-unavailable__badge">Indisponible</div>
      <h1 className="terminal-unavailable__title">
        Suivi wallet suspendu
      </h1>
      <p className="terminal-unavailable__lead">
        Le {TERMINAL_NAME} ne publie plus les positions et l&apos;historique du wallet
        Hyperliquid pour le moment. {BRAND_NAME} conserve ce site à titre informatif ;
        le suivi en direct n&apos;est pas actif.
      </p>
      <ul className="terminal-unavailable__list">
        <li>Positions en temps réel — désactivées</li>
        <li>Historique des trades — désactivé</li>
        <li>Alertes push liées au wallet — désactivées</li>
      </ul>
      <p className="terminal-unavailable__note">
        Ce n&apos;est pas un conseil en investissement. Pour toute question :{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      {embedded ? (
        <Link to="/" className="terminal-unavailable__btn">
          Retour à l&apos;accueil
        </Link>
      ) : (
        <div className="terminal-unavailable__actions">
          <Link to="/" className="terminal-unavailable__btn">
            Accueil
          </Link>
          <Link to="/about" className="terminal-unavailable__btn terminal-unavailable__btn--ghost">
            À propos
          </Link>
        </div>
      )}
    </div>
  );
}
