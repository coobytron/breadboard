# Safety

Two audiences: the rules you read to the kids, and the reasons behind them for you.

## The five house rules (read these aloud)

1. **The laser never points at a person.** Only at the wall, below head height. Never at eyes,
   pets, cars, or through a magnifying glass. Adults only.
2. **Science fruit is never eaten.** Once metal goes in, it goes in the bin. Wash hands.
3. **Never let the two battery wires touch each other.** Always send the electricity through
   something first.
4. **If a part feels hot, unplug the battery and tell a grown-up.** Warm is fine, too-hot-to-hold
   is not.
5. **Parts stay on the table, never in mouths.**

## The reasons, for you

**Lasers.** Common red modules are Class 2 or 3R. The blink reflex is *not* reliable protection,
especially for a kid who is concentrating. In this app, laser experiments are hidden entirely in
Explorer (under-6) mode and require an adult tap-to-confirm at the other levels. That is
enforced in code — see the `laser-eye` hazard in `src/content/hazards.json`, and the test in
`src/content/content.test.ts` that fails the build if any laser experiment forgets it.

**Fruit.** Galvanized nails are zinc-coated; the copper electrode corrodes into the flesh. Both
leach in. It's not dramatically toxic, but it isn't food any more.

**Batteries.** A 9V alkaline shorted across itself gets hot enough to burn. Never use lithium
cells for these experiments — they can vent. A 4×AA pack (6V) is gentler on LEDs than a 9V and is
the better default if you're buying.

**Mains power is never part of any experiment in this app.** No wall outlets, no USB chargers
opened up, no exceptions. Everything runs on batteries.

**Heat.** A quarter-watt resistor dissipating more than 0.25W will scorch. `willBurnOut()` in
`src/lib/ohms-law.ts` is what the app uses to warn before that happens.

## What the app enforces

| Rule | Where |
|------|-------|
| Laser hidden from under-6 | `hazards.json` → `hiddenFrom: ["explorer"]`, filtered in `App.tsx` |
| Laser needs adult confirm | `hazards.json` → `severity: "gate"` |
| Fruit experiments warn about eating | test: *"any experiment using an organic warns not to eat it"* |
| Laser experiments can't forget the hazard | test: *"any experiment using a laser carries the laser hazard"* |
| LEDs get a correctly sized resistor | `sizeLedResistor()`, rounds **up** so it never over-drives |
