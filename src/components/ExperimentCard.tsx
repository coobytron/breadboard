import { hazardsById, partsById } from '../content';
import type { Experiment, InventoryItem, Part, ReadingLevel } from '../types';

interface ExperimentCardProps {
  experiment: Experiment;
  level: ReadingLevel;
  buildable: boolean;
  missing: InventoryItem[];
}

function explorerName(part: Part): string {
  if (part.id.startsWith('led-')) return 'a light';
  if (part.id.startsWith('resistor-')) return 'a stripey brake';
  if (part.id.startsWith('battery-')) return 'a battery';
  if (part.id === 'jumper-wires') return 'jumper wires';
  if (part.id === 'breadboard') return 'a breadboard';
  if (part.id === 'galvanized-nail') return 'a silver nail';
  if (part.id === 'copper-wire') return 'copper wire';
  return part.name.toLowerCase();
}

function missingLabel(item: InventoryItem, level: ReadingLevel): string {
  const part = partsById.get(item.partId);
  if (!part) return `${item.quantity} × ${item.partId}`;
  const name = level === 'explorer' ? explorerName(part) : part.name;
  const quantity = item.quantity > 1 ? `${item.quantity} × ` : '';
  return `${part.icon} ${quantity}${name}`;
}

export function ExperimentCard({ experiment, level, buildable, missing }: ExperimentCardProps) {
  return (
    <article
      className="card"
      data-buildable={buildable ? 'true' : 'false'}
      style={{ opacity: buildable ? 1 : 0.5 }}
    >
      <h3>{experiment.title}</h3>
      <p>{experiment.hook[level]}</p>
      <div className="meta">
        <span className="pill">{experiment.estimatedMinutes} min</span>
        <span className="pill">{experiment.steps.length} steps</span>
        {experiment.hazards.map((hazardId) => {
          const hazard = hazardsById.get(hazardId);
          if (!hazard) return null;
          return (
            <span
              key={hazardId}
              className={`pill ${hazard.severity === 'gate' ? 'danger' : hazard.severity === 'warn' ? 'warn' : ''}`}
            >
              {hazard.title}
            </span>
          );
        })}
      </div>
      {!buildable && missing.length > 0 && (
        <div aria-label="Missing parts" style={{ marginTop: '0.75rem' }}>
          <strong>{level === 'explorer' ? 'You need:' : 'Missing parts:'}</strong>
          <ul>
            {missing.map((item) => (
              <li key={item.partId}>{missingLabel(item, level)}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
