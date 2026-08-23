# Card 12 — Reusable: add a new experiment

**This card doesn't get used once and finished — use it every time you want a new experiment.**
Fill in the brief at the bottom and paste the whole file.

## Context

Breadboard Buddy is a Vite + React 18 + TypeScript app that guides three kids (under-6, 6–9,
10–13) through real breadboard experiments. **Experiments are pure data.** Adding one means
adding one JSON file to `src/content/experiments/` — no code, no registry. `import.meta.glob`
picks it up automatically.

Available parts are in `src/content/parts.json` — **you may only reference `id`s that already
exist there.** Available hazards are in `src/content/hazards.json`:
`laser-eye`, `do-not-eat`, `hot-part`, `sharp`, `battery-short`, `small-parts`.

## The contract (do not change)

```ts
export interface Experiment {
  id: string;                      // kebab-case, matches the filename
  title: string;
  hook: LeveledText;
  track: 'basics' | 'transistor' | 'laser' | 'fruit';
  order: number;                   // position within the track, 1 = first
  requires: { partId: string; quantity: number }[];
  niceToHave?: string[];           // part ids
  hazards: HazardId[];
  minLevel: 'explorer' | 'builder' | 'engineer';
  estimatedMinutes: number;
  steps: ExperimentStep[];
  bigIdea: LeveledText;
  goFurther?: LeveledText[];
}

export interface ExperimentStep {
  instruction: LeveledText;        // what to DO
  explanation?: LeveledText;       // why it works
  placements: { partId: string; holes: string[]; label?: string }[];
  expect?: LeveledText;            // what should happen in the real world
}

export interface LeveledText { explorer: string; builder: string; engineer: string; }
```

## Rules that the tests enforce

- Every `LeveledText` needs all three levels, non-empty.
- Every `partId` must exist in `parts.json`.
- **`holes.length` must equal that part's `pins`.** An LED has 2 pins → 2 holes. A transistor has
  3 → 3 holes. A pushbutton has 4 → 4 holes.
- Holes are `A1`–`J30` or `+top` / `-top` / `+bottom` / `-bottom`.
  Columns A–E of a row are one net; F–J are another; the centre channel separates them.
- Anything using a laser **must** include `laser-eye`. Anything using fruit **must** include
  `do-not-eat`.

## Voice

- **explorer** (under 6): ~8 words, no numbers, an adult reads it aloud. *"Push the red wire here."*
- **builder** (6–9): short sentences, water-in-pipes analogies, no formulas.
- **engineer** (10–13): real terms, actual values, the reasoning.

Be honest at every level. If a circuit will be dim, say it will be dim. If it only works in a
dark room, say so. An experiment that quietly under-delivers teaches the wrong lesson.

Copy the style of `src/content/experiments/first-light.json` and `fruit-touch-switch.json`.

## Do NOT

- Do not invent part ids. If the experiment needs a part that isn't in `parts.json`, **stop and
  say so** — adding a part is a separate change.
- Do not write app code. This card produces exactly one JSON file.
- Do not exceed the family's real parts: LEDs, 2 transistors, a laser module, a pushbutton,
  jumper and alligator leads, a breadboard, resistors, a 9V battery, fruit. **No microcontroller.**

## Acceptance test

```bash
npm test        # content.test.ts validates the new file automatically
npm run build
npm run dev     # the experiment appears in its track
```

---

## THE BRIEF — fill this in

**What should the experiment do?**
> _(e.g. "Two transistors and two capacitors making two LEDs flash back and forth")_

**Which track?** `basics` / `transistor` / `laser` / `fruit`

**Youngest age that can do it?** `explorer` / `builder` / `engineer`

**Anything specific to include?**
> _(e.g. "the kids should guess which LED lights first")_
