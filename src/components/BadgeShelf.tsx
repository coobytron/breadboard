import { badges, experiments } from '../content';
import { earnedBadges } from '../lib/badges';
import type { LabEntry, OrganicReading, ReadingLevel } from '../types';

interface BadgeShelfProps {
  level: ReadingLevel;
  entries: LabEntry[];
  readings: OrganicReading[];
  highlightIds?: string[];
}

function badgeHint(criteria: (typeof badges)[number]['criteria']): string {
  switch (criteria.type) {
    case 'first-light':
      return 'Finish First Light successfully.';
    case 'complete-experiment':
      return `Finish ${experiments.find((experiment) => experiment.id === criteria.experimentId)?.title ?? criteria.experimentId} successfully.`;
    case 'complete-track':
      return `Finish every experiment in the ${criteria.track} track.`;
    case 'organics-measured':
      return `Measure ${criteria.count} different materials in the Fruit Lab.`;
    default:
      return 'Keep experimenting.';
  }
}

export function BadgeShelf({ level, entries, readings, highlightIds = [] }: BadgeShelfProps) {
  const earnedIds = new Set(earnedBadges(badges, entries, readings, experiments).map((badge) => badge.id));
  const highlighted = new Set(highlightIds);

  return (
    <section aria-labelledby="badge-shelf-title">
      <h3 id="badge-shelf-title">🏅 {level === 'explorer' ? 'Your badges' : 'Badge shelf'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {badges.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <article
              key={badge.id}
              className="card"
              style={{
                opacity: earned ? 1 : 0.4,
                outline: highlighted.has(badge.id) ? '3px solid var(--accent)' : undefined,
              }}
            >
              <div aria-hidden="true" style={{ fontSize: '2rem' }}>{badge.emoji}</div>
              <strong>{badge.name}</strong>
              <p>{earned ? badge.description[level] : badgeHint(badge.criteria)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
