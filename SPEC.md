# Breadboard Buddy — spec

The source of truth. If a prompt card and this file disagree, this file wins.

## What it is

A phone/tablet web app that sits next to a real breadboard and walks a family through
electronics experiments. Three kids, three reading levels, one app. It is **not** a simulator
first — the real breadboard is the point; the app is the guide, the safety net and the notebook.

**Hardware on hand:** LEDs, transistors, a laser module, a pushbutton, jumper and alligator
leads, a breadboard, and fruit. **No microcontroller** — everything in v1 works with passive
parts and a battery. See `docs/SHOPPING.md` for the gaps (resistors, chiefly).

## The four pillars

| # | Pillar | Status |
|---|--------|--------|
| 1 | **Guided experiments** — pick your level, follow steps, get the right resistor, stay safe | v1 |
| 2 | **Fruit Lab** — fruit batteries, a conductivity leaderboard, the fruit touch switch | v1 |
| 3 | **Lab notebook** — log results and photos, earn badges, print a report | v1 |
| 4 | **Virtual sandbox** — drag parts onto an on-screen board and have it checked | **later** |

Pillar 4 is deliberately deferred. It is by far the most code for the least kid-facing value,
and a subtly-wrong simulator teaches the wrong thing. See "Later" at the bottom.

## Reading levels

Three kids means three voices. Every kid-facing string is a `LeveledText` with all three:

- `explorer` (under 6) — picture-first, ~8 words, no numbers. *"Push the red wire here."*
- `builder` (6–9) — short sentences, water-in-pipes analogies, no formulas.
- `engineer` (10–13) — real terms, Ohm's law, schematic vocabulary.

This is in the schema from day one on purpose. Retrofitting it later means rewriting every
experiment. A test fails if any experiment is missing a level.

## Architecture

```
src/types/index.ts        THE CONTRACT. Every prompt card quotes it. Do not edit casually.
src/content/schemas.ts    Zod mirrors of the types
src/content/*.json        parts, hazards, organics
src/content/experiments/  one JSON file per experiment — drop a file in, it appears
src/content/index.ts      loads + validates everything at import time
src/lib/                  pure, tested logic (ohms-law, ranges, ...)
src/components/           ChatGPT territory
```

**Why content is JSON:** new experiments need no code. `import.meta.glob` picks up any file
dropped into `src/content/experiments/`. Zod validates it. `content.test.ts` fails the build if
it's malformed, refers to a part that doesn't exist, uses the wrong number of breadboard holes
for a part's pin count, or forgets a reading level.

**Persistence:** `localStorage` for inventory/settings, IndexedDB for photos. Nothing leaves the
device — no accounts, no cloud, no analytics. This is a kids' app; that's not negotiable.

## Breadboard coordinates

Holes are addressed `A1`–`J30` plus the rails `+top`, `-top`, `+bottom`, `-bottom`.
Rows 1–30; columns A–E are one net per row, F–J are another, and the centre channel separates
them. The rails run the length of the board. The regex in `schemas.ts` enforces valid addresses.

## Safety model

Hazards are data (`src/content/hazards.json`), attached to both parts and experiments, with
three severities:

- `note` — shown on the safety card
- `warn` — shown prominently before the experiment opens
- `gate` — requires an adult tap-to-confirm

Plus `hiddenFrom`: reading levels where the experiment doesn't appear at all. The laser is
`gate` + hidden from `explorer`. Tests enforce that no laser experiment can forget its hazard
and no fruit experiment can forget `do-not-eat`. Full detail in `docs/SAFETY.md`.

## The Fruit Lab

The honest physics, because an experiment that quietly doesn't work teaches the wrong lesson.

**Tier 1 — fruit battery.** Zinc nail + bare copper wire in a lemon gives ~0.9V, but with
kilohms of internal resistance, so only microamps. **One lemon will not light an LED.** Four in
series will make a modern red LED glow faintly *in a dark room*. The app leads with this and
turns it into the lesson: volts are how hard it pushes, current is how much actually flows.

**Tier 2 — conductivity leaderboard.** Measure across a fixed 2cm probe gap in everything in the
fridge; rank them. Fruit lands in the tens of kΩ to megohms, which is exactly *why* it can't
drive an LED directly — and sets up tier 3. Guess first, then measure: `Organic.guessPrompt`.
No multimeter? Rank by LED brightness 0–5 instead.

**Tier 3 — the fruit touch switch (the flagship).** A Darlington pair from two NPN transistors
has a combined gain around 10,000. Fifty microamps leaking through a lemon is enough to switch a
full-brightness LED. Touch the fruit, the light comes on. No code, no microcontroller, and it
works reliably. This is where the transistors and the fruit finally click together.

Expected values live in `organics.json` so the app can answer a reading with *"0.9V — right in
range for a lemon!"* rather than just storing it (`checkRange()` in `src/lib/ranges.ts`).

## Reuse — what we took from GitHub, and what we didn't

| Repo | License | Verdict |
|------|---------|---------|
| [wokwi/wokwi-elements](https://github.com/wokwi/wokwi-elements) | MIT ✅ | Optional part sprites. Visual only — the README is explicit that they "do not provide the functional simulation code" |
| [fritzing/fritzing-parts](https://github.com/fritzing/fritzing-parts) | **CC-BY-SA 3.0 ⚠️** | **Do not vendor the SVGs.** Share-alike: *"publish your works under the same license."* Fine privately, a trap if this repo goes public. Use as visual reference and draw our own — simpler art suits a 5-year-old better anyway |
| [pfalstad/circuitjs1](https://github.com/pfalstad/circuitjs1) | **GPL-2.0 ⚠️** | **Link out / iframe the hosted copy, never vendor.** Copying the source in would make this whole app GPL. Good "watch the electrons move" button for engineer level |
| [wokwi/avr8js](https://github.com/wokwi/avr8js) | MIT ✅ | Shelved — only useful once there's a board |
| [CapacitiveSensor](https://github.com/PaulStoffregen/CapacitiveSensor), [ADCTouchSensor](https://github.com/arpruss/ADCTouchSensor), [makeymakey-capsense](https://github.com/ericrosenbaum/makeymakey-capsense-keyboard) | MIT-ish ✅ | The fruit-piano track, if a board gets bought |

Net: the genuinely reusable dependency is **wokwi-elements**, plus **CircuitJS1 as an outbound
link**. The experiment content and the Fruit Lab are ours — and they're the substance.

## Later (explicitly out of scope for now)

- **Virtual sandbox + circuit checker.** When it happens: extract the netlist properly
  (union-find over breadboard holes — clean and testable), then check against the experiment's
  expected connections with a small rule set to produce *"Your LED is backwards, flip it
  around."* Do **not** attempt a SPICE-style solver; a subtly-wrong simulator is worse than none.
  Types for this already exist (`Net`, `CheckResult`, `Finding`) so nothing has to change later.
- **Upgrade path — the fruit piano.** With an Arduino Leonardo or a Pico, capacitive sensing
  turns each fruit into a keyboard key. See `docs/SHOPPING.md`.
