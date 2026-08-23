import { describe, it, expect } from 'vitest';
import { checkRange, toOhms, rankByConductivity } from './ranges';

describe('toOhms', () => {
  it('normalises resistance units', () => {
    expect(toOhms(1, 'kohm')).toBe(1000);
    expect(toOhms(1, 'Mohm')).toBe(1_000_000);
    expect(toOhms(470, 'ohm')).toBe(470);
  });

  it('rejects units that are not resistance', () => {
    expect(() => toOhms(1, 'V')).toThrow();
  });
});

describe('checkRange', () => {
  const lemonVolts = { min: 0.8, max: 1.1, unit: 'V' } as const;

  it('accepts a healthy lemon reading', () => {
    const result = checkRange(0.9, 'V', lemonVolts, 'lemon');
    expect(result.verdict).toBe('in-range');
    expect(result.message.builder).toMatch(/normal range/);
  });

  it('flags a dead lemon', () => {
    expect(checkRange(0.2, 'V', lemonVolts, 'lemon').verdict).toBe('low');
  });

  it('flags an impossible lemon', () => {
    expect(checkRange(4, 'V', lemonVolts, 'lemon').verdict).toBe('high');
  });

  it('compares resistance across mixed units', () => {
    // 50 kohm reading against an expected range written in ohms
    const expected = { min: 10_000, max: 150_000, unit: 'ohm' } as const;
    expect(checkRange(50, 'kohm', expected, 'lemon').verdict).toBe('in-range');
  });

  it('always answers at all three reading levels', () => {
    const result = checkRange(0.9, 'V', lemonVolts, 'lemon');
    expect(result.message.explorer).toBeTruthy();
    expect(result.message.builder).toBeTruthy();
    expect(result.message.engineer).toBeTruthy();
  });
});

describe('rankByConductivity', () => {
  it('puts the least resistant thing first', () => {
    const ranked = rankByConductivity([
      { name: 'lemon', ohms: 50_000 },
      { name: 'pickle', ohms: 5_000 },
      { name: 'finger', ohms: 1_000_000 },
    ]);
    expect(ranked.map((r) => r.name)).toEqual(['pickle', 'lemon', 'finger']);
  });

  it('ranks the no-multimeter path by brightness instead', () => {
    const ranked = rankByConductivity([
      { name: 'apple', brightness: 2 },
      { name: 'pickle', brightness: 5 },
    ]);
    expect(ranked[0].name).toBe('pickle');
  });
});
