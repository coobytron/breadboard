/**
 * "Is my reading normal?" - the feedback loop that makes the Fruit Lab feel like
 * science instead of data entry. A kid measures 0.9V on a lemon and the app says
 * "right in range!" rather than silently storing a number.
 */
import type { ExpectedRange, ReadingLevel } from '../types';

export type Verdict = 'in-range' | 'low' | 'high';

export interface RangeCheck {
  verdict: Verdict;
  /** Kid-facing response, per reading level. */
  message: Record<ReadingLevel, string>;
}

/** Normalise any resistance-ish unit to plain ohms so readings can be compared. */
export function toOhms(value: number, unit: ExpectedRange['unit']): number {
  switch (unit) {
    case 'ohm': return value;
    case 'kohm': return value * 1_000;
    case 'Mohm': return value * 1_000_000;
    default:
      throw new Error(`${unit} is not a resistance unit`);
  }
}

export function checkRange(
  value: number,
  unit: ExpectedRange['unit'],
  expected: ExpectedRange,
  label: string,
): RangeCheck {
  const isResistance = ['ohm', 'kohm', 'Mohm'].includes(unit);
  const v = isResistance ? toOhms(value, unit) : value;
  const min = isResistance ? toOhms(expected.min, expected.unit) : expected.min;
  const max = isResistance ? toOhms(expected.max, expected.unit) : expected.max;

  if (v < min) {
    return {
      verdict: 'low',
      message: {
        explorer: `Ooh, that's a small number for a ${label}!`,
        builder: `That's lower than we expected for a ${label}. Push the probes in a bit further and try again.`,
        engineer: `Below the expected range for ${label}. Check probe contact area and spacing - poor contact reads low on voltage and high on resistance.`,
      },
    };
  }
  if (v > max) {
    return {
      verdict: 'high',
      message: {
        explorer: `Wow, that's a big number for a ${label}!`,
        builder: `That's higher than we expected for a ${label}. Are the probes touching each other, or is one loose?`,
        engineer: `Above the expected range for ${label}. Verify the probes aren't shorting, and that you're on the right meter range.`,
      },
    };
  }
  return {
    verdict: 'in-range',
    message: {
      explorer: `That's just right for a ${label}!`,
      builder: `Nice - that's right in the normal range for a ${label}.`,
      engineer: `Within the expected range for ${label}. Good measurement.`,
    },
  };
}

/**
 * Rank readings for the conductivity leaderboard: least resistance first.
 * Handles the no-multimeter path too, where brightness stands in for conductance.
 */
export function rankByConductivity<T extends { ohms?: number; brightness?: number }>(
  readings: T[],
): T[] {
  return [...readings].sort((a, b) => {
    if (a.ohms != null && b.ohms != null) return a.ohms - b.ohms;
    if (a.brightness != null && b.brightness != null) return b.brightness - a.brightness;
    // Measured readings always outrank guessed ones.
    return a.ohms != null ? -1 : 1;
  });
}
