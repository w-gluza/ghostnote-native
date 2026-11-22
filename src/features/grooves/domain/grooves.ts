import {
  EIGHTHS,
  GHOST,
  HIHAT,
  KICK,
  OPEN_HIHAT,
  SIXTEENTHS,
  SNARE,
  TRIPLETS,
  part,
  pattern,
  tempo,
} from "../../kit-coordination/domain/notation.ts";
import { rowsOf } from "../../kit-coordination/domain/timeline.ts";
import type {
  KitEvent,
  KitExercise,
  KitPattern,
  KitStage,
} from "../../kit-coordination/domain/types";

export type Groove = KitExercise & { style: string };

const EVERY_EIGHTH = [0, 1, 2, 3, 4, 5, 6, 7];
const EIGHTHS_IN_SIXTEENTHS = [0, 2, 4, 6, 8, 10, 12, 14];
const EVERY_SIXTEENTH = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const EVERY_TRIPLET = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const SHUFFLED = [0, 2, 3, 5, 6, 8, 9, 11];
const MIDDLE_TRIPLETS = [1, 4, 7, 10];

function hihat(steps: number[], stepsPerBeat: number) {
  return part(HIHAT, "right-hand", steps, stepsPerBeat);
}

function openHihat(steps: number[], stepsPerBeat: number) {
  return part(OPEN_HIHAT, "right-hand", steps, stepsPerBeat);
}

function snare(steps: number[], stepsPerBeat: number) {
  return part(SNARE, "left-hand", steps, stepsPerBeat);
}

function ghostSnare(steps: number[], stepsPerBeat: number) {
  return part(SNARE, "left-hand", steps, stepsPerBeat, GHOST);
}

function kick(steps: number[], stepsPerBeat: number) {
  return part(KICK, "right-foot", steps, stepsPerBeat);
}

function stagesOf(bar: KitPattern): KitStage[] {
  const rows = rowsOf(bar);
  return rows.map((row, index) => {
    const upToHere = rows.slice(0, index + 1);
    return {
      id: `${row.id}`,
      title:
        index === rows.length - 1 && rows.length > 1
          ? "Full groove"
          : upToHere.map((each) => each.name).join(" + "),
      notes: upToHere.flatMap((each) => each.notes),
    };
  });
}

function groove(
  id: string,
  name: string,
  style: string,
  level: number,
  bpm: number,
  stepsPerBeat: number,
  events: KitEvent[],
): Groove {
  const bar = pattern(4, stepsPerBeat, events);
  return {
    id: `groove-${id}`,
    kind: "coordination",
    name,
    style,
    level,
    defaultTempo: tempo(bpm),
    pattern: bar,
    stages: stagesOf(bar),
  };
}

export const grooves: Groove[] = [
  groove("basic-rock", "Basic Rock", "Rock", 1, 80, EIGHTHS, [
    ...hihat(EVERY_EIGHTH, EIGHTHS),
    ...snare([2, 6], EIGHTHS),
    ...kick([0, 4], EIGHTHS),
  ]),
  groove("syncopated-rock", "Syncopated Rock", "Rock", 1, 80, EIGHTHS, [
    ...hihat(EVERY_EIGHTH, EIGHTHS),
    ...snare([2, 6], EIGHTHS),
    ...kick([0, 3, 4], EIGHTHS),
  ]),
  groove("four-on-the-floor", "Four on the Floor", "Pop", 1, 100, EIGHTHS, [
    ...hihat(EVERY_EIGHTH, EIGHTHS),
    ...snare([2, 6], EIGHTHS),
    ...kick([0, 2, 4, 6], EIGHTHS),
  ]),
  groove("motown", "Motown Beat", "Soul", 1, 100, EIGHTHS, [
    ...hihat(EVERY_EIGHTH, EIGHTHS),
    ...snare([0, 2, 4, 6], EIGHTHS),
    ...kick([0, 4], EIGHTHS),
  ]),
  groove("half-time", "Half-Time", "Rock", 1, 80, EIGHTHS, [
    ...hihat(EVERY_EIGHTH, EIGHTHS),
    ...snare([4], EIGHTHS),
    ...kick([0, 3], EIGHTHS),
  ]),
  groove("disco", "Disco", "Dance", 2, 110, EIGHTHS, [
    ...hihat([0, 2, 4, 6], EIGHTHS),
    ...openHihat([1, 3, 5, 7], EIGHTHS),
    ...snare([2, 6], EIGHTHS),
    ...kick([0, 2, 4, 6], EIGHTHS),
  ]),
  groove("one-drop", "One Drop", "Reggae", 2, 75, EIGHTHS, [
    ...hihat(EVERY_EIGHTH, EIGHTHS),
    ...snare([4], EIGHTHS),
    ...kick([4], EIGHTHS),
  ]),
  groove("sixteenth-kick", "16th-Note Kick", "Rock", 2, 75, SIXTEENTHS, [
    ...hihat(EIGHTHS_IN_SIXTEENTHS, SIXTEENTHS),
    ...snare([4, 12], SIXTEENTHS),
    ...kick([0, 7, 10], SIXTEENTHS),
  ]),
  groove("slow-blues", "Slow Blues", "Blues", 2, 60, TRIPLETS, [
    ...hihat(EVERY_TRIPLET, TRIPLETS),
    ...snare([3, 9], TRIPLETS),
    ...kick([0, 6], TRIPLETS),
  ]),
  groove("shuffle", "Shuffle", "Blues", 2, 90, TRIPLETS, [
    ...hihat(SHUFFLED, TRIPLETS),
    ...snare([3, 9], TRIPLETS),
    ...kick([0, 6], TRIPLETS),
  ]),
  groove("sixteenth-hihats", "16th Hi-Hats", "Pop", 3, 70, SIXTEENTHS, [
    ...hihat(EVERY_SIXTEENTH, SIXTEENTHS),
    ...snare([4, 12], SIXTEENTHS),
    ...kick([0, 8, 10], SIXTEENTHS),
  ]),
  groove("basic-funk", "Basic Funk", "Funk", 3, 85, SIXTEENTHS, [
    ...hihat(EIGHTHS_IN_SIXTEENTHS, SIXTEENTHS),
    ...snare([4, 7, 12], SIXTEENTHS),
    ...kick([0, 9], SIXTEENTHS),
  ]),
  groove("half-time-shuffle", "Half-Time Shuffle", "Blues", 4, 80, TRIPLETS, [
    ...hihat(SHUFFLED, TRIPLETS),
    ...ghostSnare(MIDDLE_TRIPLETS, TRIPLETS),
    ...snare([6], TRIPLETS),
    ...kick([0, 5], TRIPLETS),
  ]),
];

export function findGroove(id: string) {
  return grooves.find((each) => each.id === id);
}
