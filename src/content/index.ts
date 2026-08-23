/**
 * Loads and validates all content at import time.
 *
 * Vite's `import.meta.glob` with `eager: true` pulls in every experiment JSON file,
 * so adding a new experiment is literally just dropping a file into
 * src/content/experiments/ - no registry to update, nothing to wire up.
 */
import type { Experiment, Hazard, Organic, Part } from '../types';
import { experimentSchema, hazardSchema, organicSchema, partSchema } from './schemas';
import partsRaw from './parts.json';
import hazardsRaw from './hazards.json';
import organicsRaw from './organics.json';

export const parts: Part[] = partsRaw.map((p) => partSchema.parse(p) as Part);
export const hazards: Hazard[] = hazardsRaw.map((h) => hazardSchema.parse(h) as Hazard);
export const organics: Organic[] = organicsRaw.map((o) => organicSchema.parse(o) as Organic);

const experimentModules = import.meta.glob<{ default: unknown }>(
  './experiments/*.json',
  { eager: true },
);

export const experiments: Experiment[] = Object.values(experimentModules)
  .map((m) => experimentSchema.parse(m.default) as Experiment)
  .sort((a, b) => a.track.localeCompare(b.track) || a.order - b.order);

export const partsById = new Map(parts.map((p) => [p.id, p]));
export const hazardsById = new Map(hazards.map((h) => [h.id, h]));
export const organicsById = new Map(organics.map((o) => [o.id, o]));
