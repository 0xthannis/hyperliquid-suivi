import { BRAND_NAME } from '../constants';
import './BrandLogo.css';

type Props = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = '' }: Props) {
  return (
    <span className={`brand-logo ${compact ? 'brand-logo--compact' : ''} ${className}`.trim()}>
      <span className="brand-logo-mark" aria-hidden>
        A&amp;T
      </span>
      {!compact && <span className="brand-logo-name">{BRAND_NAME}</span>}
    </span>
  );
}
