# Card 07 — Fruit Lab: the conductivity leaderboard

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). This is the feature the kids most want: they
already stick wires into random fruit. This turns that into a real experiment — **guess first,
then measure, then rank.**

Materials data already exists in `src/content/organics.json`, loaded and validated by
`src/content/index.ts` → `organics: Organic[]`, `organicsById`.

Ranking and range-checking logic **already exists and is tested** in `src/lib/ranges.ts`:

```ts
export function toOhms(value: number, unit: ExpectedRange['unit']): number;
export function checkRange(value: number, unit: ExpectedRange['unit'], expected: ExpectedRange, label: string): RangeCheck;
export function rankByConductivity<T extends { ohms?: number; brightness?: number }>(readings: T[]): T[];
```

## The contract (already exists — do not change)

```ts
export interface ExpectedRange { min: number; max: number; unit: 'V'|'ohm'|'kohm'|'Mohm'|'mA'|'uA'; }

export interface Organic {
  id: string; name: string; emoji: string;
  kind: 'fruit' | 'vegetable' | 'liquid' | 'body' | 'other';
  batteryVoltage?: ExpectedRange;
  resistance?: ExpectedRange;
  why: LeveledText;
  guessPrompt: LeveledText;
}

export interface OrganicReading {
  id: string; organicId: string; measuredAt: string;
  method: 'multimeter' | 'led-brightness';
  value?: number; unit?: ExpectedRange['unit'];
  brightness?: 0|1|2|3|4|5;
  scientist?: string; notes?: string;
}
```

## Files to create

- `src/components/Leaderboard.tsx`
- `src/components/GuessFirst.tsx`
- `src/hooks/useReadings.ts`

## Requirements

**`src/hooks/useReadings.ts`** — `useReadings()` returns
`{ readings, addReading, removeReading, clearAll }`. Persists to `localStorage` under
`breadboard-buddy:readings`. Generate ids with `crypto.randomUUID()`. Corrupt stored data must
fall back to `[]`, not crash.

**`src/components/GuessFirst.tsx`** — before a kid measures anything, show
`organic.guessPrompt[level]` and make them commit: three big buttons, "Strong / Medium / Weak".
Store the guess alongside the reading. **This is the pedagogical core of the whole feature** — a
prediction they've committed to is what makes the result land. Do not make it skippable.

**`src/components/Leaderboard.tsx`** — props `{ level: ReadingLevel }`.

A ranked table of everything measured, best conductor first, via `rankByConductivity`. Two
measurement modes, chosen by the user and remembered:
- **multimeter** — enter a number and a unit
- **LED brightness** — tap 0–5 (the no-multimeter fallback, so this works with nothing but the
  parts already on hand)

Each row: emoji, name, the reading, and a badge if it beat or missed the kid's guess. Bars drawn
as plain divs with a width percentage — no chart library.

Tapping a row expands `organic.why[level]`.

## Do NOT

- Do not modify `src/lib/ranges.ts` or `src/content/organics.json` — both are tested and correct.
- Do not add a dependency (no chart library, no table library).
- Do not let the leaderboard mix voltage and resistance readings in one ranking — they are not
  comparable. Rank resistance; show battery voltage separately.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: pick 🥒 pickle → guess "Strong" → enter 5 kΩ → it lands top of the table with a
"good guess!" badge. Add 👆 finger at 1000 kΩ → it sorts to the bottom. Switch to LED-brightness
mode → ranking still works with no numbers entered. Reload → readings persist.
