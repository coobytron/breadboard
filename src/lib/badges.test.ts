import { describe, expect, it } from 'vitest';
import type { Badge, Experiment, LabEntry, OrganicReading } from '../types';
import { earnedBadges } from './badges';

const text = { explorer: 'x', builder: 'x', engineer: 'x' };

function experiment(id: string, track: Experiment['track']): Experiment {
  return {
    id,
    title: id,
    hook: text,
    track,
    order: 1,
    requires: [],
    hazards: [],
    minLevel: 'explorer',
    estimatedMinutes: 1,
    steps: [{ instruction: text, placements: [] }],
    bigIdea: text,
  };
}

function entry(experimentId: string, outcome: LabEntry['outcome'] = 'worked'): LabEntry {
  return {
    id: `entry-${experimentId}-${outcome}`,
    experimentId,
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:01:00.000Z',
    outcome,
    photoKeys: [],
  };
}

function badge(id: string, criteria: Badge['criteria']): Badge {
  return { id, name: id, emoji: '🏅', description: text, criteria };
}

function reading(organicId: string): OrganicReading {
  return {
    id: `reading-${organicId}`,
    organicId,
    measuredAt: '2026-01-01T00:00:00.000Z',
    method: 'multimeter',
    value: 1,
    unit: 'V',
  };
}

describe('earnedBadges', () => {
  it('earns a complete-experiment badge only for a worked entry', () => {
    const target = badge('button', { type: 'complete-experiment', experimentId: 'button-light' });
    expect(earnedBadges([target], [entry('button-light')], [], []).map((item) => item.id)).toEqual(['button']);
    expect(earnedBadges([target], [entry('button-light', 'did-not-work')], [], [])).toEqual([]);
  });

  it('earns the first-light criteria', () => {
    const target = badge('first', { type: 'first-light' });
    expect(earnedBadges([target], [entry('first-light')], [], []).map((item) => item.id)).toEqual(['first']);
  });

  it('earns organics-measured from distinct organic ids', () => {
    const target = badge('fruit', { type: 'organics-measured', count: 2 });
    expect(earnedBadges([target], [entry('other')], [reading('lemon'), reading('potato')], []).map((item) => item.id)).toEqual(['fruit']);
  });

  it('earns complete-track only when every experiment in a non-empty track worked', () => {
    const target = badge('basics', { type: 'complete-track', track: 'basics' });
    const experiments = [experiment('one', 'basics'), experiment('two', 'basics')];
    expect(earnedBadges([target], [entry('one')], [], experiments)).toEqual([]);
    expect(earnedBadges([target], [entry('one'), entry('two')], [], experiments).map((item) => item.id)).toEqual(['basics']);
  });

  it('ignores an unknown criteria type without throwing', () => {
    const unknown = {
      id: 'future',
      name: 'Future',
      emoji: '🔮',
      description: text,
      criteria: { type: 'future-criteria' },
    } as unknown as Badge;

    expect(() => earnedBadges([unknown], [], [], [])).not.toThrow();
    expect(earnedBadges([unknown], [], [], [])).toEqual([]);
  });
});
