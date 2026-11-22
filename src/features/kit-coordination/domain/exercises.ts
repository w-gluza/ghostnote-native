import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import type { PatternReference } from "../../rudiments/domain/types";
import { midiNoteName, type MidiNote, type Velocity } from "./midi-map.ts";
import type { KitEvent, KitExercise, KitPattern, Limb } from "./types";

const RIDE = 51;
const SNARE = 38;
const KICK = 36;
const HIHAT = 42;
const HIHAT_PEDAL = 44;
const OPEN_HIHAT = 46;
const RACK_TOM = 48;
const FLOOR_TOM = 45;
const NORMAL: Velocity = 100;
const GHOST: Velocity = 64;

const LIMB_NAMES: Record<Limb, string> = {
  "right-hand": "Right hand",
  "left-hand": "Left hand",
  "right-foot": "Right foot",
  "left-foot": "Left foot",
};

const EIGHTHS = 2;
const TRIPLETS = 3;
const SIXTEENTHS = 4;
const ALL_EIGHTHS = [0, 1, 2, 3, 4, 5, 6, 7];

function part(
  note: MidiNote,
  limb: Limb,
  steps: number[],
  stepsPerBeat: number,
  velocity = NORMAL,
) {
  return steps.map((step): KitEvent => ({
    id: `${note}-${step}`,
    note,
    velocity,
    limb,
    at: fraction(step, stepsPerBeat),
  }));
}

function pattern(
  beats: number,
  stepsPerBeat: number,
  events: KitEvent[],
): KitPattern {
  return {
    id: "standard",
    version: 1,
    timeSignature: { beats, unit: 4 },
    stepsPerBeat,
    cycleDuration: fraction(beats),
    events,
  };
}

function tempo(bpm: number) {
  return { bpm, pulseQuarterUnits: ONE };
}

export const kitExercises: KitExercise[] = [
  {
    id: "eighth-note-rock-beat",
    kind: "coordination",
    name: "Rock Beat",
    level: 1,
    defaultTempo: tempo(70),
    pattern: pattern(4, EIGHTHS, [
      ...part(HIHAT, "right-hand", ALL_EIGHTHS, EIGHTHS),
      ...part(SNARE, "left-hand", [2, 6], EIGHTHS),
      ...part(KICK, "right-foot", [0, 4, 5], EIGHTHS),
    ]),
    stages: [
      {
        id: "hihat",
        title: "Hi-hat",
        notes: [HIHAT],
      },
      {
        id: "snare",
        title: "Hi-hat + Snare",
        notes: [HIHAT, SNARE],
      },
      {
        id: "kick",
        title: "Full beat",
        notes: [HIHAT, SNARE, KICK],
      },
    ],
  },
  {
    id: "left-foot-backbeat",
    kind: "coordination",
    name: "Pedal on 2 & 4",
    level: 1,
    defaultTempo: tempo(70),
    pattern: pattern(4, EIGHTHS, [
      ...part(RIDE, "right-hand", ALL_EIGHTHS, EIGHTHS),
      ...part(SNARE, "left-hand", [2, 6], EIGHTHS),
      ...part(KICK, "right-foot", [0, 4], EIGHTHS),
      ...part(HIHAT_PEDAL, "left-foot", [2, 6], EIGHTHS),
    ]),
    stages: [
      {
        id: "ride",
        title: "Ride",
        notes: [RIDE],
      },
      {
        id: "hihat-pedal",
        title: "Ride + Hi-hat pedal",
        notes: [RIDE, HIHAT_PEDAL],
      },
      {
        id: "kick",
        title: "Ride + both feet",
        notes: [RIDE, HIHAT_PEDAL, KICK],
      },
      {
        id: "snare",
        title: "All four parts",
        notes: [RIDE, HIHAT_PEDAL, KICK, SNARE],
      },
    ],
  },
  {
    id: "four-way-coordination",
    kind: "coordination",
    name: "Four-Way",
    level: 2,
    defaultTempo: tempo(70),
    pattern: pattern(4, EIGHTHS, [
      ...part(RIDE, "right-hand", ALL_EIGHTHS, EIGHTHS),
      ...part(SNARE, "left-hand", [2, 6], EIGHTHS),
      ...part(KICK, "right-foot", [0, 4], EIGHTHS),
      ...part(HIHAT_PEDAL, "left-foot", [1, 3, 5, 7], EIGHTHS),
    ]),
    stages: [
      {
        id: "ride",
        title: "Ride",
        notes: [RIDE],
      },
      {
        id: "kick",
        title: "Ride + Kick",
        notes: [RIDE, KICK],
      },
      {
        id: "snare",
        title: "Ride + Kick + Snare",
        notes: [RIDE, KICK, SNARE],
      },
      {
        id: "hihat-pedal",
        title: "All four parts",
        notes: [RIDE, KICK, SNARE, HIHAT_PEDAL],
      },
    ],
  },
  {
    id: "open-hihat-groove",
    kind: "coordination",
    name: "Open Hi-Hat",
    level: 2,
    defaultTempo: tempo(70),
    pattern: pattern(4, EIGHTHS, [
      ...part(HIHAT, "right-hand", [0, 1, 2, 4, 5, 6], EIGHTHS),
      ...part(OPEN_HIHAT, "right-hand", [3, 7], EIGHTHS),
      ...part(SNARE, "left-hand", [2, 6], EIGHTHS),
      ...part(KICK, "right-foot", [0, 4], EIGHTHS),
      ...part(HIHAT_PEDAL, "left-foot", [0, 4], EIGHTHS),
    ]),
    stages: [
      {
        id: "hihat",
        title: "Hi-hat",
        notes: [HIHAT, OPEN_HIHAT],
      },
      {
        id: "pedal",
        title: "Open and close",
        notes: [HIHAT, OPEN_HIHAT, HIHAT_PEDAL],
      },
      {
        id: "kick",
        title: "+ Kick",
        notes: [HIHAT, OPEN_HIHAT, HIHAT_PEDAL, KICK],
      },
      {
        id: "snare",
        title: "Full groove",
        notes: [HIHAT, OPEN_HIHAT, HIHAT_PEDAL, KICK, SNARE],
      },
    ],
  },
  {
    id: "linear-four-way",
    kind: "coordination",
    name: "Linear Four-Way",
    level: 3,
    defaultTempo: tempo(60),
    pattern: pattern(4, EIGHTHS, [
      ...part(RACK_TOM, "left-hand", [3, 7], EIGHTHS),
      ...part(FLOOR_TOM, "right-hand", [1, 5], EIGHTHS),
      ...part(KICK, "right-foot", [0, 4], EIGHTHS),
      ...part(HIHAT_PEDAL, "left-foot", [2, 6], EIGHTHS),
    ]),
    stages: [
      {
        id: "feet",
        title: "Feet",
        notes: [KICK, HIHAT_PEDAL],
      },
      {
        id: "floor-tom",
        title: "Feet + Floor tom",
        notes: [KICK, HIHAT_PEDAL, FLOOR_TOM],
      },
      {
        id: "rack-tom",
        title: "All four parts",
        notes: [KICK, HIHAT_PEDAL, FLOOR_TOM, RACK_TOM],
      },
    ],
  },
  {
    id: "samba-feet",
    kind: "coordination",
    name: "Samba Feet",
    level: 3,
    defaultTempo: tempo(60),
    pattern: pattern(2, SIXTEENTHS, [
      ...part(RIDE, "right-hand", [0, 2, 4, 6], SIXTEENTHS),
      ...part(SNARE, "left-hand", [4], SIXTEENTHS),
      ...part(KICK, "right-foot", [0, 3, 4, 7], SIXTEENTHS),
      ...part(HIHAT_PEDAL, "left-foot", [2, 6], SIXTEENTHS),
    ]),
    stages: [
      {
        id: "kick",
        title: "Kick",
        notes: [KICK],
      },
      {
        id: "hihat-pedal",
        title: "Both feet",
        notes: [KICK, HIHAT_PEDAL],
      },
      {
        id: "ride",
        title: "Feet + Ride",
        notes: [KICK, HIHAT_PEDAL, RIDE],
      },
      {
        id: "snare",
        title: "All four parts",
        notes: [KICK, HIHAT_PEDAL, RIDE, SNARE],
      },
    ],
  },
  {
    id: "swing-time",
    kind: "coordination",
    name: "Swing Time",
    level: 4,
    defaultTempo: tempo(80),
    pattern: pattern(4, TRIPLETS, [
      ...part(RIDE, "right-hand", [0, 3, 5, 6, 9, 11], TRIPLETS),
      ...part(SNARE, "left-hand", [5, 11], TRIPLETS, GHOST),
      ...part(KICK, "right-foot", [0, 3, 6, 9], TRIPLETS, GHOST),
      ...part(HIHAT_PEDAL, "left-foot", [3, 9], TRIPLETS),
    ]),
    stages: [
      {
        id: "ride",
        title: "Ride",
        notes: [RIDE],
      },
      {
        id: "hihat-pedal",
        title: "Ride + Hi-hat pedal",
        notes: [RIDE, HIHAT_PEDAL],
      },
      {
        id: "kick",
        title: "+ Kick",
        notes: [RIDE, HIHAT_PEDAL, KICK],
      },
      {
        id: "snare",
        title: "All four parts",
        notes: [RIDE, HIHAT_PEDAL, KICK, SNARE],
      },
    ],
  },
];

export function findKitExercise(id: string) {
  return kitExercises.find((exercise) => exercise.id === id);
}

export function limbName(limb: Limb) {
  return LIMB_NAMES[limb];
}

export function notesOf(pattern: KitPattern) {
  return [...new Set(pattern.events.map((event) => event.note))];
}

const HIHAT_SNARE_KICK: MidiNote[] = [
  HIHAT,
  HIHAT_PEDAL,
  OPEN_HIHAT,
  SNARE,
  KICK,
];

export type KitSetup = "hihat-snare-kick" | "hihat-snare-kick-ride" | "full";

export function kitSetup(notes: MidiNote[]): KitSetup {
  if (notes.every((note) => HIHAT_SNARE_KICK.includes(note))) {
    return "hihat-snare-kick";
  }
  if (notes.every((note) => note === RIDE || HIHAT_SNARE_KICK.includes(note))) {
    return "hihat-snare-kick-ride";
  }
  return "full";
}

export function limbOf(pattern: KitPattern, note: MidiNote) {
  return pattern.events.find((event) => event.note === note)?.limb;
}

export function notesLabel(notes: MidiNote[]) {
  return notes.map(midiNoteName).join(" · ");
}

export function partsLabel(exercise: KitExercise, enabled: MidiNote[]) {
  const playing = notesOf(exercise.pattern).filter((note) =>
    enabled.includes(note),
  );
  const stage = exercise.stages.find(
    (candidate) =>
      candidate.notes.length === playing.length &&
      candidate.notes.every((note) => playing.includes(note)),
  );
  if (!stage) {
    return "Your own mix";
  }
  return `${stage.title} · Stage ${exercise.stages.indexOf(stage) + 1} of ${exercise.stages.length}`;
}

export function sessionReference(exercise: KitExercise): PatternReference {
  return {
    rudimentId: exercise.id,
    patternId: exercise.pattern.id,
    patternVersion: exercise.pattern.version,
  };
}
