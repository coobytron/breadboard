import { describe, expect, it } from 'vitest';
import { canLightLed, cellsNeeded, explainWhyDim, stackVoltage } from './cells';

describe('fruit cell stacks', () => {
  it('adds series cell voltages', () => {
    expect(stackVoltage(0.9, 4)).toBeCloseTo(3.6);
  });

  it('checks only the LED forward-voltage condition', () => {
    expect(canLightLed(0.9, 2.0)).toBe(false);
    expect(canLightLed(3.6, 2.0)).toBe(true);
  });

  it('calculates the minimum cells needed to clear forward voltage', () => {
    expect(cellsNeeded(0.9, 2.0)).toBe(3);
    // The content recommends four because real fruit cells sag under load and their high
    // internal resistance leaves very little LED current at the bare voltage threshold.
  });

  it('returns honest copy at every reading level', () => {
    const explanation = explainWhyDim(0.9, 4, 2.0);
    expect(explanation.explorer.length).toBeGreaterThan(0);
    expect(explanation.builder.length).toBeGreaterThan(0);
    expect(explanation.engineer.length).toBeGreaterThan(0);
  });
});
