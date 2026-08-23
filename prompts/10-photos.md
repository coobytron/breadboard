# Card 10 — Photos in the notebook

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). Kids want a picture of the thing they built.
Photos must stay **on the device** — no upload, no cloud, no exceptions.

Depends on card 09 (`src/hooks/useNotebook.ts`, `LabEntry.photoKeys`).

`localStorage` is far too small for photos, so they go in **IndexedDB**, and `LabEntry.photoKeys`
holds the keys.

## Files to create

- `src/lib/photo-store.ts`
- `src/components/PhotoCapture.tsx`
- `src/components/PhotoStrip.tsx`

## Requirements

**`src/lib/photo-store.ts`** — a tiny IndexedDB wrapper, no library:

```ts
export async function savePhoto(blob: Blob): Promise<string>;   // returns a key
export async function loadPhoto(key: string): Promise<Blob | null>;
export async function deletePhoto(key: string): Promise<void>;
export async function totalBytes(): Promise<number>;
```

Database `breadboard-buddy`, object store `photos`. Every function must handle IndexedDB being
unavailable (private browsing, storage blocked) by failing soft: `loadPhoto` returns `null`,
`savePhoto` throws a clearly-worded error the UI can show. Never let a storage failure white-screen
the app.

**`src/components/PhotoCapture.tsx`** — props `{ onSaved: (key: string) => void }`.
Uses `<input type="file" accept="image/*" capture="environment">` — on a tablet this opens the
camera directly, and it needs no permissions plumbing.

**Downscale before saving.** A modern phone photo is 4MB+ and a notebook of them will blow the
storage quota. Draw to a `<canvas>` at max 1280px on the long edge and export as JPEG quality
0.8. This is the difference between the notebook working for a year and filling up in a weekend.

**`src/components/PhotoStrip.tsx`** — props `{ photoKeys: string[]; onDelete?: (key: string) => void }`.
Thumbnails from `URL.createObjectURL`. **Revoke every object URL on unmount** — this is the
classic leak in this pattern and it will slow the app to a crawl over a long session.
Tap to view full size. Long-press or an X to delete.

Show total storage used in the notebook footer via `totalBytes()`.

## Do NOT

- Do not upload anywhere. No fetch, no XHR, no third-party service, ever.
- Do not add a dependency (no `idb`, no image library — the browser has everything needed).
- Do not store photos in `localStorage` — it will hit the quota almost immediately.
- Do not skip the downscale step.

## Acceptance test

```bash
npm test
npm run build
npm run dev
```

On screen: add a photo to a notebook entry → thumbnail appears → reload → still there. Delete it
→ gone from both the strip and IndexedDB (check DevTools → Application → IndexedDB). A 4MB source
photo should be stored at well under 500KB. Storage total updates.

Add `src/lib/photo-store.test.ts` if you can mock IndexedDB cleanly; if not, say so in your
answer rather than writing a fake test that passes without testing anything.
