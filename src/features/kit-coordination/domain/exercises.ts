import type { PatternReference } from "../../rudiments/domain/types";
import { midiNoteName, type MidiNote } from "./midi-map.ts";
import {
  ALL_EIGHTHS,
  EIGHTHS,
  FLOOR_TOM,
  GHOST,
  HIHAT,
  HIHAT_PEDAL,
  KICK,
  OPEN_HIHAT,
  RACK_TOM,
  RIDE,
  SIXTEENTHS,
  SNARE,
  TRIPLETS,
  part,
  pattern,
  tempo,
} from "./notation.ts";
import type { KitExercise, KitPattern, Limb } from "./types";

const LIMB_NAMES: Record<Limb, string> = {
  "right-hand": "Right hand",
  "left-hand": "Left hand",
  "right-foot": "Right foot",
  "left-foot": "Left foot",
};

export const kitExercises: KitExercise[] = [
  {
    id: "snare-over-feet",
    kind: "coordination",
    name: "Snare + Feet",
    level: 1,
    defaultTempo: tempo(70),
    pattern: pattern(4, EIGHTHS, [
      ...part(SNARE, "left-hand", ALL_EIGHTHS, EIGHTHS),
      ...part(KICK, "right-foot", [0, 4], EIGHTHS),
      ...part(HIHAT_PEDAL, "left-foot", [2, 6], EIGHTHS),
    ]),
    stages: [
      {
        id: "snare",
        title: "Snare",
        notes: [SNARE],
      },
      {
        id: "kick",
        title: "Snare + Kick",
        notes: [SNARE, KICK],
      },
      {
        id: "hihat-pedal",
        title: "All three parts",
        notes: [SNARE, KICK, HIHAT_PEDAL],
      },
    ],
  },
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
    name: "Samba",
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
    name: "Jazz Swing",
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
