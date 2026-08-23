import { useState, type ReactNode } from 'react';
import type { Hazard, ReadingLevel } from '../types';

interface AdultGateProps {
  hazards: Hazard[];
  level: ReadingLevel;
  onConfirm: () => void;
  children: ReactNode;
}

export function AdultGate({ hazards, level, onConfirm, children }: AdultGateProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) return <>{children}</>;

  const confirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  return (
    <section className="card" data-reading-level={level}>
      {hazards.map((hazard) => (
        <article key={hazard.id}>
          <h3>{hazard.title}</h3>
          <p>{hazard.rule.engineer}</p>
        </article>
      ))}
      <button type="button" onClick={confirm} style={{ minHeight: 'var(--tap)' }}>
        I'm an adult and I've read this
      </button>
    </section>
  );
}
