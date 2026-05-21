import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Fill } from '../api/hyperliquid';
import type { HistoryEvent } from '../lib/calculations';
import { PnlShareCard } from './PnlShareCard';
import {
  buildPnlCardData,
  pnlCardFilename,
  type PnlCardData,
} from '../lib/pnlCard';
import './PnlShareCard.css';

type Props = {
  event: HistoryEvent | null;
  fills: Fill[];
  onClose: () => void;
};

export function PnlCardModal({ event, fills, onClose }: Props) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PnlCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!event?.isClose) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    buildPnlCardData(event, fills)
      .then((card) => {
        if (!cancelled) setData(card);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [event, fills]);

  if (!event) return null;

  async function downloadCard() {
    const node = exportRef.current;
    if (!node || !data) return;
    setBusy(true);
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const cardEl = node.querySelector('.pnl-card--export') as HTMLElement | null;
      const exportHeight = Math.ceil(
        (cardEl?.scrollHeight ?? node.scrollHeight ?? 500) + 8
      );

      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#060608',
        width: 360,
        height: exportHeight,
        style: {
          margin: '0',
          transform: 'none',
        },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = pnlCardFilename(data);
      a.click();
    } catch {
      window.alert('Impossible de générer l\'image. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="pnl-card-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pnl-card-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pnl-card-modal">
        <h2 id="pnl-card-modal-title" className="pnl-card-modal__title">
          Carte PnL
        </h2>
        <p className="pnl-card-modal__sub">
          Image brandée A&amp;T · sans lien · prête pour les réseaux
        </p>

        <div className="pnl-card-modal__preview">
          {loading && <p className="pnl-card-modal__loading">Chargement SL / levier…</p>}
          {data && <PnlShareCard data={data} />}
        </div>

        {/* Copie hors flux modal pour export PNG fidèle */}
        {data && (
          <div className="pnl-card-export-host" aria-hidden>
            <div ref={exportRef}>
              <PnlShareCard data={data} forExport />
            </div>
          </div>
        )}

        <div className="pnl-card-modal__actions">
          <button
            type="button"
            className="pnl-card-modal__btn pnl-card-modal__btn--primary"
            onClick={downloadCard}
            disabled={busy || !data || loading}
          >
            {busy ? 'Génération…' : 'Télécharger PNG'}
          </button>
          <button type="button" className="pnl-card-modal__btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
