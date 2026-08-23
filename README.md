# 🍋 Breadboard Buddy

A family electronics lab. Guided breadboard experiments for three kids at three reading levels,
a Fruit Lab where fruit is a circuit component, and a lab notebook to keep it all in.

Runs in a browser on a tablet next to the real breadboard. No backend, no accounts, nothing
leaves the device.

## Quick start

```bash
npm install
npm run dev      # open the printed URL
npm test         # 37 tests
npm run build
```

## What's here now

| | |
|---|---|
| ✅ | The shared type contract, Zod schemas, and content validation |
| ✅ | 19 parts, 6 hazards, 9 organics, 4 complete experiments |
| ✅ | Resistor maths and range-checking, fully tested |
| ✅ | A working home screen with the reading-level toggle |
| 📋 | Everything else — 13 prompt cards in [`prompts/`](prompts/) |

## The build plan

The app is built by pasting **prompt cards** into ChatGPT. Each card in
[`prompts/`](prompts/) is a self-contained job: it restates its own context, quotes the types it
needs, and ends with an acceptance test you can run.

Start with [`prompts/00-how-to-use-these.md`](prompts/00-how-to-use-these.md).

You never have to read the generated code. If `npm test` and `npm run build` both pass and the
card's acceptance test does what it says on screen, the card is done — that's the whole reason
the content is schema-validated and the logic is unit-tested.

## Read these first

- [`SPEC.md`](SPEC.md) — what we're building and why, including what we deliberately aren't
- [`AGENTS.md`](AGENTS.md) — paste this at the top of any ChatGPT session
- [`docs/SAFETY.md`](docs/SAFETY.md) — the five house rules, and what the code enforces
- [`docs/SHOPPING.md`](docs/SHOPPING.md) — **you need resistors**; details inside

## Adding an experiment

Drop a JSON file into `src/content/experiments/`. That's it — no code, no registry.
`npm test` validates it. [`prompts/12-add-an-experiment.md`](prompts/12-add-an-experiment.md) is
a reusable card for generating one.
