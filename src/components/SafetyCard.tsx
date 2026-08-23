import { hazards } from '../content';
import type { HazardId, ReadingLevel } from '../types';
import { sortHazards } from '../lib/safety';

interface SafetyCardProps {
  hazardIds: HazardId[];
  level: ReadingLevel;
}

const severityColor = {
  gate: 'var(--danger)',
  warn: 'var(--warn)',
  note: 'var(--muted)',
} as const;

export function SafetyCard({ hazardIds, level }: SafetyCardProps) {
  const visibleHazards = sortHazards(hazardIds, hazards);

  if (visibleHazards.length === 0) return null;

  return (
    <section aria-label="Safety" className="card">
      {level === 'explorer' && <p>Grown-up: read this out loud 👇</p>}
      {visibleHazards.map((hazard) => (
        <article
          key={hazard.id}
          style={{ borderLeft: `4px solid ${severityColor[hazard.severity]}`, paddingLeft: '0.75rem' }}
        >
          <h3>{hazard.title}</h3>
          <p>{hazard.rule[level]}</p>
        </article>
      ))}
    </section>
  );
}
