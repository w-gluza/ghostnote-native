import { compare, toNumber } from "../../rudiments/domain/fraction.ts";
import { midiNoteName, type MidiNote } from "./midi-map.ts";
import type { KitEvent, KitPattern, Limb } from "./types";

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

export function buildKitGrid(pattern: KitPattern): KitTimeline {
  const written = buildKitTimeline(
    pattern,
    pattern.events.map((event) => event.note),
  );
  const strokes = Array.from(
    { length: columnCount(pattern) },
    (_, column): KitStep =>
      written.strokes.find((step) => step.column === column) ?? {
        beat: column / pattern.stepsPerBeat,
        column,
        events: [],
      },
  );
  return { cycleBeats: written.cycleBeats, strokes };
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

export type KitCell = "strike" | "open" | "rest";

export type KitRow = {
  id: MidiNote;
  name: string;
  limb: Limb;
  notes: MidiNote[];
  cells: KitCell[];
};

const HIHAT = 42;
const OPEN_HIHAT = 46;
const PEDAL = 44;

const ROW_ORDER: MidiNote[] = [49, 51, 42, 48, 47, 38, 45, 44, 36];

function rowOf(note: MidiNote): MidiNote {
  return note === OPEN_HIHAT ? HIHAT : note;
}

export function rowsOf(pattern: KitPattern): KitRow[] {
  const rows: KitRow[] = [];
  for (const event of pattern.events) {
    const id = rowOf(event.note);
    let row = rows.find((candidate) => candidate.id === id);
    if (!row) {
      row = {
        id,
        name: id === PEDAL ? "Pedal" : midiNoteName(id),
        limb: event.limb,
        notes: [],
        cells: Array.from({ length: columnCount(pattern) }, () => "rest"),
      };
      rows.push(row);
    }
    if (!row.notes.includes(event.note)) {
      row.notes.push(event.note);
    }
    const column = Math.round(toNumber(event.at) * pattern.stepsPerBeat);
    row.cells[column] = event.note === OPEN_HIHAT ? "open" : "strike";
  }
  return rows.sort(
    (first, second) =>
      ROW_ORDER.indexOf(first.id) - ROW_ORDER.indexOf(second.id),
  );
}

export function toggled(enabled: MidiNote[], row: KitRow) {
  return row.notes.every((note) => enabled.includes(note))
    ? enabled.filter((note) => !row.notes.includes(note))
    : [...new Set([...enabled, ...row.notes])];
}
