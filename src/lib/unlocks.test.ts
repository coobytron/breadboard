import { describe, expect, it } from 'vitest';
import type { Experiment, InventoryItem } from '../types';
import { buildable, nextBestPart } from './unlocks';

function experiment(id: string, requires: InventoryItem[]): Experiment {
  const text = { explorer: id, builder: id, engineer: id };
  return {
    id,
    title: id,
    hook: text,
    track: 'basics',
    order: 1,
    requires,
    hazards: [],
    minLevel: 'explorer',
    estimatedMinutes: 1,
    steps: [],
    bigIdea: text,
  };
}

describe('experiment unlocks', () => {
  it('buildable is false empty and true once requirements are met', () => {
    const target = experiment('light', [
      { partId: 'breadboard', quantity: 1 },
      { partId: 'jumper-wires', quantity: 2 },
    ]);

    expect(buildable(target, [])).toBe(false);
    expect(buildable(target, [
      { partId: 'breadboard', quantity: 1 },
      { partId: 'jumper-wires', quantity: 2 },
    ])).toBe(true);
  });

  it('nextBestPart picks the missing part shared by the most blocked experiments', () => {
    const experiments = [
      experiment('one', [{ partId: 'led-red', quantity: 1 }]),
      experiment('two', [{ partId: 'led-red', quantity: 1 }, { partId: 'breadboard', quantity: 1 }]),
      experiment('three', [{ partId: 'resistor-330', quantity: 1 }]),
    ];

    expect(nextBestPart(experiments, [])).toEqual({ partId: 'led-red', unlockCount: 2 });
  });

  it('nextBestPart returns null when everything is buildable', () => {
    const experiments = [experiment('one', [{ partId: 'led-red', quantity: 1 }])];
    expect(nextBestPart(experiments, [{ partId: 'led-red', quantity: 1 }])).toBeNull();
  });
});
