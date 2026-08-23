import { useEffect, useMemo, useState } from 'react';
import { organics, organicsById } from '../content';
import { rankByConductivity, toOhms } from '../lib/ranges';
import { useReadings, type GuessStrength, type ReadingWithGuess } from '../hooks/useReadings';
import type { ExpectedRange, LeveledText, ReadingLevel } from '../types';
import { GuessFirst } from './GuessFirst';

interface LeaderboardProps {
  level: ReadingLevel;
}

type MeasurementMode = 'multimeter' | 'led-brightness';
type ResistanceUnit = Extract<ExpectedRange['unit'], 'ohm' | 'kohm' | 'Mohm'>;

interface RankedReading {
  reading: ReadingWithGuess;
  ohms?: number;
  brightness?: number;
}

const MODE_KEY = 'breadboard-buddy:reading-mode';

const copy = {
  title: {
    explorer: 'Which squishy thing wins?',
    builder: 'Conductivity leaderboard',
    engineer: 'Conductivity leaderboard',
  },
  choose: {
    explorer: 'Pick something to test',
    builder: 'Choose a material',
    engineer: 'Material under test',
  },
  meter: {
    explorer: 'Number machine',
    builder: 'Multimeter',
    engineer: 'Multimeter resistance',
  },
  brightness: {
    explorer: 'Light test',
    builder: 'LED brightness',
    engineer: 'LED brightness proxy',
  },
  save: {
    explorer: 'Put it on the board!',
    builder: 'Save result',
    engineer: 'Record measurement',
  },
  clear: {
    explorer: 'Start the board again',
    builder: 'Clear all results',
    engineer: 'Clear all readings',
  },
  why: {
    explorer: 'Why?',
    builder: 'Why did it do that?',
    engineer: 'Explain the result',
  },
  battery: {
    explorer: 'Some of these are tiny batteries too',
    builder: 'Fruit battery ranges — a different test',
    engineer: 'Expected open-circuit voltage — not part of the conductivity ranking',
  },
} satisfies Record<string, LeveledText>;

const guessFeedback = {
  match: {
    explorer: 'Good guess!',
    builder: 'Good guess!',
    engineer: 'Prediction matched.',
  },
  stronger: {
    explorer: 'Stronger than your guess!',
    builder: 'It conducted better than you predicted.',
    engineer: 'Conductivity was higher than predicted.',
  },
  weaker: {
    explorer: 'Weaker than your guess!',
    builder: 'It conducted less than you predicted.',
    engineer: 'Conductivity was lower than predicted.',
  },
} satisfies Record<string, LeveledText>;

function readMode(): MeasurementMode {
  if (typeof window === 'undefined') return 'multimeter';
  try {
    return window.localStorage.getItem(MODE_KEY) === 'led-brightness' ? 'led-brightness' : 'multimeter';
  } catch {
    return 'multimeter';
  }
}

function isResistanceUnit(unit: ExpectedRange['unit'] | undefined): unit is ResistanceUnit {
  return unit === 'ohm' || unit === 'kohm' || unit === 'Mohm';
}

function measuredStrength(reading: ReadingWithGuess, ohms?: number): GuessStrength {
  if (reading.method === 'led-brightness') {
    const brightness = reading.brightness ?? 0;
    if (brightness >= 4) return 'strong';
    if (brightness >= 2) return 'medium';
    return 'weak';
  }

  const resistance = ohms ?? Number.POSITIVE_INFINITY;
  if (resistance <= 30_000) return 'strong';
  if (resistance <= 500_000) return 'medium';
  return 'weak';
}

function feedbackFor(guess: GuessStrength, actual: GuessStrength): keyof typeof guessFeedback {
  if (guess === actual) return 'match';
  const rank: Record<GuessStrength, number> = { strong: 3, medium: 2, weak: 1 };
  return rank[actual] > rank[guess] ? 'stronger' : 'weaker';
}

function displayReading(reading: ReadingWithGuess): string {
  if (reading.method === 'led-brightness') return `${reading.brightness ?? 0}/5`;
  if (reading.value == null || !reading.unit) return '—';
  const unit = reading.unit === 'kohm' ? 'kΩ' : reading.unit === 'Mohm' ? 'MΩ' : reading.unit;
  return `${reading.value} ${unit}`;
}

export function Leaderboard({ level }: LeaderboardProps) {
  const { readings, addReading, clearAll } = useReadings();
  const [mode, setMode] = useState<MeasurementMode>(readMode);
  const [organicId, setOrganicId] = useState(organics[0]?.id ?? '');
  const [pendingGuess, setPendingGuess] = useState<GuessStrength | null>(null);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<ResistanceUnit>('kohm');
  const [brightness, setBrightness] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
      // Mode preference is optional; the lab still works without persistent storage.
    }
  }, [mode]);

  const organic = organicsById.get(organicId) ?? organics[0];

  const ranked = useMemo(() => {
    const comparable: RankedReading[] = [];

    for (const reading of readings) {
      if (reading.method !== mode) continue;

      if (reading.method === 'multimeter') {
        if (reading.value == null || !isResistanceUnit(reading.unit)) continue;
        comparable.push({ reading, ohms: toOhms(reading.value, reading.unit) });
      } else {
        comparable.push({ reading, brightness: reading.brightness ?? 0 });
      }
    }

    return rankByConductivity<RankedReading>(comparable);
  }, [mode, readings]);

  if (!organic) return null;

  const saveReading = () => {
    if (!pendingGuess) return;

    if (mode === 'multimeter') {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) return;
      addReading({
        organicId: organic.id,
        method: 'multimeter',
        value: numericValue,
        unit,
        guess: pendingGuess,
      });
      setValue('');
    } else {
      addReading({
        organicId: organic.id,
        method: 'led-brightness',
        brightness,
        guess: pendingGuess,
      });
      setBrightness(0);
    }

    setPendingGuess(null);
  };

  const maxIndex = Math.max(1, ranked.length - 1);

  return (
    <section>
      <h2>{copy.title[level]}</h2>

      <div className="levels" role="group" aria-label={copy.title[level]}>
        <button type="button" aria-pressed={mode === 'multimeter'} onClick={() => setMode('multimeter')}>
          {copy.meter[level]}
        </button>
        <button type="button" aria-pressed={mode === 'led-brightness'} onClick={() => setMode('led-brightness')}>
          {copy.brightness[level]}
        </button>
      </div>

      <label className="card" style={{ display: 'block' }}>
        <span>{copy.choose[level]}</span>
        <select
          value={organic.id}
          onChange={(event) => {
            setOrganicId(event.target.value);
            setPendingGuess(null);
          }}
          style={{ display: 'block', minHeight: 'var(--tap)', marginTop: '0.5rem', width: '100%' }}
        >
          {organics.filter((item) => item.resistance).map((item) => (
            <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>
          ))}
        </select>
      </label>

      {!pendingGuess ? (
        <GuessFirst organic={organic} level={level} onGuess={setPendingGuess} />
      ) : (
        <section className="card">
          {mode === 'multimeter' ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-label={copy.meter[level]}
                style={{ minHeight: 'var(--tap)', flex: '1 1 8rem' }}
              />
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value as ResistanceUnit)}
                aria-label={copy.meter[level]}
                style={{ minHeight: 'var(--tap)' }}
              >
                <option value="ohm">Ω</option>
                <option value="kohm">kΩ</option>
                <option value="Mohm">MΩ</option>
              </select>
            </div>
          ) : (
            <div className="levels" role="group" aria-label={copy.brightness[level]}>
              {([0, 1, 2, 3, 4, 5] as const).map((score) => (
                <button
                  key={score}
                  type="button"
                  aria-pressed={brightness === score}
                  onClick={() => setBrightness(score)}
                >
                  {score}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={saveReading} style={{ minHeight: 'var(--tap)' }}>
            {copy.save[level]}
          </button>
        </section>
      )}

      <div>
        {ranked.map((entry, index) => {
          const item = organicsById.get(entry.reading.organicId);
          if (!item) return null;
          const actual = measuredStrength(entry.reading, entry.ohms);
          const feedback = entry.reading.guess ? feedbackFor(entry.reading.guess, actual) : null;
          const width = Math.max(25, 100 - (index * 75) / maxIndex);
          const expanded = expandedId === entry.reading.id;

          return (
            <article key={entry.reading.id} className="card">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : entry.reading.id)}
                aria-expanded={expanded}
                style={{ width: '100%', minHeight: 'var(--tap)', textAlign: 'left' }}
              >
                <strong>{index + 1}. {item.emoji} {item.name}</strong> — {displayReading(entry.reading)}
              </button>
              <div aria-hidden="true" style={{ height: '0.6rem', marginTop: '0.6rem', background: 'var(--surface-2)', borderRadius: '999px' }}>
                <div style={{ width: `${width}%`, height: '100%', background: 'var(--accent)', borderRadius: '999px' }} />
              </div>
              {feedback && <p>{guessFeedback[feedback][level]}</p>}
              {expanded && (
                <div>
                  <strong>{copy.why[level]}</strong>
                  <p>{item.why[level]}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {readings.length > 0 && (
        <button type="button" onClick={clearAll} style={{ minHeight: 'var(--tap)' }}>
          {copy.clear[level]}
        </button>
      )}

      <section className="card" style={{ marginTop: '1rem' }}>
        <h3>{copy.battery[level]}</h3>
        {organics.filter((item) => item.batteryVoltage).map((item) => (
          <p key={item.id}>
            {item.emoji} {item.name}{level === 'explorer' ? '' : `: ${item.batteryVoltage?.min}–${item.batteryVoltage?.max} ${item.batteryVoltage?.unit}`}
          </p>
        ))}
      </section>
    </section>
  );
}
