# Card 03 — Show which experiments we can actually build

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). The home screen currently lists every
experiment. It should instead show, for each one, whether the family owns the parts — and
nudge them toward the cheapest unlock.

Depends on card 02, which created `src/lib/inventory.ts` (`hasEnough`, `missingParts`) and
`src/hooks/useInventory.ts`.

Experiments are loaded and validated by `src/content/index.ts`, which exports
`experiments: Experiment[]`, `parts`, `partsById`, `hazards`, `hazardsById`.

## The contract (already exists — do not change)

```ts
export interface Experiment {
  id: string;
  title: string;
  hook: LeveledText;
  track: 'basics' | 'transistor' | 'laser' | 'fruit';
  order: number;
  requires: InventoryItem[];
  niceToHave?: string[];
  hazards: HazardId[];
  minLevel: ReadingLevel;
  estimatedMinutes: number;
  steps: ExperimentStep[];
  bigIdea: LeveledText;
  goFurther?: LeveledText[];
}
```

## Files to create / modify

- create `src/lib/unlocks.ts` and `src/lib/unlocks.test.ts`
- modify `src/App.tsx`
- create `src/components/ExperimentCard.tsx`

## Requirements

**`src/lib/unlocks.ts`** — pure:

- `buildable(experiment, inventory): boolean`
- `nextBestPart(experiments, inventory): { partId: string; unlockCount: number } | null`
  — the single part that would unlock the most currently-blocked experiments. This powers
  *"Buy one 330Ω resistor and you unlock 4 more experiments."* If nothing is blocked, return
  `null`.

**`src/components/ExperimentCard.tsx`** — props
`{ experiment, level, buildable, missing }`. When not buildable, dim the card and list the
missing parts by name (not id) at all three reading levels — explorer sees "You need: 🔴 a light"
rather than a shopping list.

**`src/App.tsx`** — keep the existing reading-level toggle and the hazard-hiding behaviour
already there. Sort each track so buildable experiments come first. If `nextBestPart` returns
something, show a single banner above the list.

## Do NOT

- Do not edit `src/types/index.ts` or any file in `src/content/`.
- Do not add a dependency.
- Do not remove the existing reading-level toggle or the `hiddenFrom` hazard filtering in
  `App.tsx` — laser experiments must stay hidden from `explorer` level.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: with an empty inventory every experiment is dimmed. Add a breadboard, a 9V battery, a
red LED, a 330Ω resistor and 2 jumper wires → **First Light** becomes bright and sorts to the top.

Your `unlocks.test.ts` must cover:
- `buildable` false with an empty inventory, true once requirements are met
- `nextBestPart` picks the part that unlocks the most experiments
- `nextBestPart` returns `null` when everything is already buildable
