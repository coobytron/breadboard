# Card 06 — A simple breadboard diagram

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). Right now the step player lists placements as
text ("330Ω resistor → E5 and E10"). Kids need to *see* it.

**Keep this simple.** A clear, readable, static SVG that highlights the current step's holes.
This is not a drag-and-drop editor and not a simulator — that is deliberately out of scope.

Depends on card 04 (`src/components/StepView.tsx`).

## The contract (already exists — do not change)

```ts
export type Hole = string;   // 'A1'..'J30', or '+top' | '-top' | '+bottom' | '-bottom'
export interface Placement { partId: string; holes: Hole[]; label?: string; }
```

Breadboard layout, as used by all existing content:
- Rows **1–30**, columns **A–J**.
- Columns **A–E** of a row are one connected net; **F–J** are a separate net. The centre channel
  divides them.
- Four rails: `+top`, `-top`, `+bottom`, `-bottom`, each running the length of the board.

## Files to create

- `src/lib/breadboard.ts`
- `src/lib/breadboard.test.ts`
- `src/components/BreadboardDiagram.tsx`

## Requirements

**`src/lib/breadboard.ts`** — pure geometry and addressing:

- `parseHole(hole: Hole): { kind: 'grid'; col: string; row: number } | { kind: 'rail'; rail: Hole } | null`
  — returns `null` for anything invalid, never throws.
- `holeToXY(hole: Hole): { x: number; y: number } | null` — SVG coordinates on a
  standard 0.1-inch pitch grid. Pick a sensible scale (e.g. 20 units per hole) and document it.
- `sameNet(a: Hole, b: Hole): boolean` — true if the two holes are electrically connected by the
  breadboard itself. `A5`/`E5` → true. `E5`/`F5` → **false** (the centre channel). `+top`/`+top`
  → true. This is a small function and it is the one piece of real electrical truth in this
  card, so test it properly.

**`src/components/BreadboardDiagram.tsx`** — props
`{ placements: Placement[]; highlight?: Hole[]; }`.

Draws the board as SVG: hole grid, the centre channel, the four rails colour-coded red/blue, row
numbers and column letters. Draws each placement as a simple shape between its holes — a line for
a wire, a small rectangle with stripes for a resistor, an LED as a circle with a flat side on the
cathode end. Render `label` next to the part if present.

Holes in `highlight` get a bright ring and the rest of the board dims to ~40% opacity, so the
current step reads at a glance from arm's length.

Must scale: `viewBox` plus `width: 100%`, `height: auto`. It has to be legible on a phone held
sideways.

## Do NOT

- Do not build drag-and-drop. Not this card.
- Do not build a circuit simulator or try to work out whether the circuit is correct.
- Do not add a dependency (no SVG library — plain JSX `<svg>` elements).
- Do not edit `src/types/index.ts` or any file in `src/content/`.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: open **First Light** → each step shows the board with that step's holes ringed and the
rest dimmed. By step 4 the whole circuit is drawn.

Your `breadboard.test.ts` must cover:
- `sameNet('A5','E5')` → true
- `sameNet('E5','F5')` → false  ← the centre channel; the important one
- `sameNet('A5','A6')` → false
- `sameNet('+top','+top')` → true, `sameNet('+top','-top')` → false
- `parseHole('K5')` → null, `parseHole('A31')` → null, `parseHole('')` → null
