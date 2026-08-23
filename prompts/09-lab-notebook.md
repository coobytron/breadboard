# Card 09 — The lab notebook and badges

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). Three kids need to see what they've done and
what they've earned. No accounts, no cloud — everything stays on the device.

Depends on card 04 (`src/components/ExperimentPlayer.tsx`) — the finish screen is where an entry
gets written.

## The contract (already exists — do not change)

```ts
export interface LabEntry {
  id: string;
  experimentId: string;
  startedAt: string;            // ISO
  completedAt?: string;
  outcome: 'worked' | 'partly' | 'did-not-work' | 'in-progress';
  scientist?: string;
  notes?: string;
  photoKeys: string[];          // IndexedDB keys — card 10. Use [] for now.
}

export interface Badge {
  id: string; name: string; emoji: string;
  description: LeveledText;
  criteria:
    | { type: 'complete-experiment'; experimentId: string }
    | { type: 'complete-track'; track: 'basics'|'transistor'|'laser'|'fruit' }
    | { type: 'organics-measured'; count: number }
    | { type: 'first-light' };
}
```

## Files to create

- `src/content/badges.json`
- `src/lib/badges.ts`
- `src/lib/badges.test.ts`
- `src/hooks/useNotebook.ts`
- `src/components/Notebook.tsx`
- `src/components/BadgeShelf.tsx`

## Requirements

**`src/content/badges.json`** — at least 8 badges covering all four `criteria` types. Include
"First Light" (`first-light`), "Fruit Wrangler" (`organics-measured`, count 5) and one per track.
Every `description` needs all three reading levels.

**`src/lib/badges.ts`** — pure:
`earnedBadges(badges: Badge[], entries: LabEntry[], readings: OrganicReading[], experiments: Experiment[]): Badge[]`
Only entries with `outcome: 'worked'` count toward completion. `complete-track` requires every
experiment in that track. Unknown criteria types are ignored, never thrown.

**`src/hooks/useNotebook.ts`** — `{ entries, startEntry, completeEntry, updateEntry, deleteEntry }`,
persisted to `localStorage` under `breadboard-buddy:notebook`. Ids from `crypto.randomUUID()`.

**`src/components/Notebook.tsx`** — props `{ level: ReadingLevel }`. Entries newest first,
grouped by day. Each shows the experiment title, outcome as an emoji (✅ / 🤔 / ❌), the
scientist's name and any notes. A print stylesheet (`@media print`) so a finished notebook can go
on the fridge — this is the export, no PDF library needed.

**`src/components/BadgeShelf.tsx`** — earned badges bright, unearned dimmed with a hint of what
would earn them. Show the shelf on the experiment finish screen when a new badge is earned.

Wire `ExperimentPlayer`'s finish screen to ask "did it work?" (three buttons) and call
`completeEntry`.

## Do NOT

- Do not add a dependency (no PDF library, no date library — `Intl.DateTimeFormat` is built in).
- Do not send anything over the network. No analytics, no sync, no accounts.
- Do not edit `src/types/index.ts`.
- Do not implement photos — that's card 10. Leave `photoKeys` as `[]`.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: finish **First Light**, mark it "it worked" → an entry appears in the notebook and the
"First Light" badge lights up. Reload → both persist. Print preview shows a clean notebook page
with no navigation chrome.

Your `badges.test.ts` must cover each criteria type, plus: an entry with outcome
`did-not-work` does **not** earn a badge, and an unknown criteria type doesn't throw.
