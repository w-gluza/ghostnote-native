import assert from "node:assert/strict";
import { test } from "node:test";

import { ONE } from "../../../playback/fraction.ts";
import { quarterTempo } from "../../../playback/timing.ts";
import { findRudiment, defaultPattern } from "./library.ts";
import { buildTimeline, scaleToStep } from "./timeline.ts";
import {
  beatsUntilSameHand,
  nextIndexOfHand,
  scheduleStrokes,
} from "./timing.ts";

const paradiddlePattern = defaultPattern(findRudiment("single-paradiddle")!);
const paradiddle = buildTimeline(paradiddlePattern);

test("single paradiddle sticking is R L R R L R L L", () => {
  const hands = scheduleStrokes(paradiddle, quarterTempo(60), 8).map(
    (stroke) => stroke.hand,
  );
  assert.equal(hands.join(" "), "R L R R L R L L");
});

test("single paradiddle accents the first stroke of each group", () => {
  const accents = scheduleStrokes(paradiddle, quarterTempo(60), 8)
    .filter((stroke) => stroke.accent)
    .map((stroke) => stroke.index);
  assert.deepEqual(accents, [0, 4]);
});

test("sixteenth notes are evenly spaced at the given tempo", () => {
  const times = scheduleStrokes(paradiddle, quarterTempo(60), 5).map(
    (stroke) => stroke.timeMs,
  );
  assert.deepEqual(times, [0, 250, 500, 750, 1000]);
});

test("the pattern loops without a gap or overlap", () => {
  const strokes = scheduleStrokes(paradiddle, quarterTempo(120), 17);
  assert.equal(strokes[8]?.index, 0);
  assert.equal(strokes[8]?.timeMs, 1000);
  assert.equal(strokes[16]?.timeMs, 2000);
  const gaps = strokes
    .slice(1)
    .map((stroke, i) => stroke.timeMs - strokes[i]!.timeMs);
  assert.ok(gaps.every((gap) => gap === 125));
});

test("halving the tempo doubles every stroke time", () => {
  const full = scheduleStrokes(paradiddle, quarterTempo(100), 8);
  const half = scheduleStrokes(paradiddle, quarterTempo(50), 8);
  full.forEach((stroke, i) => {
    assert.equal(half[i]?.timeMs, stroke.timeMs * 2);
  });
});

test("next stroke of the same hand wraps around the loop", () => {
  assert.equal(nextIndexOfHand(paradiddle, 2), 3);
  assert.equal(nextIndexOfHand(paradiddle, 5), 0);
  assert.equal(nextIndexOfHand(paradiddle, 7), 1);
});

test("time until the same hand plays again follows the sticking", () => {
  const gaps = paradiddle.strokes.map((_, index) =>
    beatsUntilSameHand(paradiddle, index),
  );
  assert.deepEqual(gaps, [0.5, 0.75, 0.25, 0.5, 0.5, 0.75, 0.25, 0.5]);
});

test("an even pattern can be stretched to quarter-note strokes", () => {
  const quarters = buildTimeline(
    paradiddlePattern,
    scaleToStep(paradiddlePattern, ONE),
  );
  const times = scheduleStrokes(quarters, quarterTempo(60), 3).map(
    (stroke) => stroke.timeMs,
  );
  assert.deepEqual(times, [0, 1000, 2000]);
  assert.equal(quarters.cycleBeats, 8);
  assert.deepEqual(quarters.phrases, [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
  ]);
});
