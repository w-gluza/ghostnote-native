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
  limbName,
  limbOf,
  notesLabel,
  notesOf,
  sessionReference,
  stageChips,
} from "./exercises.ts";
import { midiNoteName, velocityLevel, type MidiNote } from "./midi-map.ts";
import {
  buildKitTimeline,
  columnCount,
  countLabels,
  strikesOf,
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

test("Four-Way Coordination is a level 2 exercise in 4/4 at 70 BPM, counted in eighths", () => {
  assert.equal(fourWay.name, "Four-Way Coordination");
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
  assert.deepEqual(strikesOf(pattern, KICK), [
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
  ]);
  assert.equal(strikesOf(pattern, RIDE).every(Boolean), true);
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

test("the stage buttons name what each stage adds", () => {
  assert.deepEqual(stageChips(fourWay), [
    "Ride",
    "+ Kick",
    "+ Snare",
    "+ Hi-hat pedal",
  ]);
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
    const chips = stageChips(exercise);
    assert.equal(new Set(chips).size, chips.length);
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
