# Card 04 — The step-by-step experiment player

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). This is the heart of the app: the screen a kid
looks at while their hands are on the breadboard. One step at a time, big text, big buttons, no
scrolling to find the next thing.

Depends on card 01, which created `src/components/SafetyCard.tsx`, `src/components/AdultGate.tsx`
and `src/lib/safety.ts` (`needsAdultGate`, `sortHazards`).

Content comes from `src/content/index.ts` → `experiments`, `partsById`, `hazards`.

## The contract (already exists — do not change)

```ts
export interface ExperimentStep {
  instruction: LeveledText;
  explanation?: LeveledText;
  placements: Placement[];
  expect?: LeveledText;
}

export interface Placement { partId: string; holes: Hole[]; label?: string; }
export type Hole = string;  // 'A1'..'J30', or '+top' | '-top' | '+bottom' | '-bottom'
export interface LeveledText { explorer: string; builder: string; engineer: string; }
```

## Files to create

- `src/components/ExperimentPlayer.tsx`
- `src/components/StepView.tsx`
- `src/hooks/useStepProgress.ts`

## Requirements

**`src/components/ExperimentPlayer.tsx`** — props `{ experimentId: string; level: ReadingLevel }`.

Flow: **safety screen → steps → finish screen.**

1. **Safety screen first, always.** Render `SafetyCard` for the experiment's hazards. If
   `needsAdultGate` returns anything, wrap in `AdultGate` — the kid cannot reach step 1 until an
   adult confirms.
2. **Steps.** One at a time. Big "Next" / "Back". Show `instruction[level]` as the headline.
   Show `explanation[level]` if present, visually secondary — collapsed behind a "Why?" toggle at
   explorer and builder level, always open at engineer level.
   If `expect` is present, show it in a distinct box: this is what should be happening in the
   real world right now.
3. **Finish screen.** `bigIdea[level]`, then `goFurther` prompts as a list if present.

**`src/hooks/useStepProgress.ts`** — `useStepProgress(experimentId, stepCount)` returning
`{ index, next, back, reset, isFirst, isLast }`. Persist the current index to `localStorage`
under `breadboard-buddy:progress:<experimentId>` so a kid who wanders off mid-build comes back to
the right step. Clamp a restored index into range — a saved index from a shortened experiment
must not crash.

**`src/components/StepView.tsx`** — the presentational piece. Also lists the step's `placements`
in words: *"330Ω resistor → E5 and E10"*, resolving `partId` to the part's `name` and `icon`.
This is the text fallback until card 06 draws the actual diagram.

## Do NOT

- Do not edit `src/types/index.ts` or any file in `src/content/`.
- Do not add a dependency (no router, no animation library).
- Do not let the user skip the safety screen — no "skip" link, no deep link past it.
- Do not auto-advance on a timer. Kids' hands are slow.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen:
1. Open **First Light** at builder level → safety card appears first, listing "Never wire + straight to −".
2. Advance through 4 steps. Step 2 shows the resistor placement as "330Ω resistor → E5 and E10".
3. Reach the finish screen → shows the big idea and two "go further" prompts.
4. Reload the browser mid-experiment → you're back on the same step.
5. Open **The Magic Fruit Switch** at explorer level → it should not be reachable (`minLevel` is
   `builder`); at builder level it opens.
