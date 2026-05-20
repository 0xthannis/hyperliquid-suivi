import type { GlossaryKey } from '../lib/glossary';
import { GLOSSARY } from '../lib/glossary';
import './TermLabel.css';

type Props = {
  term: GlossaryKey;
  /** Override displayed label (defaults to glossary short label). */
  children?: React.ReactNode;
  className?: string;
};

export function TermLabel({ term, children, className = '' }: Props) {
  const entry = GLOSSARY[term];
  const label = children ?? entry.short;

  return (
    <span className={`term-label ${className}`.trim()}>
      <span className="term-label-text">{label}</span>
      <span className="term-tooltip" role="tooltip">
        {entry.description}
      </span>
    </span>
  );
}
