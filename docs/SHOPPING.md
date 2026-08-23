# Shopping list

You already have: LEDs, transistors, a laser module, a pushbutton, jumper/connection cords,
and a breadboard.

## Needed to build anything safely

| Item | Why | ~Cost |
|------|-----|-------|
| **Resistor assortment** — must include 220Ω, 330Ω, 1kΩ, 10kΩ, **1MΩ** | LEDs have no internal current limit. A 9V battery across a bare LED kills it in about a second. The 1MΩ is the base pull-down for the fruit touch switch | $8 |
| **4×AA battery holder** (preferred) or 9V battery + snap | Power. 6V from AAs is gentler on LEDs than 9V and gives more margin | $6 |
| **Alligator clip leads** (10+) | The bridge between breadboard holes and anything that isn't a component — fruit, nails, foil, hands. Essential for the whole Fruit Lab | $7 |
| **Galvanized nails + bare copper wire** | The zinc and copper electrodes for fruit batteries. **Not pennies** — modern US pennies are zinc under a copper skin, so they make a poor copper electrode | $5 |

## Strongly recommended

| Item | Why | ~Cost |
|------|-----|-------|
| **Cheap multimeter** | The Fruit Lab is much better with one. Watching a lemon read 0.9V is the payoff moment, and the conductivity leaderboard is a real experiment instead of a guess | $15 |
| **Ceramic capacitors** (10µF, 100µF) | Unlocks the two-transistor blinker — flashing lights with no microcontroller and no code. One of the best passive projects there is | $6 |

The multimeter is **not required**. The app ships a no-multimeter fallback that ranks materials
by LED brightness (0–5) instead of by ohms — see `rankByConductivity()` in `src/lib/ranges.ts`.

## Later, if you want the fruit piano

Nothing in this app needs a microcontroller. If you do buy one:

- **Arduino Leonardo / Micro** — can pretend to be a USB keyboard, so fruit becomes literal
  keyboard keys (this is how a Makey Makey works).
- **Raspberry Pi Pico** — MicroPython is kid-readable.

Then see the "Upgrade path" section of `SPEC.md`.
