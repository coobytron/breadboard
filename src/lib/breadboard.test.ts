import { describe, expect, it } from 'vitest';
import { holeToXY, parseHole, sameNet } from './breadboard';

describe('breadboard addressing', () => {
  it('recognises connected rows on the same side', () => {
    expect(sameNet('A5', 'E5')).toBe(true);
  });

  it('keeps the two sides separate across the centre channel', () => {
    expect(sameNet('E5', 'F5')).toBe(false);
  });

  it('does not connect adjacent rows', () => {
    expect(sameNet('A5', 'A6')).toBe(false);
  });

  it('connects only identical rails', () => {
    expect(sameNet('+top', '+top')).toBe(true);
    expect(sameNet('+top', '-top')).toBe(false);
  });

  it('fails soft for invalid holes', () => {
    expect(parseHole('K5')).toBeNull();
    expect(parseHole('A31')).toBeNull();
    expect(parseHole('')).toBeNull();
    expect(holeToXY('K5')).toBeNull();
  });

  it('uses a consistent 20-unit pitch within a side', () => {
    const a5 = holeToXY('A5');
    const b5 = holeToXY('B5');
    const a6 = holeToXY('A6');
    expect(b5 && a5 ? b5.x - a5.x : 0).toBe(20);
    expect(a6 && a5 ? a6.y - a5.y : 0).toBe(20);
  });
});
