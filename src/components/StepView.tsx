import { useState } from 'react';
import { partsById } from '../content';
import type { ExperimentStep, ReadingLevel } from '../types';

interface StepViewProps {
  step: ExperimentStep;
  level: ReadingLevel;
  stepNumber: number;
  stepCount: number;
}

export function StepView({ step, level, stepNumber, stepCount }: StepViewProps) {
  const [showWhy, setShowWhy] = useState(false);
  const explanationOpen = level === 'engineer' || showWhy;

  return (
    <section className="card" aria-labelledby={`step-${stepNumber}-title`}>
      <p className="sub">Step {stepNumber} of {stepCount}</p>
      <h2 id={`step-${stepNumber}-title`}>{step.instruction[level]}</h2>

      {step.placements.length > 0 && (
        <div>
          <h3>Put these parts here</h3>
          <ul>
            {step.placements.map((placement, index) => {
              const part = partsById.get(placement.partId);
              const name = part?.name ?? placement.partId;
              const icon = part?.icon ?? '•';
              return (
                <li key={`${placement.partId}-${index}`}>
                  {icon} {name} → {placement.holes.join(' and ')}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {step.explanation && level !== 'engineer' && (
        <button
          type="button"
          aria-expanded={showWhy}
          onClick={() => setShowWhy((current) => !current)}
          style={{ minHeight: 'var(--tap)' }}
        >
          {showWhy ? 'Hide why' : 'Why?'}
        </button>
      )}

      {step.explanation && explanationOpen && (
        <aside style={{ opacity: 0.8 }}>
          <p>{step.explanation[level]}</p>
        </aside>
      )}

      {step.expect && (
        <aside className="card" aria-label="What to expect" style={{ borderColor: 'var(--accent)' }}>
          <strong>What should happen</strong>
          <p>{step.expect[level]}</p>
        </aside>
      )}
    </section>
  );
}
