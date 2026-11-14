import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import { findRudiment, standardPattern } from "./library.ts";
import { buildTimeline, scaleToStep, type Timeline } from "./timeline.ts";
import {
  beatOfOrdinal,
  beatsUntilSameHand,
  clampBpm,
  gapBeforeOrdinal,
  leadMs,
  msPerBeat,
  msPerQuarterUnit,
  nextIndexOfHand,
  scheduleStrokes,
} from "./timing.ts";

const paradiddlePattern = standardPattern(findRudiment("single-paradiddle")!);
const paradiddle = buildTimeline(paradiddlePattern);

const tap = { accent: false, ghost: false, bounce: false, grace: [] };
const swung: Timeline = {
  cycleBeats: 2,
  strokes: [
    { ...tap, id: "s1", hand: "R", beat: 0 },
    { ...tap, id: "s2", hand: "L", beat: 2 / 3 },
    { ...tap, id: "s3", hand: "R", beat: 1 },
    { ...tap, id: "s4", hand: "L", beat: 5 / 3 },
  ],
  phrases: [[0, 1, 2, 3]],
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

test("uneven rhythms keep their own spacing across the loop", () => {
  assert.equal(beatOfOrdinal(swung, 5), 2 + 2 / 3);
  assert.equal(gapBeforeOrdinal(swung, 1), 2 / 3);
  assert.ok(Math.abs(gapBeforeOrdinal(swung, 0) - 1 / 3) < 1e-9);
  assert.ok(Math.abs(gapBeforeOrdinal(swung, 4) - 1 / 3) < 1e-9);
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

test("a dotted-quarter pulse stretches the quarter-note unit", () => {
  assert.equal(msPerQuarterUnit({ bpm: 120, pulseQuarterUnits: ONE }), 500);
  assert.equal(
    msPerQuarterUnit({ bpm: 80, pulseQuarterUnits: fraction(3, 2) }),
    500,
  );
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
  const times = scheduleStrokes(quarters, 60, 3).map((stroke) => stroke.timeMs);
  assert.deepEqual(times, [0, 1000, 2000]);
  assert.equal(quarters.cycleBeats, 8);
  assert.deepEqual(quarters.phrases, [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
  ]);
});
