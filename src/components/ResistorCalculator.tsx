import { useMemo, useState } from 'react';
import { parts } from '../content';
import { sizeLedResistor } from '../lib/ohms-law';
import { bandsFor } from '../lib/resistor-colors';
import type { LeveledText, ReadingLevel } from '../types';

interface ResistorCalculatorProps {
  level: ReadingLevel;
}

const SUPPLY_PRESETS = [3, 4.5, 6, 9];

const labels = {
  supply: {
    explorer: 'Pick your battery',
    builder: 'Pick the battery voltage',
    engineer: 'Supply voltage',
  },
  led: {
    explorer: 'Pick your light',
    builder: 'Pick the LED',
    engineer: 'LED',
  },
  target: {
    explorer: 'Light power',
    builder: 'LED current',
    engineer: 'Target current',
  },
} satisfies Record<string, LeveledText>;

const weakSupply: LeveledText = {
  explorer: 'This battery is too small for this light.',
  builder: "That battery isn't strong enough to light this LED at all.",
  engineer: 'The supply voltage must be higher than the LED forward voltage.',
};

const wattageWarning: LeveledText = {
  explorer: 'Ask a grown-up for a bigger resistor.',
  builder: 'This resistor may get too hot. Use one rated for more power.',
  engineer: "A standard ¼W resistor isn't enough at this operating point.",
};

function resultText(
  level: ReadingLevel,
  recommendedOhms: number,
  bands: string[],
  idealOhms: number,
  actualCurrentMa: number,
  powerWatts: number,
  supplyVolts: number,
  forwardVolts: number,
  targetMa: number,
): string {
  if (level === 'explorer') {
    return `Use this one: ${recommendedOhms}Ω — ${bands.join(' ')}`;
  }

  if (level === 'builder') {
    return `Use ${recommendedOhms}Ω. This is the brake that keeps your light safe. Bands: ${bands.join(' ')}.`;
  }

  return `Ideal ${idealOhms.toFixed(0)}Ω → use ${recommendedOhms}Ω. Actual current ${actualCurrentMa.toFixed(1)}mA. Resistor power ${powerWatts.toFixed(3)}W. Working: (${supplyVolts} − ${forwardVolts}) / ${(targetMa / 1000).toFixed(3)} = ${idealOhms.toFixed(0)}Ω.`;
}

export function ResistorCalculator({ level }: ResistorCalculatorProps) {
  const ledParts = useMemo(
    () => parts.filter((part) => part.category === 'output' && part.id.startsWith('led-') && part.electrical?.forwardVoltage !== undefined),
    [],
  );
  const [supplyVolts, setSupplyVolts] = useState(9);
  const [selectedLedId, setSelectedLedId] = useState(ledParts[0]?.id ?? '');
  const [engineerTargetMa, setEngineerTargetMa] = useState(20);

  const selectedLed = ledParts.find((part) => part.id === selectedLedId) ?? ledParts[0];
  const targetMa = level === 'engineer' ? engineerTargetMa : 20;

  const calculation = useMemo(() => {
    const forwardVolts = selectedLed?.electrical?.forwardVoltage;
    if (forwardVolts === undefined) return null;

    try {
      return { advice: sizeLedResistor(supplyVolts, forwardVolts, targetMa), error: false } as const;
    } catch {
      return { advice: null, error: true } as const;
    }
  }, [selectedLed, supplyVolts, targetMa]);

  if (!selectedLed) return null;

  const forwardVolts = selectedLed.electrical?.forwardVoltage ?? 0;
  const advice = calculation?.advice ?? null;
  const bands = advice ? bandsFor(advice.recommendedOhms) : [];

  return (
    <section className="card" aria-label="Resistor calculator">
      <h2>{labels.supply[level]}</h2>
      <div className="levels" role="group" aria-label={labels.supply[level]}>
        {SUPPLY_PRESETS.map((volts) => (
          <button
            key={volts}
            type="button"
            aria-pressed={supplyVolts === volts}
            onClick={() => setSupplyVolts(volts)}
          >
            {volts}V
          </button>
        ))}
      </div>

      <label>
        <span>{labels.led[level]}</span>
        <select value={selectedLed.id} onChange={(event) => setSelectedLedId(event.target.value)}>
          {ledParts.map((part) => (
            <option key={part.id} value={part.id}>{part.name}</option>
          ))}
        </select>
      </label>

      {level === 'engineer' && (
        <label style={{ display: 'block', marginTop: '1rem' }}>
          <span>{labels.target[level]}: {engineerTargetMa}mA</span>
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={engineerTargetMa}
            onChange={(event) => setEngineerTargetMa(Number(event.target.value))}
            style={{ width: '100%' }}
          />
        </label>
      )}

      <div style={{ marginTop: '1rem' }} aria-live="polite">
        {calculation?.error && <p>{weakSupply[level]}</p>}
        {advice && (
          <>
            <div
              aria-label={`${advice.recommendedOhms} ohm resistor: ${bands.join(', ')}`}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                gap: '0.35rem',
                width: '12rem',
                height: '3.25rem',
                margin: '0.75rem 0',
                padding: '0 2.5rem',
                borderRadius: '1.5rem',
                background: '#d7b77a',
                border: '2px solid #8b6b3f',
              }}
            >
              {bands.map((band, index) => (
                <span key={`${band}-${index}`} aria-hidden="true" style={{ width: '0.75rem', background: band }} />
              ))}
            </div>
            <p>{resultText(
              level,
              advice.recommendedOhms,
              bands,
              advice.idealOhms,
              advice.actualCurrentMa,
              advice.powerWatts,
              supplyVolts,
              forwardVolts,
              targetMa,
            )}</p>
            {advice.needsBiggerWattage && <p style={{ color: 'var(--warn)' }}>{wattageWarning[level]}</p>}
          </>
        )}
      </div>
    </section>
  );
}
