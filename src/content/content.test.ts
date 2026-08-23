/**
 * The guard rail.
 *
 * This is the test that matters most for the ChatGPT workflow: if a generated or
 * hand-edited content file is malformed, or refers to a part that doesn't exist, or
 * forgets one of the three reading levels, `npm test` fails HERE - on the workbench,
 * not in the garage in front of the kids.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  experimentSchema,
  hazardSchema,
  organicSchema,
  partSchema,
} from './schemas';
import type { Experiment, Hazard, Organic, Part } from '../types';

const dir = join(process.cwd(), 'src/content');
const read = (f: string) => JSON.parse(readFileSync(join(dir, f), 'utf8'));

const parts: Part[] = read('parts.json');
const hazards: Hazard[] = read('hazards.json');
const organics: Organic[] = read('organics.json');

const experimentFiles = readdirSync(join(dir, 'experiments')).filter((f) => f.endsWith('.json'));
const experiments: Experiment[] = experimentFiles.map((f) => read(join('experiments', f)));

describe('parts.json', () => {
  it('every part matches the schema', () => {
    for (const part of parts) expect(() => partSchema.parse(part)).not.toThrow();
  });

  it('part ids are unique', () => {
    const ids = parts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every hazard a part names actually exists', () => {
    const known = new Set(hazards.map((h) => h.id));
    for (const part of parts) {
      for (const h of part.hazards) expect(known, `${part.id} -> ${h}`).toContain(h);
    }
  });
});

describe('hazards.json', () => {
  it('every hazard matches the schema', () => {
    for (const h of hazards) expect(() => hazardSchema.parse(h)).not.toThrow();
  });

  it('the laser hazard is gated and hidden from the youngest kids', () => {
    const laser = hazards.find((h) => h.id === 'laser-eye');
    expect(laser, 'laser-eye hazard must exist').toBeDefined();
    expect(laser!.severity).toBe('gate');
    expect(laser!.hiddenFrom).toContain('explorer');
  });
});

describe('organics.json', () => {
  it('every organic matches the schema', () => {
    for (const o of organics) expect(() => organicSchema.parse(o)).not.toThrow();
  });

  it('every organic can be measured somehow', () => {
    for (const o of organics) {
      expect(o.batteryVoltage ?? o.resistance, `${o.id} has no measurable range`).toBeDefined();
    }
  });
});

describe('experiments', () => {
  it('there is at least one experiment', () => {
    expect(experiments.length).toBeGreaterThan(0);
  });

  it('every experiment matches the schema', () => {
    for (const e of experiments) {
      expect(() => experimentSchema.parse(e), `${e.id} failed schema`).not.toThrow();
    }
  });

  it('experiment ids are unique', () => {
    const ids = experiments.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every required part exists in parts.json', () => {
    const known = new Set(parts.map((p) => p.id));
    for (const e of experiments) {
      for (const req of e.requires) {
        expect(known, `${e.id} requires unknown part "${req.partId}"`).toContain(req.partId);
      }
    }
  });

  it('every placed part exists in parts.json', () => {
    const known = new Set(parts.map((p) => p.id));
    for (const e of experiments) {
      for (const step of e.steps) {
        for (const pl of step.placements) {
          expect(known, `${e.id} places unknown part "${pl.partId}"`).toContain(pl.partId);
        }
      }
    }
  });

  it('every placement uses the right number of holes for that part', () => {
    const byId = new Map(parts.map((p) => [p.id, p]));
    for (const e of experiments) {
      for (const step of e.steps) {
        for (const pl of step.placements) {
          const part = byId.get(pl.partId)!;
          expect(
            pl.holes.length,
            `${e.id}: ${pl.partId} has ${part.pins} pins but ${pl.holes.length} holes`,
          ).toBe(part.pins);
        }
      }
    }
  });

  it('every hazard an experiment names actually exists', () => {
    const known = new Set(hazards.map((h) => h.id));
    for (const e of experiments) {
      for (const h of e.hazards) expect(known, `${e.id} -> ${h}`).toContain(h);
    }
  });

  it('any experiment using a laser carries the laser hazard', () => {
    for (const e of experiments) {
      const usesLaser = e.requires.some((r) => r.partId === 'laser-module');
      if (usesLaser) {
        expect(e.hazards, `${e.id} uses a laser without the laser-eye hazard`).toContain('laser-eye');
      }
    }
  });

  it('any experiment using an organic warns not to eat it', () => {
    const organicPartIds = new Set(
      parts.filter((p) => p.category === 'organic').map((p) => p.id),
    );
    for (const e of experiments) {
      const usesOrganic = e.requires.some((r) => organicPartIds.has(r.partId));
      if (usesOrganic) {
        expect(e.hazards, `${e.id} uses fruit without the do-not-eat hazard`).toContain('do-not-eat');
      }
    }
  });

  it('every experiment is written for all three ages', () => {
    for (const e of experiments) {
      for (const level of ['explorer', 'builder', 'engineer'] as const) {
        expect(e.hook[level], `${e.id} hook missing ${level}`).toBeTruthy();
        expect(e.bigIdea[level], `${e.id} bigIdea missing ${level}`).toBeTruthy();
        for (const [i, step] of e.steps.entries()) {
          expect(
            step.instruction[level],
            `${e.id} step ${i + 1} instruction missing ${level}`,
          ).toBeTruthy();
        }
      }
    }
  });
});
