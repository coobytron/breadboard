import { useState } from 'react';
import { experiments, hazardsById, partsById } from './content';
import { ExperimentCard } from './components/ExperimentCard';
import { InventoryPicker } from './components/InventoryPicker';
import { useInventory } from './hooks/useInventory';
import { missingParts } from './lib/inventory';
import { buildable, nextBestPart } from './lib/unlocks';
import { READING_LEVELS, type LeveledText, type ReadingLevel } from './types';

const LEVEL_LABELS: Record<ReadingLevel, string> = {
  explorer: '🐣 Explorer (under 6)',
  builder: '🔨 Builder (6–9)',
  engineer: '⚡ Engineer (10–13)',
};

const TRACK_LABELS: Record<string, string> = {
  basics: 'Start here',
  transistor: 'Transistors',
  laser: 'Lasers',
  fruit: '🍋 Fruit Lab',
};

const INVENTORY_LABEL: LeveledText = {
  explorer: 'What parts are in your box?',
  builder: 'What parts do you have?',
  engineer: 'Parts inventory',
};

function levelAllows(current: ReadingLevel, minimum: ReadingLevel): boolean {
  return READING_LEVELS.indexOf(current) >= READING_LEVELS.indexOf(minimum);
}

/** Home screen: pick a reading level, inventory the parts on hand, and see what is buildable now. */
export function App() {
  const [level, setLevel] = useState<ReadingLevel>('builder');
  const { inventory } = useInventory();

  const visible = experiments.filter((experiment) => {
    if (!levelAllows(level, experiment.minLevel)) return false;
    const gatedHazard = experiment.hazards.some((hazardId) => hazardsById.get(hazardId)?.hiddenFrom.includes(level));
    return !gatedHazard;
  });
  const tracks = [...new Set(visible.map((experiment) => experiment.track))];
  const bestPart = nextBestPart(visible, inventory);
  const bestPartInfo = bestPart ? partsById.get(bestPart.partId) : undefined;

  return (
    <div className="wrap">
      <h1>🍋 Breadboard Buddy</h1>
      <p className="sub">Pick who's building today.</p>

      <div className="levels">
        {READING_LEVELS.map((candidate) => (
          <button
            key={candidate}
            aria-pressed={level === candidate}
            onClick={() => setLevel(candidate)}
          >
            {LEVEL_LABELS[candidate]}
          </button>
        ))}
      </div>

      <details className="card">
        <summary style={{ cursor: 'pointer', minHeight: 'var(--tap)' }}>{INVENTORY_LABEL[level]}</summary>
        <InventoryPicker level={level} />
      </details>

      {bestPart && bestPartInfo && (
        <aside className="card" aria-label="Best next part">
          <strong>
            {bestPartInfo.icon}{' '}
            {level === 'explorer' ? 'A great next part:' : 'Best next part:'} {bestPartInfo.name}
          </strong>
          <p>
            {level === 'explorer'
              ? `It helps with ${bestPart.unlockCount} more ${bestPart.unlockCount === 1 ? 'experiment' : 'experiments'}.`
              : `Add this part to your kit and it advances ${bestPart.unlockCount} blocked ${bestPart.unlockCount === 1 ? 'experiment' : 'experiments'}.`}
          </p>
        </aside>
      )}

      {tracks.map((track) => {
        const inTrack = visible
          .filter((experiment) => experiment.track === track)
          .map((experiment, originalIndex) => ({
            experiment,
            originalIndex,
            canBuild: buildable(experiment, inventory),
            missing: missingParts(inventory, experiment.requires),
          }))
          .sort((a, b) => Number(b.canBuild) - Number(a.canBuild) || a.originalIndex - b.originalIndex);

        if (inTrack.length === 0) return null;

        return (
          <section key={track}>
            <h2 className="track">{TRACK_LABELS[track] ?? track}</h2>
            {inTrack.map(({ experiment, canBuild, missing }) => (
              <ExperimentCard
                key={experiment.id}
                experiment={experiment}
                level={level}
                buildable={canBuild}
                missing={missing}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
