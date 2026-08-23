# How to use these cards

Each numbered file is a **complete, standalone job** for ChatGPT. You do not need to keep one
chat going — a fresh chat can do any card, in any order (after 01–02, which set up shared
pieces).

## The loop

1. Open a card. **Copy the whole file**, including the fenced code blocks.
2. Paste `AGENTS.md` first, then the card. (Or just paste the card — each one restates what it
   needs.)
3. ChatGPT gives you files. Save them at the exact paths the card names.
4. Run the **Acceptance test** at the bottom of the card.
5. If it passes, commit. If not, paste the error back into the same chat.

## The two commands that keep you safe

```bash
npm test     # must pass. This is your real quality gate.
npm run build # must pass. Catches type errors that `npm run dev` hides.
```

You do not have to read the code. If both commands pass and the acceptance test does what it
says on screen, the card is done. That's the whole point of building it this way.

## When ChatGPT goes off the rails

The three most common failures, and what to paste back:

- **It edited `src/types/index.ts`.** → *"Revert the changes to src/types/index.ts. It is a fixed
  contract. Rewrite your code to fit the existing types, or tell me why it can't be done."*
- **It added a dependency.** → *"Remove the new dependency and do this with what's already in
  package.json."*
- **It wrote a user-facing string that isn't a LeveledText.** → *"Every kid-facing string must be
  a LeveledText with explorer, builder and engineer. Fix it."*

## Order

Cards 01–02 first (they create shared components everything else uses). After that, follow your
own interest — the Fruit Lab cards (07–08) don't depend on the notebook cards, and vice versa.

| Card | Builds | Depends on |
|------|--------|-----------|
| 01 | Safety cards + the laser gate | — |
| 02 | Inventory: what parts do we own | — |
| 03 | Filter experiments by inventory | 02 |
| 04 | Step-by-step experiment player | 01 |
| 05 | Resistor calculator screen | — |
| 06 | Simple breadboard diagram | 04 |
| 07 | Fruit Lab: conductivity leaderboard | — |
| 08 | Fruit Lab: reading logger + feedback | 07 |
| 09 | Lab notebook + badges | 04 |
| 10 | Photos in the notebook | 09 |
| 11 | Offline + deploy to GitHub Pages | — |
| 12 | **Reusable:** add a new experiment | — |
