# Card 01 — Safety cards and the laser gate

## Context

Breadboard Buddy is a Vite + React 18 + TypeScript app that guides three kids (under-6, 6–9,
10–13) through real breadboard experiments. Every experiment carries hazards. Some hazards are
just notes; the laser hazard must **hide** the experiment from the youngest level entirely and
require an **adult tap-to-confirm** at the other levels.

Hazards already exist as data in `src/content/hazards.json` and are loaded and validated by
`src/content/index.ts`, which exports `hazards` and `hazardsById`.

## The contract (already exists — do not change)

```ts
export type ReadingLevel = 'explorer' | 'builder' | 'engineer';

export interface LeveledText { explorer: string; builder: string; engineer: string; }

export type HazardId =
  | 'laser-eye' | 'do-not-eat' | 'hot-part' | 'sharp' | 'battery-short' | 'small-parts';

export interface Hazard {
  id: HazardId;
  title: string;
  rule: LeveledText;
  severity: 'note' | 'warn' | 'gate';
  hiddenFrom: ReadingLevel[];
}
```

## Files to create

- `src/components/SafetyCard.tsx`
- `src/components/AdultGate.tsx`
- `src/lib/safety.ts`
- `src/lib/safety.test.ts`

## Requirements

**`src/lib/safety.ts`** — pure functions, no React:

- `isHiddenAtLevel(hazardIds: HazardId[], level: ReadingLevel, hazards: Hazard[]): boolean`
  — true if ANY of the hazards hides content at this level.
- `needsAdultGate(hazardIds: HazardId[], hazards: Hazard[]): Hazard[]`
  — returns the hazards with `severity: 'gate'`.
- `sortHazards(hazardIds: HazardId[], hazards: Hazard[]): Hazard[]`
  — returns full hazard objects ordered `gate` → `warn` → `note`, so the scariest shows first.
- Unknown hazard ids are **skipped silently**, never thrown — bad content must not white-screen
  the app in front of a child.

**`src/components/SafetyCard.tsx`** — props `{ hazardIds: HazardId[]; level: ReadingLevel }`.
Renders each hazard's `title` and its `rule[level]`, colour-coded by severity using the existing
CSS variables `--danger` (gate), `--warn` (warn), `--muted` (note). At `explorer` level, prefix
the card with "Grown-up: read this out loud 👇" — the under-6s can't read it themselves.

**`src/components/AdultGate.tsx`** — props
`{ hazards: Hazard[]; level: ReadingLevel; onConfirm: () => void }`.
Blocks its children behind a confirmation. Shows the `engineer`-level rule text regardless of the
selected level (an adult is reading this, not the kid), and a button reading
"I'm an adult and I've read this". Only after pressing it does `onConfirm` fire.
Do **not** use a maths puzzle or a password — this is a speed bump for a curious 7-year-old, not
real access control, and pretending otherwise would be dishonest.

## Do NOT

- Do not edit `src/types/index.ts` or `src/content/hazards.json`.
- Do not add any dependency.
- Do not use `window.confirm` or `alert`.
- Do not write a user-facing string that isn't drawn from `LeveledText` data.

## Acceptance test

```bash
npm test    # src/lib/safety.test.ts must pass with at least these cases
npm run build
```

Your `safety.test.ts` must cover:
- `isHiddenAtLevel(['laser-eye'], 'explorer', hazards)` → `true`
- `isHiddenAtLevel(['laser-eye'], 'builder', hazards)` → `false`
- `isHiddenAtLevel(['do-not-eat'], 'explorer', hazards)` → `false`
- `needsAdultGate(['laser-eye','sharp'], hazards)` returns exactly one hazard
- an unknown hazard id does not throw
