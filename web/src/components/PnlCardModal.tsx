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
  event?: HistoryEvent | null;
  fills?: Fill[];
  /** Carte déjà construite (ex. position en cours) — court-circuite le build. */
  prebuilt?: PnlCardData | null;
  onClose: () => void;
};

export function PnlCardModal({
  event = null,
  fills = [],
  prebuilt = null,
  onClose,
}: Props) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<PnlCardData | null>(prebuilt);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (prebuilt) {
      setData(prebuilt);
      setLoading(false);
      return;
    }
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
  }, [event, fills, prebuilt]);

  if (!event && !prebuilt) return null;

  async function renderPng(): Promise<string | null> {
    const node = exportRef.current;
    if (!node || !data) return null;
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const cardEl = node.querySelector('.pc--export') as HTMLElement | null;
    const exportHeight = Math.ceil((cardEl?.scrollHeight ?? node.scrollHeight ?? 500) + 8);

    return toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: '#ffffff',
      width: 400,
      height: exportHeight,
      style: { margin: '0', transform: 'none' },
    });
  }

  async function downloadCard() {
    if (!data) return;
    setBusy(true);
    try {
      const dataUrl = await renderPng();
      if (!dataUrl) return;
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

  function shareText(): string {
    if (!data) return 'Suivez nos signaux de trading en temps réel sur THANNIS.';
    const sign = data.pnlPct >= 0 ? '+' : '';
    return `${data.coin} ${data.side} ${sign}${data.pnlPct.toFixed(1)}% — chaque position publique et en temps réel sur THANNIS. Pas un conseil financier.`;
  }

  async function shareCard() {
    if (!data) return;
    setBusy(true);
    try {
      const dataUrl = await renderPng();
      const text = shareText();
      const url = 'https://thannis.com';

      if (dataUrl && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], pnlCardFilename(data), { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, title: 'THANNIS' });
          return;
        }
      }
      // Repli : intention X (texte + lien, sans image)
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } catch {
      /* annulé par l'utilisateur ou non supporté */
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
          Image brandée THANNIS · sans lien · prête pour les réseaux
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
            onClick={shareCard}
            disabled={busy || !data || loading}
          >
            {busy ? 'Préparation…' : 'Partager'}
          </button>
          <button
            type="button"
            className="pnl-card-modal__btn"
            onClick={downloadCard}
            disabled={busy || !data || loading}
          >
            Télécharger PNG
          </button>
          <button type="button" className="pnl-card-modal__btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
