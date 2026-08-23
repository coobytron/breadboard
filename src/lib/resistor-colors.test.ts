import { describe, expect, it } from 'vitest';
import { bandsFor } from './resistor-colors';

describe('bandsFor', () => {
  it('returns red red brown for 220 ohms', () => {
    expect(bandsFor(220)).toEqual(['red', 'red', 'brown']);
  });

  it('returns orange orange brown for 330 ohms', () => {
    expect(bandsFor(330)).toEqual(['orange', 'orange', 'brown']);
  });

  it('returns brown black red for 1k ohms', () => {
    expect(bandsFor(1000)).toEqual(['brown', 'black', 'red']);
  });

  it('returns brown black green for 1M ohms', () => {
    expect(bandsFor(1_000_000)).toEqual(['brown', 'black', 'green']);
  });
});
