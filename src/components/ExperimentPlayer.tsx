import { useState } from 'react';
import { experiments, hazards } from '../content';
import { needsAdultGate } from '../lib/safety';
import { useStepProgress } from '../hooks/useStepProgress';
import { READING_LEVELS, type ReadingLevel } from '../types';
import { AdultGate } from './AdultGate';
import { SafetyCard } from './SafetyCard';
import { StepView } from './StepView';

interface ExperimentPlayerProps {
  experimentId: string;
  level: ReadingLevel;
}

type Phase = 'safety' | 'steps' | 'finish';

function levelAllows(current: ReadingLevel, minimum: ReadingLevel): boolean {
  return READING_LEVELS.indexOf(current) >= READING_LEVELS.indexOf(minimum);
}

export function ExperimentPlayer({ experimentId, level }: ExperimentPlayerProps) {
  const experiment = experiments.find((candidate) => candidate.id === experimentId);
  const [phase, setPhase] = useState<Phase>('safety');
  const progress = useStepProgress(experimentId, experiment?.steps.length ?? 0);

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

  const adultHazards = needsAdultGate(experiment.hazards, hazards);
  const safetyScreen = (
    <section>
      <SafetyCard hazardIds={experiment.hazards} level={level} />
      <button type="button" onClick={() => setPhase('steps')} style={{ minHeight: 'var(--tap)' }}>
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
