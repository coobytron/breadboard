# Card 11 — Works offline, and lives on the internet

## Context

Breadboard Buddy (Vite + React 18 + TypeScript). Two goals: it must work in a garage with bad
wifi, and it must be reachable from a tablet without a laptop running `npm run dev`.

The repo is `coobytron/breadboard`, so GitHub Pages will serve it at
`https://<username>.github.io/breadboard/`. `vite.config.ts` **already** handles the sub-path:

```ts
base: process.env.GITHUB_PAGES === 'true' ? '/breadboard/' : '/',
```

## Files to create / modify

- create `public/manifest.webmanifest`
- create `public/sw.js`
- create `public/icon-192.png`, `public/icon-512.png` (generate simple ones — a 🍋 on a dark
  square is fine)
- modify `index.html`
- create `.github/workflows/deploy.yml`
- modify `src/main.tsx` (service worker registration)

## Requirements

**PWA manifest** — name "Breadboard Buddy", short name "Breadboard", `display: standalone`,
`theme_color: #10131a`, `background_color: #10131a`, both icon sizes. Link it from `index.html`
and add `<meta name="theme-color">`.

**Service worker (`public/sw.js`)** — plain JS, no Workbox, no build step:
- On `install`, precache the app shell.
- On `fetch`, **cache-first** — this app has no server, so fresh data is never a concern and
  offline is the priority.
- Bump a `CACHE_VERSION` constant and delete old caches on `activate`, so a redeploy doesn't
  strand a tablet on an old build. Get this right or the kids will see a stale app forever.
- Register it in `src/main.tsx` guarded by `if ('serviceWorker' in navigator)` **and** only in
  production (`import.meta.env.PROD`) — a service worker during `npm run dev` caches your
  in-progress work and is maddening to debug.

**`.github/workflows/deploy.yml`** — on push to the default branch: checkout, Node 22,
`npm ci`, **`npm test`**, `npm run build` with `GITHUB_PAGES=true`, then deploy `dist/` using
`actions/upload-pages-artifact` and `actions/deploy-pages` with the standard `pages: write` and
`id-token: write` permissions. **Tests must run before deploy** — a red build must never reach
the tablet.

Note in your answer that GitHub Pages needs enabling once by hand: repo Settings → Pages →
Source: "GitHub Actions".

## Do NOT

- Do not add a dependency (no `vite-plugin-pwa` — a hand-written 40-line service worker is easier
  to reason about here and has no build-time magic).
- Do not register the service worker in development.
- Do not cache-bust by changing the cache name on every request. Use an explicit version constant.
- Do not add any analytics, telemetry, or external font/CDN link. This app makes zero network
  requests to third parties.

## Acceptance test

```bash
npm test
npm run build
npx vite preview     # then: DevTools → Network → Offline → reload. App still works.
```

Then push and confirm the Action goes green and the Pages URL loads on a phone. On the phone,
"Add to Home Screen" should give a standalone app with the lemon icon.
