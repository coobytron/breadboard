import type { Hole } from '../types';

export type ParsedHole =
  | { kind: 'grid'; col: string; row: number }
  | { kind: 'rail'; rail: Hole };

const RAILS = new Set<Hole>(['+top', '-top', '+bottom', '-bottom']);
const COLUMNS = 'ABCDEFGHIJ';

/** Geometry uses 20 SVG units per 0.1-inch breadboard pitch. */
const PITCH = 20;
const GRID_X = 90;
const GRID_Y = 80;
const CHANNEL_GAP = 20;

export function parseHole(hole: Hole): ParsedHole | null {
  if (RAILS.has(hole)) return { kind: 'rail', rail: hole };

  const match = /^([A-J])([1-9]|[12]\d|30)$/.exec(hole);
  if (!match) return null;

  return { kind: 'grid', col: match[1], row: Number(match[2]) };
}

export function holeToXY(hole: Hole): { x: number; y: number } | null {
  const parsed = parseHole(hole);
  if (!parsed) return null;

  if (parsed.kind === 'rail') {
    const railY: Record<string, number> = {
      '+top': 20,
      '-top': 42,
      '+bottom': 700,
      '-bottom': 722,
    };
    return { x: 200, y: railY[parsed.rail] };
  }

  const columnIndex = COLUMNS.indexOf(parsed.col);
  const channelOffset = columnIndex >= 5 ? CHANNEL_GAP : 0;
  return {
    x: GRID_X + columnIndex * PITCH + channelOffset,
    y: GRID_Y + (parsed.row - 1) * PITCH,
  };
}

export function sameNet(a: Hole, b: Hole): boolean {
  const first = parseHole(a);
  const second = parseHole(b);
  if (!first || !second) return false;

  if (first.kind === 'rail' || second.kind === 'rail') {
    return first.kind === 'rail' && second.kind === 'rail' && first.rail === second.rail;
  }

  if (first.row !== second.row) return false;
  const firstSide = COLUMNS.indexOf(first.col) <= 4 ? 'left' : 'right';
  const secondSide = COLUMNS.indexOf(second.col) <= 4 ? 'left' : 'right';
  return firstSide === secondSide;
}
