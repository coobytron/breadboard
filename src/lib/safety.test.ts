import { describe, expect, it } from 'vitest';
import { hazards } from '../content';
import type { HazardId } from '../types';
import { isHiddenAtLevel, needsAdultGate, sortHazards } from './safety';

describe('safety helpers', () => {
  it('hides laser content from explorer level', () => {
    expect(isHiddenAtLevel(['laser-eye'], 'explorer', hazards)).toBe(true);
  });

  it('does not hide laser content from builder level', () => {
    expect(isHiddenAtLevel(['laser-eye'], 'builder', hazards)).toBe(false);
  });

  it('does not hide do-not-eat content from explorer level', () => {
    expect(isHiddenAtLevel(['do-not-eat'], 'explorer', hazards)).toBe(false);
  });

  it('returns only gate hazards for adult confirmation', () => {
    const gated = needsAdultGate(['laser-eye', 'sharp'], hazards);
    expect(gated).toHaveLength(1);
    expect(gated[0]?.id).toBe('laser-eye');
  });

  it('skips unknown hazard ids without throwing', () => {
    const unknown = 'unknown-hazard' as HazardId;
    expect(() => isHiddenAtLevel([unknown], 'explorer', hazards)).not.toThrow();
    expect(needsAdultGate([unknown], hazards)).toEqual([]);
    expect(sortHazards([unknown], hazards)).toEqual([]);
  });

  it('sorts gate before warn before note', () => {
    expect(sortHazards(['sharp', 'do-not-eat', 'laser-eye'], hazards).map((hazard) => hazard.id)).toEqual([
      'laser-eye',
      'do-not-eat',
      'sharp',
    ]);
  });
});
