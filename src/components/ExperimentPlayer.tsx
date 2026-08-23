import { useState } from 'react';
import { badges, experiments, hazards } from '../content';
import { earnedBadges } from '../lib/badges';
import { needsAdultGate } from '../lib/safety';
import { useNotebook } from '../hooks/useNotebook';
import { useReadings } from '../hooks/useReadings';
import { useStepProgress } from '../hooks/useStepProgress';
import { READING_LEVELS, type LabEntry, type ReadingLevel } from '../types';
import { AdultGate } from './AdultGate';
import { BadgeShelf } from './BadgeShelf';
import { SafetyCard } from './SafetyCard';
import { StepView } from './StepView';

interface ExperimentPlayerProps {
  experimentId: string;
  level: ReadingLevel;
}

type Phase = 'safety' | 'steps' | 'finish';
type FinishedOutcome = Exclude<LabEntry['outcome'], 'in-progress'>;

function levelAllows(current: ReadingLevel, minimum: ReadingLevel): boolean {
  return READING_LEVELS.indexOf(current) >= READING_LEVELS.indexOf(minimum);
}

export function ExperimentPlayer({ experimentId, level }: ExperimentPlayerProps) {
  const experiment = experiments.find((candidate) => candidate.id === experimentId);
  const [phase, setPhase] = useState<Phase>('safety');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [recordedOutcome, setRecordedOutcome] = useState<FinishedOutcome | null>(null);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const progress = useStepProgress(experimentId, experiment?.steps.length ?? 0);
  const { entries, startEntry, completeEntry } = useNotebook();
  const { readings } = useReadings();

  if (!experiment) {
    return <section className="card"><h2>Experiment not found</h2></section>;
  }

  if (!levelAllows(level, experiment.minLevel)) {
    return (
      <section className="card">
        <h2>{experiment.title}</h2>
        <p>This experiment opens at the {experiment.minLevel} reading level.</p>
      </section>
    );
  }

  const findActiveEntry = () => [...entries]
    .reverse()
    .find((entry) => entry.experimentId === experiment.id && entry.outcome === 'in-progress');

  const beginSteps = () => {
    const existing = findActiveEntry();
    const entry = existing ?? startEntry(experiment.id);
    setActiveEntryId(entry.id);
    setRecordedOutcome(null);
    setNewBadgeIds([]);
    setPhase('steps');
  };

  const recordOutcome = (outcome: FinishedOutcome) => {
    let entryId = activeEntryId ?? findActiveEntry()?.id;
    let startedNow: LabEntry | null = null;

    if (!entryId) {
      startedNow = startEntry(experiment.id);
      entryId = startedNow.id;
      setActiveEntryId(entryId);
    }

    const beforeIds = new Set(earnedBadges(badges, entries, readings, experiments).map((badge) => badge.id));
    const completed = completeEntry(entryId, outcome);
    if (!completed) return;

    const projectedEntries = entries.some((entry) => entry.id === entryId)
      ? entries.map((entry) => entry.id === entryId ? completed : entry)
      : [...entries, completed];
    const after = earnedBadges(badges, projectedEntries, readings, experiments);

    setNewBadgeIds(after.filter((badge) => !beforeIds.has(badge.id)).map((badge) => badge.id));
    setRecordedOutcome(outcome);
  };

  const adultHazards = needsAdultGate(experiment.hazards, hazards);
  const safetyScreen = (
    <section>
      <SafetyCard hazardIds={experiment.hazards} level={level} />
      <button type="button" onClick={beginSteps} style={{ minHeight: 'var(--tap)' }}>
        {level === 'explorer' ? 'Ready to build!' : 'Start building'}
      </button>
    </section>
  );

  if (phase === 'safety') {
    return adultHazards.length > 0 ? (
      <AdultGate hazards={adultHazards} level={level} onConfirm={() => undefined}>
        {safetyScreen}
      </AdultGate>
    ) : safetyScreen;
  }

  if (phase === 'finish') {
    return (
      <section className="card">
        <h2>{level === 'explorer' ? 'You did it!' : 'Experiment complete'}</h2>
        <p>{experiment.bigIdea[level]}</p>

        <div>
          <h3>{level === 'explorer' ? 'Did it work?' : 'How did the build go?'}</h3>
          <div className="levels" role="group" aria-label="Experiment outcome">
            <button type="button" disabled={recordedOutcome !== null} onClick={() => recordOutcome('worked')}>✅ It worked</button>
            <button type="button" disabled={recordedOutcome !== null} onClick={() => recordOutcome('partly')}>🤔 Sort of</button>
            <button type="button" disabled={recordedOutcome !== null} onClick={() => recordOutcome('did-not-work')}>❌ Not yet</button>
          </div>
          {recordedOutcome && <p aria-live="polite">Saved to the lab notebook.</p>}
        </div>

        {newBadgeIds.length > 0 && (
          <BadgeShelf level={level} entries={entries} readings={readings} highlightIds={newBadgeIds} />
        )}

        {experiment.goFurther && experiment.goFurther.length > 0 && (
          <div>
            <h3>Go further</h3>
            <ul>
              {experiment.goFurther.map((prompt, index) => (
                <li key={index}>{prompt[level]}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="levels">
          <button type="button" onClick={() => setPhase('steps')}>Back to last step</button>
          <button
            type="button"
            onClick={() => {
              progress.reset();
              setActiveEntryId(null);
              setRecordedOutcome(null);
              setNewBadgeIds([]);
              setPhase('safety');
            }}
          >
            Build again
          </button>
        </div>
      </section>
    );
  }

  const step = experiment.steps[progress.index];
  if (!step) {
    return (
      <section className="card">
        <p>This experiment has no build steps yet.</p>
        <button type="button" onClick={() => setPhase('finish')}>See the big idea</button>
      </section>
    );
  }

  return (
    <section>
      <StepView
        key={progress.index}
        step={step}
        level={level}
        stepNumber={progress.index + 1}
        stepCount={experiment.steps.length}
      />
      <div className="levels" aria-label="Step controls">
        <button type="button" onClick={progress.back} disabled={progress.isFirst}>
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (progress.isLast) setPhase('finish');
            else progress.next();
          }}
        >
          {progress.isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </section>
  );
}
