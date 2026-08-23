import { useState } from 'react';
import { partsById } from '../content';
import { canLightLed, cellsNeeded, explainWhyDim, stackVoltage } from '../lib/cells';
import type { ReadingLevel } from '../types';

interface CellStackProps {
  level: ReadingLevel;
}

const NOMINAL_LEMON_VOLTS = 0.9;

export function CellStack({ level }: CellStackProps) {
  const [count, setCount] = useState(1);
  const redLedForwardVolts = partsById.get('led-red')?.electrical?.forwardVoltage ?? 2.0;
  const totalVolts = stackVoltage(NOMINAL_LEMON_VOLTS, count);
  const clearsVoltage = canLightLed(totalVolts, redLedForwardVolts);
  const minimumCells = cellsNeeded(NOMINAL_LEMON_VOLTS, redLedForwardVolts);
  const explanation = explainWhyDim(NOMINAL_LEMON_VOLTS, count, redLedForwardVolts);

  return (
    <section className="card" aria-labelledby="cell-stack-title">
      <h3 id="cell-stack-title">{level === 'explorer' ? 'How many lemon batteries?' : 'Lemon cells in series'}</h3>

      <div
        aria-label={`${count} lemon ${count === 1 ? 'cell' : 'cells'} in series`}
        style={{ fontSize: '2rem', letterSpacing: '0.15rem', overflowWrap: 'anywhere' }}
      >
        {Array.from({ length: count }, (_, index) => <span key={index} aria-hidden="true">🍋</span>)}
      </div>

      <div className="levels" role="group" aria-label="Number of lemon cells">
        <button
          type="button"
          onClick={() => setCount((current) => Math.max(1, current - 1))}
          disabled={count <= 1}
          aria-label="Remove one lemon cell"
        >
          −
        </button>
        <output style={{ alignSelf: 'center', minWidth: '5rem', textAlign: 'center' }}>{count} × 🍋</output>
        <button
          type="button"
          onClick={() => setCount((current) => Math.min(8, current + 1))}
          disabled={count >= 8}
          aria-label="Add one lemon cell"
        >
          +
        </button>
      </div>

      <p>
        <strong>{totalVolts.toFixed(1)}V total.</strong>{' '}
        {clearsVoltage
          ? level === 'explorer'
            ? 'That is enough voltage to wake up a red light.'
            : `This clears the red LED's roughly ${redLedForwardVolts.toFixed(1)}V forward-voltage threshold.`
          : level === 'explorer'
            ? 'Not enough voltage to wake up a red light yet.'
            : `Below the red LED's roughly ${redLedForwardVolts.toFixed(1)}V forward-voltage threshold.`}
      </p>

      {level !== 'explorer' && (
        <p className="sub">
          The arithmetic minimum is {minimumCells} cells; the experiment recommends 4 or more because real fruit cells sag under load.
        </p>
      )}

      <aside style={{ color: clearsVoltage && count >= 4 ? 'var(--ok)' : 'var(--warn)' }}>
        <strong>
          {count >= 4 && clearsVoltage
            ? level === 'explorer' ? 'Look for a tiny glow in a dark room.' : 'Realistic expectation: a very faint glow in a dark room.'
            : level === 'explorer' ? 'Keep stacking lemons.' : 'Voltage alone is not enough for a useful LED current.'}
        </strong>
        <p>{explanation[level]}</p>
      </aside>
    </section>
  );
}
