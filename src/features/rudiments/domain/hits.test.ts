import assert from "node:assert/strict";
import { test } from "node:test";

import { hitsOf } from "./hits.ts";

const tap = { accent: false, bounce: false, grace: [] };

test("a plain stroke is one full tap on the beat and an accent uses the accent sample", () => {
  assert.deepEqual(hitsOf(tap, 400), [
    { sample: "tap", level: "full", offsetMs: 0 },
  ]);
  assert.deepEqual(hitsOf({ ...tap, accent: true }, 400), [
    { sample: "accent", level: "full", offsetMs: 0 },
  ]);
});

test("a flam plays one quiet grace note just before the stroke", () => {
  assert.deepEqual(hitsOf({ ...tap, grace: ["L"] }, 400), [
    { sample: "tap", level: "grace", offsetMs: -35 },
    { sample: "tap", level: "full", offsetMs: 0 },
  ]);
});

test("a drag plays two grace notes in order before the stroke", () => {
  assert.deepEqual(
    hitsOf({ ...tap, grace: ["L", "L"] }, 400).map((hit) => hit.offsetMs),
    [-70, -35, 0],
  );
});

test("grace notes squeeze together at fast tempos so they stay after the previous stroke", () => {
  const offsets = hitsOf({ ...tap, grace: ["L", "L"] }, 80).map(
    (hit) => hit.offsetMs,
  );
  assert.deepEqual(offsets, [-40, -20, 0]);
});

test("a bounce stroke is followed by quieter rebounds that end before the next stroke", () => {
  const hits = hitsOf({ ...tap, bounce: true }, 400);
  assert.deepEqual(
    hits.map((hit) => [hit.level, hit.offsetMs]),
    [
      ["full", 0],
      ["soft", 28],
      ["grace", 56],
      ["grace", 84],
    ],
  );
  const fast = hitsOf({ ...tap, bounce: true }, 100);
  assert.ok(fast.every((hit) => hit.offsetMs < 100));
});
