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
    name: "Eighth-Note Rock Beat",
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
        instruction:
          "Play steady eighth notes on the closed hi-hat. Count 1 & 2 & 3 & 4 &.",
        notes: [HIHAT],
      },
      {
        id: "snare",
        title: "Hi-hat + Snare",
        instruction:
          "Add the snare on beats 2 and 4. Both hands land together there.",
        notes: [HIHAT, SNARE],
      },
      {
        id: "kick",
        title: "Full beat",
        instruction:
          "Add the kick on 1, on 3 and on the & of 3. The hi-hat should not get louder when the kick plays.",
        notes: [HIHAT, SNARE, KICK],
      },
    ],
  },
  {
    id: "left-foot-backbeat",
    kind: "coordination",
    name: "Left Foot on 2 and 4",
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
        instruction: "Play steady eighth notes on the ride cymbal.",
        notes: [RIDE],
      },
      {
        id: "hihat-pedal",
        title: "Ride + Hi-hat pedal",
        instruction:
          "Close the hi-hat with your foot on beats 2 and 4. Keep the heel movement small and even.",
        notes: [RIDE, HIHAT_PEDAL],
      },
      {
        id: "kick",
        title: "Ride + both feet",
        instruction:
          "Add the kick on beats 1 and 3. Your feet now take turns: right, left, right, left.",
        notes: [RIDE, HIHAT_PEDAL, KICK],
      },
      {
        id: "snare",
        title: "All four parts",
        instruction:
          "Add the snare on beats 2 and 4, together with the hi-hat pedal.",
        notes: [RIDE, HIHAT_PEDAL, KICK, SNARE],
      },
    ],
  },
  {
    id: "four-way-coordination",
    kind: "coordination",
    name: "Four-Way Coordination",
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
        instruction:
          "Play steady eighth notes on the ride cymbal. Count 1 & 2 & 3 & 4 & and keep every note even.",
        notes: [RIDE],
      },
      {
        id: "kick",
        title: "Ride + Kick",
        instruction:
          "Add the kick on beats 1 and 3. Keep the ride moving without changing its sound.",
        notes: [RIDE, KICK],
      },
      {
        id: "snare",
        title: "Ride + Kick + Snare",
        instruction:
          "Add the snare on beats 2 and 4. The kick and snare now take turns under the ride.",
        notes: [RIDE, KICK, SNARE],
      },
      {
        id: "hihat-pedal",
        title: "All four parts",
        instruction:
          "Add the hi-hat pedal. Keep the other three parts going while closing the hi-hat on every offbeat.",
        notes: [RIDE, KICK, SNARE, HIHAT_PEDAL],
      },
    ],
  },
  {
    id: "open-hihat-groove",
    kind: "coordination",
    name: "Open Hi-Hat Groove",
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
        instruction:
          "Play eighth notes on the hi-hat, leaving a gap on the & of 2 and the & of 4.",
        notes: [HIHAT],
      },
      {
        id: "open",
        title: "Open and close",
        instruction:
          "Fill the gaps with an open hi-hat: lift your left foot as you hit, then close it on the next beat.",
        notes: [HIHAT, OPEN_HIHAT, HIHAT_PEDAL],
      },
      {
        id: "kick",
        title: "+ Kick",
        instruction:
          "Add the kick on beats 1 and 3. Both feet go down together there.",
        notes: [HIHAT, OPEN_HIHAT, HIHAT_PEDAL, KICK],
      },
      {
        id: "snare",
        title: "Full groove",
        instruction: "Add the snare on beats 2 and 4.",
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
      ...part(FLOOR_TOM, "right-hand", [1, 5], EIGHTHS),
      ...part(RACK_TOM, "left-hand", [3, 7], EIGHTHS),
      ...part(KICK, "right-foot", [0, 4], EIGHTHS),
      ...part(HIHAT_PEDAL, "left-foot", [2, 6], EIGHTHS),
    ]),
    stages: [
      {
        id: "feet",
        title: "Feet",
        instruction:
          "Walk your feet: kick on beats 1 and 3, hi-hat pedal on beats 2 and 4.",
        notes: [KICK, HIHAT_PEDAL],
      },
      {
        id: "floor-tom",
        title: "Feet + Floor tom",
        instruction:
          "Add the floor tom right after each kick. No two limbs play at the same time.",
        notes: [KICK, HIHAT_PEDAL, FLOOR_TOM],
      },
      {
        id: "rack-tom",
        title: "All four parts",
        instruction:
          "Add the high tom right after each hi-hat pedal. One limb per eighth note: foot, hand, foot, hand.",
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
        instruction:
          "Play the kick on each beat and on the sixteenth just before it. Count 1 e & a 2 e & a.",
        notes: [KICK],
      },
      {
        id: "hihat-pedal",
        title: "Both feet",
        instruction:
          "Add the hi-hat pedal on every &. This foot pattern is the base of a samba.",
        notes: [KICK, HIHAT_PEDAL],
      },
      {
        id: "ride",
        title: "Feet + Ride",
        instruction:
          "Add eighth notes on the ride. Keep your feet steady and relaxed under it.",
        notes: [KICK, HIHAT_PEDAL, RIDE],
      },
      {
        id: "snare",
        title: "All four parts",
        instruction: "Add the snare on beat 2.",
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
        instruction:
          "Play the swing pattern on the ride: beat 1, beat 2 and the last triplet of 2, then the same on 3 and 4.",
        notes: [RIDE],
      },
      {
        id: "hihat-pedal",
        title: "Ride + Hi-hat pedal",
        instruction: "Close the hi-hat with your foot on beats 2 and 4.",
        notes: [RIDE, HIHAT_PEDAL],
      },
      {
        id: "kick",
        title: "+ Kick",
        instruction:
          "Add a very soft kick on all four beats. It should be felt more than heard.",
        notes: [RIDE, HIHAT_PEDAL, KICK],
      },
      {
        id: "snare",
        title: "All four parts",
        instruction:
          "Add a soft snare on the last triplet of 2 and 4, together with the ride.",
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

export function limbOf(pattern: KitPattern, note: MidiNote) {
  return pattern.events.find((event) => event.note === note)?.limb;
}

export function notesLabel(notes: MidiNote[]) {
  return notes.map(midiNoteName).join(" · ");
}

export function stageChips(exercise: KitExercise) {
  return exercise.stages.map((stage, index) => {
    const before = exercise.stages[index - 1]?.notes ?? [];
    const added = stage.notes.filter((note) => !before.includes(note));
    return `${index === 0 ? "" : "+ "}${notesLabel(added)}`;
  });
}

export function sessionReference(exercise: KitExercise): PatternReference {
  return {
    rudimentId: exercise.id,
    patternId: exercise.pattern.id,
    patternVersion: exercise.pattern.version,
  };
}
