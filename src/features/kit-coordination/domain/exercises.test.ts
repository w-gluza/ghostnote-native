import assert from "node:assert/strict";
import { test } from "node:test";

import { toNumber } from "../../rudiments/domain/fraction.ts";
import {
  beatOfOrdinal,
  gapBeforeOrdinal,
  msPerQuarterUnit,
  onsetAt,
} from "../../rudiments/domain/timing.ts";
import {
  findKitExercise,
  kitExercises,
  kitSetup,
  limbName,
  limbOf,
  notesLabel,
  notesOf,
  partsLabel,
  sessionReference,
} from "./exercises.ts";
import { midiNoteName, velocityLevel, type MidiNote } from "./midi-map.ts";
import {
  buildKitGrid,
  buildKitTimeline,
  columnCount,
  countLabels,
  rowsOf,
  toggled,
} from "./timeline.ts";

const RIDE = 51;
const SNARE = 38;
const KICK = 36;
const HIHAT_PEDAL = 44;

const fourWay = findKitExercise("four-way-coordination")!;
const { pattern, stages } = fourWay;
const all: MidiNote[] = [RIDE, KICK, SNARE, HIHAT_PEDAL];

const eighthsOf = (note: MidiNote) =>
  pattern.events
    .filter((event) => event.note === note)
    .map((event) => toNumber(event.at) * 2);

test("Four-Way is a level 2 exercise in 4/4 at 70 BPM, counted in eighths", () => {
  assert.equal(fourWay.name, "Four-Way");
  assert.equal(fourWay.kind, "coordination");
  assert.equal(fourWay.level, 2);
  assert.deepEqual(pattern.timeSignature, { beats: 4, unit: 4 });
  assert.equal(fourWay.defaultTempo.bpm, 70);
  assert.equal(columnCount(pattern), 8);
  assert.deepEqual(countLabels(pattern), [
    "1",
    "&",
    "2",
    "&",
    "3",
    "&",
    "4",
    "&",
  ]);
});

test("each instrument plays on its written eighth notes", () => {
  assert.deepEqual(eighthsOf(RIDE), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(eighthsOf(KICK), [0, 4]);
  assert.deepEqual(eighthsOf(SNARE), [2, 6]);
  assert.deepEqual(eighthsOf(HIHAT_PEDAL), [1, 3, 5, 7]);
});

test("instruments are General MIDI drum notes, and the hi-hat part is the pedal, not a stick hit", () => {
  assert.deepEqual(notesOf(pattern), [51, 38, 36, 44]);
  assert.equal(midiNoteName(44), "Hi-hat pedal");
  assert.equal(midiNoteName(42), "Hi-hat");
  assert.equal(
    pattern.events.every((event) => event.velocity === 100),
    true,
  );
  assert.deepEqual(([127, 100, 64, 30] as const).map(velocityLevel), [
    "full",
    "full",
    "soft",
    "grace",
  ]);
});

test("the grid shows a strike or a rest for every eighth of each instrument", () => {
  const rows = rowsOf(pattern);
  assert.deepEqual(
    rows.map((row) => row.name),
    ["Ride", "Snare", "Pedal", "Kick"],
  );
  assert.deepEqual(rows.find((row) => row.id === KICK)?.cells, [
    "strike",
    "rest",
    "rest",
    "rest",
    "strike",
    "rest",
    "rest",
    "rest",
  ]);
  assert.equal(
    rows[0]?.cells.every((cell) => cell === "strike"),
    true,
  );
});

test("each instrument is played by one limb, kept apart from the instrument itself", () => {
  assert.deepEqual(
    notesOf(pattern).map((note) => [
      midiNoteName(note),
      limbName(limbOf(pattern, note)!),
    ]),
    [
      ["Ride", "Right hand"],
      ["Snare", "Left hand"],
      ["Kick", "Right foot"],
      ["Hi-hat pedal", "Left foot"],
    ],
  );
  for (const note of all) {
    const limbs = new Set(
      pattern.events
        .filter((event) => event.note === note)
        .map((event) => event.limb),
    );
    assert.equal(limbs.size, 1, midiNoteName(note));
  }
});

test("notes on the same eighth are grouped into one step and sound together", () => {
  const timeline = buildKitTimeline(pattern, all);
  assert.equal(timeline.strokes.length, 8);
  assert.deepEqual(
    timeline.strokes.map((step) =>
      step.events.map((event) => event.note).sort((a, b) => a - b),
    ),
    [
      [36, 51],
      [44, 51],
      [38, 51],
      [44, 51],
      [36, 51],
      [44, 51],
      [38, 51],
      [44, 51],
    ],
  );
  assert.deepEqual(
    timeline.strokes.map((step) => step.column),
    [0, 1, 2, 3, 4, 5, 6, 7],
  );
});

test("the four stages add one instrument at a time over the same pattern", () => {
  assert.deepEqual(
    stages.map((stage) => notesLabel(stage.notes)),
    [
      "Ride",
      "Ride · Kick",
      "Ride · Kick · Snare",
      "Ride · Kick · Snare · Hi-hat pedal",
    ],
  );
  const counts = stages.map(
    (stage) =>
      buildKitTimeline(pattern, stage.notes).strokes.flatMap(
        (step) => step.events,
      ).length,
  );
  assert.deepEqual(counts, [8, 10, 12, 16]);
});

test("a stage leaves out the instruments it has not introduced yet", () => {
  const kickOnly = buildKitTimeline(pattern, [KICK]);
  assert.deepEqual(
    kickOnly.strokes.map((step) => step.beat),
    [0, 2],
  );
  assert.deepEqual(
    kickOnly.strokes.map((step) => step.column),
    [0, 4],
  );
  assert.equal(kickOnly.cycleBeats, 4);
});

test("the measure loops without a gap or a drift at the bar line", () => {
  const timeline = buildKitTimeline(pattern, all);
  assert.equal(beatOfOrdinal(timeline, 7), 3.5);
  assert.equal(beatOfOrdinal(timeline, 8), 4);
  assert.equal(gapBeforeOrdinal(timeline, 8), 0.5);
  assert.equal(beatOfOrdinal(timeline, 8 * 500), 4 * 500);

  const sparse = buildKitTimeline(pattern, [KICK]);
  assert.equal(gapBeforeOrdinal(sparse, 2), 2);
});

test("event times follow the tempo: an eighth at 70 BPM is half of 60000/70 ms", () => {
  const timeline = buildKitTimeline(pattern, all);
  const unitMs = msPerQuarterUnit(fourWay.defaultTempo);
  assert.equal(unitMs, 60000 / 70);
  const anchor = { time: 1000, beat: 0, unitMs };
  assert.equal(onsetAt(anchor, timeline, 1), 1000 + unitMs / 2);
  assert.equal(onsetAt(anchor, timeline, 8), 1000 + 4 * unitMs);

  const faster = msPerQuarterUnit({ ...fourWay.defaultTempo, bpm: 140 });
  assert.equal(faster, unitMs / 2);
});

test("a practice session can point at the exercise by a stable id and version", () => {
  assert.deepEqual(sessionReference(fourWay), {
    rudimentId: "four-way-coordination",
    patternId: "standard",
    patternVersion: 1,
  });
  const ids = kitExercises.map((exercise) => exercise.id);
  assert.equal(new Set(ids).size, ids.length);
});

const sampled = [36, 38, 42, 44, 45, 46, 48, 51];

for (const exercise of kitExercises) {
  const columns = columnCount(exercise.pattern);

  test(`${exercise.name}: every note sits on the grid, inside the bar, and has a sound`, () => {
    for (const event of exercise.pattern.events) {
      const column = toNumber(event.at) * exercise.pattern.stepsPerBeat;
      assert.equal(Number.isInteger(column), true, event.id);
      assert.equal(column >= 0 && column < columns, true, event.id);
      assert.equal(sampled.includes(event.note), true, event.id);
    }
    const ids = exercise.pattern.events.map((event) => event.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(countLabels(exercise.pattern).length, columns);
  });

  test(`${exercise.name}: each instrument has one limb, and no limb plays two things at once`, () => {
    for (const note of notesOf(exercise.pattern)) {
      const limbs = new Set(
        exercise.pattern.events
          .filter((event) => event.note === note)
          .map((event) => event.limb),
      );
      assert.equal(limbs.size, 1, midiNoteName(note));
    }
    const busy = exercise.pattern.events.map(
      (event) => `${event.limb}@${toNumber(event.at)}`,
    );
    assert.equal(new Set(busy).size, busy.length);
  });

  test(`${exercise.name}: stages only add instruments and end with the whole pattern`, () => {
    exercise.stages.forEach((stage, index) => {
      const before = exercise.stages[index - 1]?.notes ?? [];
      assert.equal(
        before.every((note) => stage.notes.includes(note)),
        true,
        stage.id,
      );
      assert.equal(stage.notes.length > before.length, true, stage.id);
    });
    assert.deepEqual(
      [...exercise.stages.at(-1)!.notes].sort(),
      [...notesOf(exercise.pattern)].sort(),
    );
    const titles = exercise.stages.map((stage) => stage.title);
    assert.equal(new Set(titles).size, titles.length);
  });
}

test("bars in sixteenths and triplets are counted the way drummers say them", () => {
  assert.deepEqual(countLabels(findKitExercise("samba-feet")!.pattern), [
    "1",
    "e",
    "&",
    "a",
    "2",
    "e",
    "&",
    "a",
  ]);
  assert.equal(columnCount(findKitExercise("swing-time")!.pattern), 12);
});

const openGroove = findKitExercise("open-hihat-groove")!;

test("open and closed hi-hat share one row but stay separate notes", () => {
  const rows = rowsOf(openGroove.pattern);
  assert.deepEqual(
    rows.map((row) => row.name),
    ["Hi-hat", "Snare", "Pedal", "Kick"],
  );
  const hihat = rows[0]!;
  assert.deepEqual(hihat.notes, [42, 46]);
  assert.deepEqual(hihat.cells, [
    "strike",
    "strike",
    "strike",
    "open",
    "strike",
    "strike",
    "strike",
    "open",
  ]);
  assert.equal(
    openGroove.pattern.events.filter((event) => event.note === 46).length,
    2,
  );
});

test("turning a row off silences its notes and leaves the pattern as written", () => {
  const rows = rowsOf(openGroove.pattern);
  const everything = notesOf(openGroove.pattern);
  const before = structuredClone(openGroove.pattern);

  const withoutHihat = toggled(everything, rows[0]!);
  assert.deepEqual([...withoutHihat].sort(), [36, 38, 44]);
  assert.deepEqual(
    [...toggled(withoutHihat, rows[0]!)].sort(),
    [...everything].sort(),
  );
  assert.deepEqual(toggled([], rows[3]!), [36]);
  assert.deepEqual(openGroove.pattern, before);

  const audible = buildKitTimeline(openGroove.pattern, everything)
    .strokes.flatMap((step) => step.events)
    .filter((event) => withoutHihat.includes(event.note));
  assert.equal(
    audible.some((event) => event.note === 42 || event.note === 46),
    false,
  );
  assert.equal(audible.length, 6);
});

test("the label names a known combination, or says it is the drummer's own", () => {
  assert.equal(partsLabel(fourWay, [51]), "Ride · Stage 1 of 4");
  assert.equal(partsLabel(fourWay, [36, 51]), "Ride + Kick · Stage 2 of 4");
  assert.equal(partsLabel(fourWay, all), "All four parts · Stage 4 of 4");
  assert.equal(partsLabel(fourWay, [38]), "Your own mix");
  assert.equal(partsLabel(fourWay, []), "Your own mix");
  assert.equal(partsLabel(openGroove, [42, 46]), "Hi-hat · Stage 1 of 4");
});

test("pictures the smallest kit that holds every piece of an exercise", () => {
  assert.equal(kitSetup([42, 38, 36]), "hihat-snare-kick");
  assert.equal(kitSetup([42, 46, 44, 38, 36]), "hihat-snare-kick");
  assert.equal(kitSetup([51, 38, 36, 44]), "hihat-snare-kick-ride");
  assert.equal(kitSetup([45, 48, 36, 44]), "full");
  assert.equal(kitSetup([49, 38, 36]), "full");
});

test("has a kit picture for every bundled exercise", () => {
  const setups = Object.fromEntries(
    kitExercises.map((exercise) => [
      exercise.id,
      kitSetup(notesOf(exercise.pattern)),
    ]),
  );

  assert.equal(setups["eighth-note-rock-beat"], "hihat-snare-kick");
  assert.equal(setups["open-hihat-groove"], "hihat-snare-kick");
  assert.equal(setups["left-foot-backbeat"], "hihat-snare-kick-ride");
  assert.equal(setups["linear-four-way"], "full");
});

test("the snare plays every eighth note over kick on 1 and 3 and pedal on 2 and 4", () => {
  const rows = rowsOf(findKitExercise("snare-over-feet")!.pattern);
  assert.deepEqual(
    rows.map((row) => [
      row.name,
      row.cells.flatMap((cell, column) => (cell === "strike" ? [column] : [])),
    ]),
    [
      ["Snare", [0, 1, 2, 3, 4, 5, 6, 7]],
      ["Pedal", [2, 6]],
      ["Kick", [0, 4]],
    ],
  );
});

test("rows run from the cymbals down to the kick, whatever order an exercise is written in", () => {
  for (const exercise of kitExercises) {
    const names = rowsOf(exercise.pattern).map((row) => row.name);
    assert.equal(names.at(-1), "Kick", exercise.name);
  }
  assert.deepEqual(
    rowsOf(findKitExercise("linear-four-way")!.pattern).map((row) => row.name),
    ["High tom", "Floor tom", "Pedal", "Kick"],
  );
});

test("exercise names are short enough for one line on a small iPhone", () => {
  assert.deepEqual(
    kitExercises.map((exercise) => exercise.name),
    [
      "Snare + Feet",
      "Rock Beat",
      "Pedal on 2 & 4",
      "Four-Way",
      "Open Hi-Hat",
      "Linear Four-Way",
      "Samba",
      "Jazz Swing",
    ],
  );
  assert.ok(kitExercises.every((exercise) => exercise.name.length <= 15));
});

test("the playhead visits every count, including the ones where nothing is written", () => {
  for (const exercise of kitExercises) {
    const grid = buildKitGrid(exercise.pattern);
    assert.deepEqual(
      grid.strokes.map((step) => step.column),
      Array.from(
        { length: columnCount(exercise.pattern) },
        (_, column) => column,
      ),
      exercise.name,
    );
    assert.equal(
      grid.strokes.flatMap((step) => step.events).length,
      exercise.pattern.events.length,
      exercise.name,
    );
  }

  const samba = buildKitGrid(findKitExercise("samba-feet")!.pattern);
  assert.deepEqual(samba.strokes[1], { beat: 0.25, column: 1, events: [] });
  assert.equal(gapBeforeOrdinal(samba, 8), 0.25);
});
