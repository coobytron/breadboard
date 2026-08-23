import { describe, it, expect } from 'vitest';
import {
  sizeLedResistor,
  nextStandardResistor,
  seriesCurrentMa,
  willBurnOut,
} from './ohms-law';

describe('sizeLedResistor', () => {
  it('sizes a red LED on a 9V battery to 330 ohms or more', () => {
    const advice = sizeLedResistor(9, 2.0, 20);
    // (9 - 2) / 0.02 = 350 ohms ideal
    expect(advice.idealOhms).toBeCloseTo(350, 1);
    expect(advice.recommendedOhms).toBe(390); // next E12 value at or above 350
    expect(advice.actualCurrentMa).toBeLessThan(20);
  });

  it('sizes a red LED on a 6V AA pack more gently', () => {
    const advice = sizeLedResistor(6, 2.0, 20);
    expect(advice.idealOhms).toBeCloseTo(200, 1);
    expect(advice.recommendedOhms).toBe(220);
  });

  it('never recommends a resistor that over-drives the LED', () => {
    for (const supply of [3, 4.5, 6, 9, 12]) {
      const advice = sizeLedResistor(supply, 2.0, 20);
      expect(advice.actualCurrentMa).toBeLessThanOrEqual(20);
    }
  });

  it('stays inside a quarter-watt resistor for normal LED circuits', () => {
    expect(sizeLedResistor(9, 2.0, 20).needsBiggerWattage).toBe(false);
  });

  it('refuses a supply that cannot light the LED at all', () => {
    expect(() => sizeLedResistor(1.5, 2.0, 20)).toThrow(/never light/);
  });
});

describe('nextStandardResistor', () => {
  it('rounds up to a real resistor value', () => {
    expect(nextStandardResistor(350)).toBe(390);
    expect(nextStandardResistor(220)).toBe(220);
    expect(nextStandardResistor(1)).toBe(10);
  });
});

describe('seriesCurrentMa', () => {
  it('applies Ohms law', () => {
    expect(seriesCurrentMa(9, 1000)).toBeCloseTo(9, 5);
  });

  it('treats zero resistance as an error, not infinity', () => {
    expect(() => seriesCurrentMa(9, 0)).toThrow(/short circuit/);
  });
});

describe('willBurnOut', () => {
  it('flags an LED wired straight across a battery', () => {
    expect(willBurnOut(9, 2.0, 0, 20)).toBe(true);
  });

  it('is happy with a properly sized resistor', () => {
    expect(willBurnOut(9, 2.0, 390, 20)).toBe(false);
  });

  it('flags a resistor that is too small', () => {
    expect(willBurnOut(9, 2.0, 100, 20)).toBe(true);
  });
});
