# Card 05 — Resistor calculator screen

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). This is the "am I about to destroy this LED?"
tool — the single most practically useful screen in the app.

**The maths already exists and is fully tested.** Do not rewrite it. `src/lib/ohms-law.ts`
exports:

```ts
export const E12_SERIES: number[];

export interface ResistorAdvice {
  idealOhms: number;
  recommendedOhms: number;
  actualCurrentMa: number;
  powerWatts: number;
  needsBiggerWattage: boolean;
}

export function sizeLedResistor(supplyVolts: number, forwardVolts: number, targetMa: number): ResistorAdvice;
export function nextStandardResistor(ohms: number): number;
export function seriesCurrentMa(supplyVolts: number, totalOhms: number): number;
export function willBurnOut(supplyVolts: number, forwardVolts: number, seriesOhms: number, maxCurrentMa: number): boolean;
```

`sizeLedResistor` **throws** if the supply can't exceed the LED's forward voltage. Handle that.

Parts with `electrical.forwardVoltage` / `electrical.maxCurrentMa` come from
`src/content/index.ts` → `parts`.

## Files to create

- `src/components/ResistorCalculator.tsx`
- `src/lib/resistor-colors.ts`
- `src/lib/resistor-colors.test.ts`

## Requirements

**`src/components/ResistorCalculator.tsx`** — props `{ level: ReadingLevel }`.

Inputs: supply voltage (preset buttons 3V / 4.5V / 6V / 9V, not a free text box), and which LED
(dropdown built from parts where `category === 'output'` and `electrical.forwardVoltage` exists).
Target current fixed at 20mA for explorer/builder; a slider 5–20mA at engineer level.

Output, at the right reading level:
- explorer: just the number and the colour bands — *"Use this one: 🟫 orange orange brown"*
- builder: the recommended value, plus "this is the brake that keeps your light safe"
- engineer: ideal vs recommended, actual current, power in watts, and the working
  `(9 − 2.0) / 0.021 = 333Ω`

If `needsBiggerWattage` is true, warn that a standard ¼W resistor isn't enough.
If `sizeLedResistor` throws, show a friendly message — *"That battery isn't strong enough to
light this LED at all"* — never a stack trace.

**`src/lib/resistor-colors.ts`** — `bandsFor(ohms: number): string[]` returning the three colour
bands for any E12 value, e.g. `330` → `['orange','orange','brown']`, `1000` →
`['brown','black','red']`, `1_000_000` → `['brown','black','green']`. Standard colour code:
black 0, brown 1, red 2, orange 3, yellow 4, green 5, blue 6, violet 7, grey 8, white 9; third
band is the number of zeros. Render them as actual coloured stripes on a resistor shape in the
component — a kid needs to *find* the resistor in a bag of forty, and the number isn't printed
on it.

## Do NOT

- Do not modify `src/lib/ohms-law.ts` — it is tested and correct.
- Do not add a dependency.
- Do not round the recommendation **down** to a smaller resistor. `nextStandardResistor` rounds
  up on purpose: under-sizing over-drives the LED.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: 9V + red LED → recommends **390Ω**, bands orange/white/brown.
6V + red LED → recommends **220Ω**, bands red/red/brown.
3V + green LED (Vf 2.1) → still works. 1.5V would throw → friendly message, no crash.

Your `resistor-colors.test.ts` must cover 220, 330, 1000 and 1000000 ohms.
