/**
 * THE CONTRACT.
 *
 * Every prompt card in /prompts quotes from this file. It is the one place where the
 * shape of the app is decided, so that ~26 independent ChatGPT sessions produce code
 * that fits together.
 *
 * RULE FOR CHATGPT: do not change this file unless a prompt card explicitly tells you
 * to. If something you are building doesn't fit these types, say so in your answer
 * instead of quietly reshaping them.
 */

/* ------------------------------------------------------------------ */
/* Reading levels                                                      */
/* ------------------------------------------------------------------ */

/**
 * Three kids, three voices. Every piece of kid-facing prose exists at all three
 * levels. This is baked in from card 01 on purpose: retrofitting it later means
 * rewriting every experiment.
 */
export type ReadingLevel =
  | 'explorer'  // under 6  - picture-first, ~8 words, no numbers. "Push the red wire here."
  | 'builder'   // 6-9      - short sentences, water-in-pipes analogies, no formulas
  | 'engineer'; // 10-13    - real terms, Ohm's law, schematic symbols

export const READING_LEVELS: ReadingLevel[] = ['explorer', 'builder', 'engineer'];

/** A string that must be written for all three ages. */
export interface LeveledText {
  explorer: string;
  builder: string;
  engineer: string;
}

/* ------------------------------------------------------------------ */
/* Parts & inventory                                                   */
/* ------------------------------------------------------------------ */

export type PartCategory =
  | 'power'       // battery, battery holder
  | 'output'      // LED, laser module, buzzer
  | 'input'       // pushbutton, switch
  | 'active'      // transistor
  | 'passive'     // resistor, capacitor
  | 'wiring'      // breadboard, jumper wires, alligator clips
  | 'organic'     // lemon, potato, apple... yes, these are parts
  | 'tool';       // multimeter

export interface Part {
  id: string;                    // stable slug, e.g. 'led-red', 'npn-2n3904'
  name: string;                  // 'Red LED'
  category: PartCategory;
  /** What it does, for each age. */
  blurb: LeveledText;
  /** Emoji or an SVG sprite id used by the breadboard renderer. */
  icon: string;
  /** Number of legs/leads. Used by the breadboard renderer for footprints. */
  pins: number;
  /** Pin names in order, e.g. ['anode', 'cathode'] or ['collector','base','emitter']. */
  pinNames: string[];
  /** True if the part is destroyed by wrong wiring - drives the burnout warnings. */
  fragile: boolean;
  /** Electrical facts the resistor calculator and checker need. */
  electrical?: {
    forwardVoltage?: number;     // volts, for LEDs / laser diodes
    maxCurrentMa?: number;       // milliamps
    resistanceOhms?: number;     // for fixed resistors
    gain?: number;               // hFE for transistors
  };
  /** Hazards this part carries into any experiment that uses it. */
  hazards: HazardId[];
}

/** What the family owns. Persisted to localStorage; drives experiment filtering. */
export interface InventoryItem {
  partId: string;
  quantity: number;
}

/* ------------------------------------------------------------------ */
/* Safety                                                              */
/* ------------------------------------------------------------------ */

export type HazardId =
  | 'laser-eye'        // never in eyes, never through optics, aim below eye level
  | 'do-not-eat'       // science fruit has zinc/copper in it. Never eaten.
  | 'hot-part'         // resistors and transistors get hot when wired wrong
  | 'sharp'            // nails, stripped wire ends
  | 'battery-short'    // never wire + straight to - ; batteries get hot
  | 'small-parts';     // choking hazard for the under-6

export interface Hazard {
  id: HazardId;
  /** Shown as the safety card headline. */
  title: string;
  /** The rule, at each age. Explorer level is read ALOUD by the adult. */
  rule: LeveledText;
  /** 'gate' hazards require an adult tap-to-confirm before the experiment opens. */
  severity: 'note' | 'warn' | 'gate';
  /** Reading levels for which experiments carrying this hazard are hidden entirely. */
  hiddenFrom: ReadingLevel[];
}

/* ------------------------------------------------------------------ */
/* Experiments                                                         */
/* ------------------------------------------------------------------ */

/**
 * A breadboard hole address.
 * Rows 1..30, columns A..J, plus the two power rails on each side.
 * 'A1' | 'J30' | '+top' | '-bottom'
 */
export type Hole = string;

/** One thing that gets placed on the board. */
export interface Placement {
  partId: string;
  /** One hole per pin, in the same order as Part.pinNames. */
  holes: Hole[];
  /** Optional label the diagram shows next to it, e.g. '330Ω'. */
  label?: string;
}

export interface ExperimentStep {
  /** What to do, at each age. */
  instruction: LeveledText;
  /** Why it works. Optional - not every step teaches something. */
  explanation?: LeveledText;
  /** Placements added by this step. The diagram highlights these and dims the rest. */
  placements: Placement[];
  /** Kid-facing check: 'The light should be on now.' */
  expect?: LeveledText;
}

export interface Experiment {
  id: string;
  title: string;
  /** One-line hook. Shown on the card in the list. */
  hook: LeveledText;
  /** Which pillar this belongs to. */
  track: 'basics' | 'transistor' | 'laser' | 'fruit';
  /** Ordered difficulty within a track, 1 = first thing you should build. */
  order: number;
  /** Parts required. Experiment is greyed out unless the inventory covers all of these. */
  requires: InventoryItem[];
  /** Optional extras that make it better (e.g. a multimeter). */
  niceToHave?: string[];
  hazards: HazardId[];
  /** Minimum reading level that may open this. 'explorer' = everyone. */
  minLevel: ReadingLevel;
  estimatedMinutes: number;
  steps: ExperimentStep[];
  /** The takeaway, at each age. Shown on completion, saved to the notebook. */
  bigIdea: LeveledText;
  /** 'What if...' prompts to keep them playing after it works. */
  goFurther?: LeveledText[];
}

/* ------------------------------------------------------------------ */
/* The Fruit Lab                                                       */
/* ------------------------------------------------------------------ */

/** A measurable range. The app uses this to say "that's about right!". */
export interface ExpectedRange {
  min: number;
  max: number;
  unit: 'V' | 'ohm' | 'kohm' | 'Mohm' | 'mA' | 'uA';
}

/** Anything the kids can stick two wires into. */
export interface Organic {
  id: string;                 // 'lemon', 'potato', 'pickle', 'salt-water', 'finger'
  name: string;
  emoji: string;
  /** Squishy things are not all fruit. */
  kind: 'fruit' | 'vegetable' | 'liquid' | 'body' | 'other';
  /** Open-circuit volts from a zinc+copper cell in this thing. Absent = not a battery. */
  batteryVoltage?: ExpectedRange;
  /** Resistance across the standard 2 cm probe gap. */
  resistance?: ExpectedRange;
  /** Why this one behaves the way it does, at each age. */
  why: LeveledText;
  /** Ranked hint shown before measuring: do they think it will conduct? */
  guessPrompt: LeveledText;
}

/** One row in the conductivity leaderboard. Persisted to the notebook. */
export interface OrganicReading {
  id: string;
  organicId: string;
  measuredAt: string;          // ISO timestamp
  /** Either a real multimeter number, or the no-multimeter fallback. */
  method: 'multimeter' | 'led-brightness';
  /** Multimeter path. */
  value?: number;
  unit?: ExpectedRange['unit'];
  /** Fallback path: how bright did the LED get, 0 (dark) to 5 (bright). */
  brightness?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Which kid measured it. */
  scientist?: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Lab notebook                                                        */
/* ------------------------------------------------------------------ */

export interface LabEntry {
  id: string;
  experimentId: string;
  startedAt: string;           // ISO
  completedAt?: string;
  /** Did it actually light up? */
  outcome: 'worked' | 'partly' | 'did-not-work' | 'in-progress';
  scientist?: string;
  notes?: string;
  /** IndexedDB keys for photos. Photos NEVER leave the device. */
  photoKeys: string[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: LeveledText;
  /** Evaluated against notebook state by src/lib/badges.ts */
  criteria:
    | { type: 'complete-experiment'; experimentId: string }
    | { type: 'complete-track'; track: Experiment['track'] }
    | { type: 'organics-measured'; count: number }
    | { type: 'first-light' };
}

/* ------------------------------------------------------------------ */
/* Circuit checking (M5)                                               */
/* ------------------------------------------------------------------ */

/** A set of holes that are electrically the same point. */
export interface Net {
  id: number;
  holes: Hole[];
}

/** What the checker tells the kid. Always phrased as a next action, never a scolding. */
export interface CheckResult {
  ok: boolean;
  findings: Finding[];
}

export interface Finding {
  severity: 'ok' | 'hint' | 'problem' | 'danger';
  /** e.g. 'led-backwards', 'no-resistor', 'battery-short' */
  code: string;
  /** Kid-facing, at each age. 'Your LED is backwards. Flip it around!' */
  message: LeveledText;
  /** Holes to flash on the diagram. */
  highlight: Hole[];
}
