# Card 02 — Inventory: what parts do we own?

## Context

Breadboard Buddy (Vite + React 18 + TypeScript, no backend) guides a family through breadboard
experiments. Before anything else, the app needs to know **what parts the family actually owns**,
so it can grey out experiments they can't build yet.

Parts already exist as data in `src/content/parts.json`, loaded and validated by
`src/content/index.ts`, which exports `parts: Part[]` and `partsById: Map<string, Part>`.

## The contract (already exists — do not change)

```ts
export type PartCategory =
  | 'power' | 'output' | 'input' | 'active' | 'passive' | 'wiring' | 'organic' | 'tool';

export interface Part {
  id: string;
  name: string;
  category: PartCategory;
  blurb: LeveledText;
  icon: string;          // an emoji
  pins: number;
  pinNames: string[];
  fragile: boolean;
  electrical?: { forwardVoltage?: number; maxCurrentMa?: number; resistanceOhms?: number; gain?: number };
  hazards: HazardId[];
}

export interface InventoryItem { partId: string; quantity: number; }
export type ReadingLevel = 'explorer' | 'builder' | 'engineer';
```

## Files to create

- `src/lib/inventory.ts`
- `src/lib/inventory.test.ts`
- `src/components/InventoryPicker.tsx`
- `src/hooks/useInventory.ts`

## Requirements

**`src/lib/inventory.ts`** — pure functions, no React, no localStorage access:

- `hasEnough(inventory: InventoryItem[], required: InventoryItem[]): boolean`
- `missingParts(inventory, required): InventoryItem[]` — what's short, and by how much
  (so the app can say *"you're 1 resistor away from 6 more experiments"*).
- `setQuantity(inventory, partId, quantity): InventoryItem[]` — returns a NEW array; quantity 0
  removes the entry entirely. Never mutate the input.

**`src/hooks/useInventory.ts`** — `useInventory()` returns
`{ inventory, setQuantity, has }`. Persists to `localStorage` under the key
`breadboard-buddy:inventory`. Must survive a corrupt/missing value gracefully: wrap the read in
try/catch and fall back to `[]` rather than crashing.

**`src/components/InventoryPicker.tsx`** — props `{ level: ReadingLevel }`.
Parts grouped by `category`, each row showing `icon`, `name`, `blurb[level]`, and a stepper
(− / count / +). Minimum touch target 48px — this gets used on a tablet by small fingers; the
CSS variable `--tap` already holds this. Category headings in kid words at explorer/builder
level ("Lights", "Wires", "Squishy things") and real words at engineer level ("Output", "Wiring",
"Organic").

## Do NOT

- Do not edit `src/types/index.ts` or `src/content/parts.json`.
- Do not add any dependency.
- Do not put localStorage access inside `src/lib/inventory.ts` — keep it pure so it's testable.

## Acceptance test

```bash
npm test
npm run build
npm run dev   # then set some quantities, reload the page — they should still be there
```

Your `inventory.test.ts` must cover:
- `hasEnough` true when quantities match exactly
- `hasEnough` false when one part is short by one
- `missingParts` reports the shortfall amount, not just the id
- `setQuantity(..., 0)` removes the entry
- `setQuantity` does not mutate the array passed in
