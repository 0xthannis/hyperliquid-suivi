import { useEffect, useRef, useState } from 'react';

/** Anime un nombre depuis sa valeur précédente vers la cible (ease-out cubique). */
export function useCountUp(value: number, duration = 1000): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    function tick() {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return display;
}
