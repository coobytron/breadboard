import { useMemo, useState } from 'react';
import { organicsById } from '../content';
import { useReadings } from '../hooks/useReadings';
import { checkRange } from '../lib/ranges';
import type { ReadingLevel } from '../types';

interface VoltageLoggerProps {
  organicId: string;
  level: ReadingLevel;
}

export function VoltageLogger({ organicId, level }: VoltageLoggerProps) {
  const organic = organicsById.get(organicId);
  const { addReading } = useReadings();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  const numericValue = Number(value);
  const validValue = value.trim() !== '' && Number.isFinite(numericValue) && numericValue >= 0;
  const rangeCheck = useMemo(() => {
    if (!organic?.batteryVoltage || !validValue) return null;
    return checkRange(numericValue, 'V', organic.batteryVoltage, organic.name.toLowerCase());
  }, [numericValue, organic, validValue]);

  if (!organic?.batteryVoltage) {
    return (
      <section className="card">
        <p>This material does not have a fruit-battery voltage range in the lab data.</p>
      </section>
    );
  }

  const save = () => {
    if (!validValue) return;
    addReading({
      organicId: organic.id,
      method: 'multimeter',
      value: numericValue,
      unit: 'V',
    });
    setSaved(true);
  };

  return (
    <section className="card" aria-labelledby={`voltage-${organic.id}`}>
      <h3 id={`voltage-${organic.id}`}>{organic.emoji} {organic.name} battery reading</h3>
      <label>
        <span>{level === 'explorer' ? 'What number did the meter show?' : 'Measured open-circuit voltage'}</span>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
            aria-label="Measured voltage"
            style={{ minHeight: 'var(--tap)', flex: 1 }}
          />
          <span style={{ alignSelf: 'center' }}>V</span>
        </div>
      </label>

      {rangeCheck && (
        <p
          aria-live="polite"
          style={{
            color: rangeCheck.verdict === 'in-range' ? 'var(--ok)' : 'var(--warn)',
            fontWeight: 600,
          }}
        >
          {numericValue}V — {rangeCheck.message[level]}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={!validValue}
        style={{ minHeight: 'var(--tap)' }}
      >
        {saved ? 'Saved' : level === 'explorer' ? 'Save my number' : 'Save reading'}
      </button>
    </section>
  );
}
