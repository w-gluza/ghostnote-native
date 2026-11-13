import assert from "node:assert/strict";
import { test } from "node:test";

import { findRudiment } from "./library.ts";
import {
  beatOfOrdinal,
  beatsUntilSameHand,
  clampBpm,
  gapBeforeOrdinal,
  leadMs,
  loopBeats,
  msPerBeat,
  nextIndexOfHand,
  scheduleStrokes,
  strokeBeats,
} from "./timing.ts";
import type { RudimentPattern } from "./types.ts";

const paradiddle: RudimentPattern = {
  ...findRudiment("single-paradiddle")!.pattern,
  subdivision: 4,
};

const swung: RudimentPattern = {
  subdivision: 3,
  strokes: [
    { hand: "R", length: 2 },
    { hand: "L" },
    { hand: "R", length: 2 },
    { hand: "L" },
  ],
};

test("single paradiddle sticking is R L R R L R L L", () => {
  const hands = scheduleStrokes(paradiddle, 60, 8).map((stroke) => stroke.hand);
  assert.equal(hands.join(" "), "R L R R L R L L");
});

test("single paradiddle accents the first stroke of each group", () => {
  const accents = scheduleStrokes(paradiddle, 60, 8)
    .filter((stroke) => stroke.accent)
    .map((stroke) => stroke.index);
  assert.deepEqual(accents, [0, 4]);
});

test("sixteenth notes are evenly spaced at the given tempo", () => {
  const times = scheduleStrokes(paradiddle, 60, 5).map(
    (stroke) => stroke.timeMs,
  );
  assert.deepEqual(times, [0, 250, 500, 750, 1000]);
});

test("the pattern loops without a gap or overlap", () => {
  const strokes = scheduleStrokes(paradiddle, 120, 17);
  assert.equal(strokes[8]?.index, 0);
  assert.equal(strokes[8]?.timeMs, 1000);
  assert.equal(strokes[16]?.timeMs, 2000);
  const gaps = strokes
    .slice(1)
    .map((stroke, i) => stroke.timeMs - strokes[i]!.timeMs);
  assert.ok(gaps.every((gap) => gap === 125));
});

test("halving the tempo doubles every stroke time", () => {
  const full = scheduleStrokes(paradiddle, 100, 8);
  const half = scheduleStrokes(paradiddle, 50, 8);
  full.forEach((stroke, i) => {
    assert.equal(half[i]?.timeMs, stroke.timeMs * 2);
  });
});

test("stroke lengths shape uneven rhythms", () => {
  assert.deepEqual(strokeBeats(swung), [0, 2 / 3, 1, 5 / 3]);
  assert.equal(loopBeats(swung), 2);
  assert.equal(beatOfOrdinal(swung, 5), 2 + 2 / 3);
  assert.equal(gapBeforeOrdinal(swung, 1), 2 / 3);
  assert.equal(gapBeforeOrdinal(swung, 0), 1 / 3);
});

test("next stroke of the same hand wraps around the loop", () => {
  assert.equal(nextIndexOfHand(paradiddle, 2), 3);
  assert.equal(nextIndexOfHand(paradiddle, 5), 0);
  assert.equal(nextIndexOfHand(paradiddle, 7), 1);
});

test("lead time never exceeds the gap and is capped", () => {
  assert.equal(leadMs(100), 45);
  assert.equal(leadMs(1000), 220);
});

test("tempo helpers", () => {
  assert.equal(msPerBeat(120), 500);
  assert.equal(clampBpm(10), 40);
  assert.equal(clampBpm(500), 200);
  assert.equal(clampBpm(84.6), 85);
});

test("time until the same hand plays again follows the sticking", () => {
  const gaps = paradiddle.strokes.map((_, index) =>
    beatsUntilSameHand(paradiddle, index),
  );
  assert.deepEqual(gaps, [0.5, 0.75, 0.25, 0.5, 0.5, 0.75, 0.25, 0.5]);
});

test("library rudiments start on quarter notes in groups of four", () => {
  const pattern = findRudiment("single-paradiddle")!.pattern;
  const times = scheduleStrokes(pattern, 60, 3).map((stroke) => stroke.timeMs);
  assert.deepEqual(times, [0, 1000, 2000]);
  assert.equal(pattern.grouping, 4);
});
