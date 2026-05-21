import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { PnlShareCard } from './PnlShareCard';
import { pnlCardFilename, type PnlCardData } from '../lib/pnlCard';
import './PnlShareCard.css';

type Props = {
  data: PnlCardData | null;
  onClose: () => void;
};

export function PnlCardModal({ data, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  if (!data) return null;

  async function downloadCard() {
    const node = cardRef.current;
    if (!node || !data) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#060608',
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
          <div ref={cardRef}>
            <PnlShareCard data={data} />
          </div>
        </div>

        <div className="pnl-card-modal__actions">
          <button
            type="button"
            className="pnl-card-modal__btn pnl-card-modal__btn--primary"
            onClick={downloadCard}
            disabled={busy}
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
