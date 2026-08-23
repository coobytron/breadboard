/**
 * Zod mirrors of src/types/index.ts.
 *
 * Content lives in JSON so that new experiments can be added without touching app
 * code. These schemas are what stops a malformed experiment from white-screening the
 * app in front of a five-year-old: content.test.ts validates every file at test time,
 * so a bad paste fails `npm test` instead of failing in the garage.
 */
import { z } from 'zod';

export const readingLevelSchema = z.enum(['explorer', 'builder', 'engineer']);

export const leveledTextSchema = z.object({
  explorer: z.string().min(1),
  builder: z.string().min(1),
  engineer: z.string().min(1),
});

export const hazardIdSchema = z.enum([
  'laser-eye',
  'do-not-eat',
  'hot-part',
  'sharp',
  'battery-short',
  'small-parts',
]);

export const hazardSchema = z.object({
  id: hazardIdSchema,
  title: z.string().min(1),
  rule: leveledTextSchema,
  severity: z.enum(['note', 'warn', 'gate']),
  hiddenFrom: z.array(readingLevelSchema),
});

export const partSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    'power', 'output', 'input', 'active', 'passive', 'wiring', 'organic', 'tool',
  ]),
  blurb: leveledTextSchema,
  icon: z.string().min(1),
  pins: z.number().int().min(0),
  pinNames: z.array(z.string()),
  fragile: z.boolean(),
  electrical: z
    .object({
      forwardVoltage: z.number().optional(),
      maxCurrentMa: z.number().optional(),
      resistanceOhms: z.number().optional(),
      gain: z.number().optional(),
    })
    .optional(),
  hazards: z.array(hazardIdSchema),
}).refine((p) => p.pinNames.length === p.pins, {
  message: 'pinNames must have exactly `pins` entries',
});

/** 'A1'..'J30' or a power rail like '+top' / '-bottom'. */
export const holeSchema = z
  .string()
  .regex(/^([A-J](?:[1-9]|[12][0-9]|30)|[+-](?:top|bottom))$/, 'not a valid breadboard hole');

export const placementSchema = z.object({
  partId: z.string().min(1),
  holes: z.array(holeSchema).min(1),
  label: z.string().optional(),
});

export const experimentStepSchema = z.object({
  instruction: leveledTextSchema,
  explanation: leveledTextSchema.optional(),
  placements: z.array(placementSchema),
  expect: leveledTextSchema.optional(),
});

export const inventoryItemSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const experimentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  hook: leveledTextSchema,
  track: z.enum(['basics', 'transistor', 'laser', 'fruit']),
  order: z.number().int().min(1),
  requires: z.array(inventoryItemSchema),
  niceToHave: z.array(z.string()).optional(),
  hazards: z.array(hazardIdSchema),
  minLevel: readingLevelSchema,
  estimatedMinutes: z.number().int().min(1),
  steps: z.array(experimentStepSchema).min(1),
  bigIdea: leveledTextSchema,
  goFurther: z.array(leveledTextSchema).optional(),
});

export const expectedRangeSchema = z
  .object({
    min: z.number(),
    max: z.number(),
    unit: z.enum(['V', 'ohm', 'kohm', 'Mohm', 'mA', 'uA']),
  })
  .refine((r) => r.min <= r.max, { message: 'min must be <= max' });

export const organicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  emoji: z.string().min(1),
  kind: z.enum(['fruit', 'vegetable', 'liquid', 'body', 'other']),
  batteryVoltage: expectedRangeSchema.optional(),
  resistance: expectedRangeSchema.optional(),
  why: leveledTextSchema,
  guessPrompt: leveledTextSchema,
});
