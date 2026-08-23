/**
 * Resistor sizing. This is the single most useful piece of maths in the app: it is
 * what stops a kid burning out an LED, and it is what the app quotes in every
 * experiment step.
 *
 * Pure functions, no React, fully tested. If ChatGPT rewrites these, the tests catch it.
 */

/** Standard E12 resistor values commonly found in a beginner assortment kit. */
export const E12_SERIES = [
  10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
  100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
  1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
  10000, 22000, 47000, 100000, 220000, 470000, 1000000,
];

export interface ResistorAdvice {
  /** The exact value Ohm's law asks for. */
  idealOhms: number;
  /** The nearest real resistor that is >= ideal (never under - that over-drives the LED). */
  recommendedOhms: number;
  /** Actual current through the LED with the recommended resistor, in mA. */
  actualCurrentMa: number;
  /** Power the resistor will dissipate, in watts. Over 0.25W needs a bigger resistor. */
  powerWatts: number;
  /** True if a standard quarter-watt resistor is not enough. */
  needsBiggerWattage: boolean;
}

/**
 * Size a series resistor for an LED.
 *
 * @param supplyVolts    battery voltage, e.g. 9
 * @param forwardVolts   LED forward voltage, e.g. 2.0 for red
 * @param targetMa       desired current in milliamps, e.g. 20
 */
export function sizeLedResistor(
  supplyVolts: number,
  forwardVolts: number,
  targetMa: number,
): ResistorAdvice {
  if (supplyVolts <= forwardVolts) {
    throw new Error(
      `Supply (${supplyVolts}V) must exceed the LED forward voltage (${forwardVolts}V) or it will never light.`,
    );
  }
  if (targetMa <= 0) throw new Error('targetMa must be positive');

  const volts = supplyVolts - forwardVolts;
  const idealOhms = volts / (targetMa / 1000);
  const recommendedOhms = nextStandardResistor(idealOhms);
  const actualAmps = volts / recommendedOhms;

  return {
    idealOhms,
    recommendedOhms,
    actualCurrentMa: actualAmps * 1000,
    powerWatts: actualAmps * actualAmps * recommendedOhms,
    needsBiggerWattage: actualAmps * actualAmps * recommendedOhms > 0.25,
  };
}

/** Nearest E12 value at or above `ohms`. Rounding UP keeps the LED safe. */
export function nextStandardResistor(ohms: number): number {
  const found = E12_SERIES.find((v) => v >= ohms);
  return found ?? E12_SERIES[E12_SERIES.length - 1];
}

/** Current through a simple series loop, in milliamps. */
export function seriesCurrentMa(supplyVolts: number, totalOhms: number): number {
  if (totalOhms <= 0) throw new Error('Resistance must be positive - that would be a short circuit.');
  return (supplyVolts / totalOhms) * 1000;
}

/**
 * Would this wiring destroy the LED? Used for the burnout warning.
 * An LED with no series resistance is limited only by its own bulk resistance, so
 * treat "no resistor" as certain death.
 */
export function willBurnOut(
  supplyVolts: number,
  forwardVolts: number,
  seriesOhms: number,
  maxCurrentMa: number,
): boolean {
  if (seriesOhms <= 0) return supplyVolts > forwardVolts;
  const currentMa = ((supplyVolts - forwardVolts) / seriesOhms) * 1000;
  return currentMa > maxCurrentMa;
}
