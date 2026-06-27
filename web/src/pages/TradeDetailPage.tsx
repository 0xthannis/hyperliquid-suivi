import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { displaySymbol, fetchFills, type Fill } from '../api/hyperliquid';
import {
  groupFillsToHistory,
  formatDateTime,
  formatUsd,
  type HistoryEvent,
} from '../lib/calculations';
import { buildPnlCardData, type PnlCardData } from '../lib/pnlCard';
import { PnlShareCard } from '../components/PnlShareCard';
import { PnlCardModal } from '../components/PnlCardModal';
import {
  BRAND_NAME,
  TERMINAL_NAME,
  TRADER_WALLET,
  hyperliquidExplorerUrl,
} from '../constants';
import '../components/PnlShareCard.css';
import './TradeDetailPage.css';

export function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<HistoryEvent | null>(null);
  const [fills, setFills] = useState<Fill[]>([]);
  const [card, setCard] = useState<PnlCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFills()
      .then(async (all) => {
        if (cancelled) return;
        setFills(all);
        const target = id ? decodeURIComponent(id) : '';
        const ev = groupFillsToHistory(all).find((e) => e.id === target) ?? null;
        setEvent(ev);
        if (ev?.isClose) {
          const data = await buildPnlCardData(ev, all);
          if (!cancelled) setCard(data);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (event) document.title = `${displaySymbol(event.coin)} · ${BRAND_NAME}`;
    return () => {
      document.title = `${BRAND_NAME}`;
    };
  }, [event]);

  return (
    <div className="td">
      <header className="td-nav">
        <Link to="/app" className="td-back">← {TERMINAL_NAME}</Link>
        <span className="td-logo">{BRAND_NAME}</span>
        <Link to="/verifie" className="td-cta">Vérifié</Link>
      </header>

      <main className="td-main">
        {loading ? (
          <div className="tr-skel" style={{ height: 380, width: 400, maxWidth: '100%', borderRadius: 20, margin: '0 auto' }} />
        ) : !event || !event.isClose || !card ? (
          <div className="td-empty">
            <h1>Trade introuvable</h1>
            <p>Ce trade n'existe pas ou n'est plus disponible dans l'historique on-chain.</p>
            <Link to="/app" className="td-empty-cta">Voir tous nos trades</Link>
          </div>
        ) : (
          <>
            <p className="td-eyebrow">Trade vérifié on-chain</p>
            <h1 className="td-title">{displaySymbol(event.coin)}</h1>

            <div className="td-card-wrap">
              <PnlShareCard data={card} />
            </div>

            <div className="td-facts">
              <div className="td-fact">
                <span>Résultat net</span>
                <b className={event.netPnl >= 0 ? 'pos' : 'neg'}>
                  {formatUsd(event.netPnl, true)}
                </b>
              </div>
              <div className="td-fact">
                <span>Clôturé le</span>
                <b>{formatDateTime(event.time)}</b>
              </div>
              <div className="td-fact">
                <span>Frais</span>
                <b>{formatUsd(event.totalFees)}</b>
              </div>
            </div>

            <div className="td-actions">
              <button
                type="button"
                className="td-btn td-btn--primary"
                onClick={() => setModalOpen(true)}
              >
                Partager la carte
              </button>
              <a
                className="td-btn"
                href={hyperliquidExplorerUrl(TRADER_WALLET)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Vérifier on-chain
              </a>
            </div>

            <p className="td-note">
              Chaque trade {BRAND_NAME} est public et vérifiable. Les performances passées
              ne préjugent pas des performances futures. Ce n'est pas un conseil financier.
            </p>
          </>
        )}
      </main>

      {modalOpen && event && (
        <PnlCardModal event={event} fills={fills} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
