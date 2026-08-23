# Paste this at the top of any ChatGPT session

You are helping build **Breadboard Buddy**, a small React app that guides a dad and three kids
(ages under-6, 6–9, 10–13) through real breadboard experiments, including a "Fruit Lab" where
fruit is used as a circuit component.

**Stack:** Vite + React 18 + TypeScript (strict) + Zod. Vitest for tests. No backend, no
accounts, no network calls. Everything is static and works offline.

**Ground rules — these matter more than anything else:**

1. **Never edit `src/types/index.ts`** unless the card explicitly says to. It is the shared
   contract that keeps separately-generated files compatible.
2. **Never add a dependency** unless the card explicitly says to.
3. **All kid-facing text exists at three reading levels** — `explorer`, `builder`, `engineer`.
   Never write a user-visible string that isn't a `LeveledText`. Tests enforce this.
4. **Content is data, not code.** Experiments live in `src/content/experiments/*.json`. Never
   hardcode an experiment into a component.
5. **Every card ships tests.** Pure logic goes in `src/lib/` and gets a `.test.ts` next to it.
6. **Safety is enforced in code, not comments.** Laser content is hidden from `explorer` level;
   anything using fruit carries the `do-not-eat` hazard. Tests check both.
7. If a card asks for something that doesn't fit the types, **say so in your answer** instead of
   quietly reshaping the types.

**Definition of done for every card:** `npm test` passes, `npm run build` passes, and the card's
own acceptance test does what it says.
