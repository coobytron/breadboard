# Card 08 — Fruit Lab: the battery logger and "is that normal?"

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). The lemon-battery experiment has kids measuring
voltages. A number on its own means nothing to a 7-year-old — the app has to react to it:
*"0.9V — right in range for a lemon!"*

Depends on card 07 (`src/hooks/useReadings.ts`).

Range-checking **already exists and is tested** in `src/lib/ranges.ts`:

```ts
export type Verdict = 'in-range' | 'low' | 'high';
export interface RangeCheck { verdict: Verdict; message: Record<ReadingLevel, string>; }
export function checkRange(value: number, unit: ExpectedRange['unit'], expected: ExpectedRange, label: string): RangeCheck;
```

`src/content/organics.json` carries `batteryVoltage` ranges for lemon (0.8–1.1V), potato
(0.7–0.9V) and apple (0.4–0.8V).

## Files to create

- `src/components/VoltageLogger.tsx`
- `src/components/CellStack.tsx`
- `src/lib/cells.ts`
- `src/lib/cells.test.ts`

## Requirements

**`src/lib/cells.ts`** — pure:

- `stackVoltage(cellVolts: number, count: number): number` — series cells add.
- `canLightLed(totalVolts: number, ledForwardVolts: number): boolean` — voltage check only.
- `cellsNeeded(cellVolts: number, ledForwardVolts: number): number` — how many lemons to clear
  the LED's forward voltage.
- `explainWhyDim(cellVolts: number, count: number, ledForwardVolts: number): LeveledText` —
  the honest answer. Even when the voltage clears, a fruit cell's internal resistance is in the
  kilohms, so it delivers microamps and the LED is *faint, in a dark room*. Say that. An
  experiment that quietly under-delivers teaches the wrong lesson; this function's whole job is
  to set expectations correctly before the kid is disappointed.

**`src/components/VoltageLogger.tsx`** — props `{ organicId: string; level: ReadingLevel }`.
Enter a measured voltage → immediately show `checkRange(...).message[level]` with a colour: green
in-range, amber low/high. Save via `addReading` from card 07 with `method: 'multimeter'`,
`unit: 'V'`.

**`src/components/CellStack.tsx`** — props `{ level: ReadingLevel }`. A stepper for "how many
lemons?" (1–8). Live readout of `stackVoltage`, whether it clears a red LED's 2.0V, and
`explainWhyDim` text. Draw the stack as a row of 🍋 emoji — at explorer level this picture *is*
the explanation.

## Do NOT

- Do not modify `src/lib/ranges.ts` or `src/content/organics.json`.
- Do not add a dependency.
- Do not claim a single lemon will light an LED. It will not — roughly 0.9V against a 2.0V
  forward voltage, and microamps against the milliamps needed. Four or more cells, in a dark
  room, is the honest answer and it's what the content already says.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: log 0.9V for a lemon → green, "right in the normal range". Log 0.2V → amber, "lower
than we expected". Set the stack to 1 lemon → clearly says it won't light. Set it to 4 → says it
should just barely glow in a dark room.

Your `cells.test.ts` must cover:
- `stackVoltage(0.9, 4)` ≈ 3.6
- `canLightLed(0.9, 2.0)` → false; `canLightLed(3.6, 2.0)` → true
- `cellsNeeded(0.9, 2.0)` → 3 (clears 2.0V), and document why the content recommends 4
- `explainWhyDim` returns all three reading levels, non-empty
