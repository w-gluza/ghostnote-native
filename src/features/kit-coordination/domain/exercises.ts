import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import type { PatternReference } from "../../rudiments/domain/types";
import { midiNoteName, type MidiNote, type Velocity } from "./midi-map.ts";
import type { KitEvent, KitExercise, KitPattern, Limb } from "./types";

const RIDE = 51;
const SNARE = 38;
const KICK = 36;
const HIHAT_PEDAL = 44;
const NORMAL: Velocity = 100;

const LIMB_NAMES: Record<Limb, string> = {
  "right-hand": "Right hand",
  "left-hand": "Left hand",
  "right-foot": "Right foot",
  "left-foot": "Left foot",
};

const EIGHTHS_PER_BEAT = 2;

function part(note: MidiNote, limb: Limb, eighths: number[]) {
  return eighths.map((eighth): KitEvent => ({
    id: `${note}-${eighth}`,
    note,
    velocity: NORMAL,
    limb,
    at: fraction(eighth, EIGHTHS_PER_BEAT),
  }));
}

const fourWayPattern: KitPattern = {
  id: "standard",
  version: 1,
  timeSignature: { beats: 4, unit: 4 },
  stepsPerBeat: EIGHTHS_PER_BEAT,
  cycleDuration: fraction(4),
  events: [
    ...part(RIDE, "right-hand", [0, 1, 2, 3, 4, 5, 6, 7]),
    ...part(SNARE, "left-hand", [2, 6]),
    ...part(KICK, "right-foot", [0, 4]),
    ...part(HIHAT_PEDAL, "left-foot", [1, 3, 5, 7]),
  ],
};

export const kitExercises: KitExercise[] = [
  {
    id: "four-way-coordination",
    kind: "coordination",
    name: "Four-Way Coordination",
    level: 2,
    defaultTempo: { bpm: 70, pulseQuarterUnits: ONE },
    pattern: fourWayPattern,
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
