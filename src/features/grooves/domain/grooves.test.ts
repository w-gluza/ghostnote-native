import assert from "node:assert/strict";
import { test } from "node:test";

import {
  kitExercises,
  notesOf,
} from "../../kit-coordination/domain/exercises.ts";
import { midiNoteName } from "../../kit-coordination/domain/midi-map.ts";
import { columnCount, rowsOf } from "../../kit-coordination/domain/timeline.ts";
import { toNumber } from "../../../playback/fraction.ts";
import { rudimentLibrary } from "../../rudiments/domain/library.ts";
import { findGroove, grooves } from "./grooves.ts";

const sampled = [36, 38, 42, 44, 45, 46, 48, 51];

function strikes(id: string) {
  return Object.fromEntries(
    rowsOf(findGroove(id)!.pattern).map((row) => [
      row.name,
      row.cells.flatMap((cell, column) => (cell === "rest" ? [] : [column])),
    ]),
  );
}

test("groove ids are unique and never collide with another exercise", () => {
  const ids = grooves.map((groove) => groove.id);
  assert.equal(new Set(ids).size, ids.length);
  const others = [
    ...kitExercises.map((exercise) => exercise.id),
    ...rudimentLibrary.map((rudiment) => rudiment.id),
  ];
  assert.equal(
    ids.some((id) => others.includes(id)),
    false,
  );
});

test("grooves are listed from the easiest level up", () => {
  const levels = grooves.map((groove) => groove.level);
  assert.deepEqual(
    levels,
    [...levels].sort((first, second) => first - second),
  );
});

for (const groove of grooves) {
  test(`${groove.name}: every note sits on the grid, inside the bar, and has a sound`, () => {
    const columns = columnCount(groove.pattern);
    for (const event of groove.pattern.events) {
      const column = toNumber(event.at) * groove.pattern.stepsPerBeat;
      assert.equal(Number.isInteger(column), true, event.id);
      assert.equal(column >= 0 && column < columns, true, event.id);
      assert.equal(sampled.includes(event.note), true, event.id);
    }
    const ids = groove.pattern.events.map((event) => event.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test(`${groove.name}: each instrument has one limb, and no limb plays two things at once`, () => {
    for (const note of notesOf(groove.pattern)) {
      const limbs = new Set(
        groove.pattern.events
          .filter((event) => event.note === note)
          .map((event) => event.limb),
      );
      assert.equal(limbs.size, 1, midiNoteName(note));
    }
    const busy = groove.pattern.events.map(
      (event) => `${event.limb}@${toNumber(event.at)}`,
    );
    assert.equal(new Set(busy).size, busy.length);
  });

  test(`${groove.name}: stages add one row at a time and end with the whole groove`, () => {
    groove.stages.forEach((stage, index) => {
      const before = groove.stages[index - 1]?.notes ?? [];
      assert.equal(
        before.every((note) => stage.notes.includes(note)),
        true,
      );
      assert.equal(stage.notes.length > before.length, true);
    });
    assert.deepEqual(
      [...groove.stages.at(-1)!.notes].sort(),
      [...notesOf(groove.pattern)].sort(),
    );
    assert.equal(groove.stages.at(-1)!.title, "Full groove");
    assert.equal(rowsOf(groove.pattern).at(-1)!.name, "Kick");
  });
}

test("the basic rock beat has eighths on the hi-hat, snare on 2 and 4, kick on 1 and 3", () => {
  assert.deepEqual(strikes("groove-basic-rock"), {
    "Hi-hat": [0, 1, 2, 3, 4, 5, 6, 7],
    Snare: [2, 6],
    Kick: [0, 4],
  });
});

test("the syncopated rock beat adds a kick on the and of 2", () => {
  assert.deepEqual(strikes("groove-syncopated-rock"), {
    "Hi-hat": [0, 1, 2, 3, 4, 5, 6, 7],
    Snare: [2, 6],
    Kick: [0, 3, 4],
  });
});

test("the shuffle leaves out the middle note of every triplet", () => {
  assert.deepEqual(strikes("groove-shuffle"), {
    "Hi-hat": [0, 2, 3, 5, 6, 8, 9, 11],
    Snare: [3, 9],
    Kick: [0, 6],
  });
});

test("the half-time shuffle ghosts the middle triplets and lands the backbeat on 3", () => {
  const snare = findGroove("groove-half-time-shuffle")!.pattern.events.filter(
    (event) => event.note === 38,
  );
  assert.deepEqual(
    snare.map((event) => [toNumber(event.at) * 3, event.velocity]),
    [
      [1, 64],
      [4, 64],
      [7, 64],
      [10, 64],
      [6, 100],
    ],
  );
});

test("disco opens the hi-hat on every offbeat over four on the floor", () => {
  const rows = rowsOf(findGroove("groove-disco")!.pattern);
  assert.deepEqual(rows[0]!.cells, [
    "strike",
    "open",
    "strike",
    "open",
    "strike",
    "open",
    "strike",
    "open",
  ]);
  assert.deepEqual(strikes("groove-disco").Kick, [0, 2, 4, 6]);
});
