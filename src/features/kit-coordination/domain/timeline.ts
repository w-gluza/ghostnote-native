import { compare, toNumber } from "../../rudiments/domain/fraction.ts";
import type { MidiNote } from "./midi-map";
import type { KitEvent, KitPattern } from "./types";

export type KitStep = {
  beat: number;
  column: number;
  events: KitEvent[];
};

export type KitTimeline = {
  cycleBeats: number;
  strokes: KitStep[];
};

const SUBDIVISION_MARKS: Record<number, string[]> = {
  1: [],
  2: ["&"],
  3: ["&", "a"],
  4: ["e", "&", "a"],
};

export function columnCount(pattern: KitPattern) {
  return toNumber(pattern.cycleDuration) * pattern.stepsPerBeat;
}

export function buildKitTimeline(
  pattern: KitPattern,
  notes: MidiNote[],
): KitTimeline {
  const sounding = pattern.events
    .filter((event) => notes.includes(event.note))
    .sort((a, b) => compare(a.at, b.at));

  const strokes: KitStep[] = [];
  for (const event of sounding) {
    const beat = toNumber(event.at);
    const last = strokes.at(-1);
    if (last && last.beat === beat) {
      last.events.push(event);
    } else {
      strokes.push({
        beat,
        column: Math.round(beat * pattern.stepsPerBeat),
        events: [event],
      });
    }
  }

  return { cycleBeats: toNumber(pattern.cycleDuration), strokes };
}

export function countLabels(pattern: KitPattern) {
  const marks = SUBDIVISION_MARKS[pattern.stepsPerBeat] ?? [];
  return Array.from({ length: columnCount(pattern) }, (_, column) => {
    const within = column % pattern.stepsPerBeat;
    return within === 0
      ? String(Math.floor(column / pattern.stepsPerBeat) + 1)
      : (marks[within - 1] ?? "·");
  });
}

export function strikesOf(pattern: KitPattern, note: MidiNote) {
  const columns = new Set(
    pattern.events
      .filter((event) => event.note === note)
      .map((event) => Math.round(toNumber(event.at) * pattern.stepsPerBeat)),
  );
  return Array.from({ length: columnCount(pattern) }, (_, column) =>
    columns.has(column),
  );
}
