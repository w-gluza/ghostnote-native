import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import {
  beatOfOrdinal,
  clampBpm,
  gapBeforeOrdinal,
  leadMs,
  msPerQuarterUnit,
  onsetAt,
  quarterTempo,
  retimed,
  type Loop,
} from "./timing.ts";

const sixteenths: Loop = {
  cycleBeats: 2,
  strokes: Array.from({ length: 8 }, (_, index) => ({ beat: index / 4 })),
};

const swung: Loop = {
  cycleBeats: 2,
  strokes: [{ beat: 0 }, { beat: 2 / 3 }, { beat: 1 }, { beat: 5 / 3 }],
};

test("uneven rhythms keep their own spacing across the loop", () => {
  assert.equal(beatOfOrdinal(swung, 5), 2 + 2 / 3);
  assert.equal(gapBeforeOrdinal(swung, 1), 2 / 3);
  assert.ok(Math.abs(gapBeforeOrdinal(swung, 0) - 1 / 3) < 1e-9);
  assert.ok(Math.abs(gapBeforeOrdinal(swung, 4) - 1 / 3) < 1e-9);
});

test("lead time never exceeds the gap and is capped", () => {
  assert.equal(leadMs(100), 45);
  assert.equal(leadMs(1000), 220);
});

test("tempo helpers", () => {
  assert.equal(msPerQuarterUnit(quarterTempo(120)), 500);
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

test("a tempo change keeps strokes already scheduled and retimes the rest", () => {
  const start = { time: 1000, beat: 0, unitMs: 1000 };
  assert.equal(onsetAt(start, sixteenths, 2), 1500);

  const faster = retimed(start, sixteenths, 2, 500);
  assert.equal(onsetAt(faster, sixteenths, 2), 1500);
  assert.equal(onsetAt(faster, sixteenths, 3), 1625);
  assert.equal(onsetAt(faster, sixteenths, 10), 2500);

  const slower = retimed(faster, sixteenths, 3, 2000);
  assert.equal(onsetAt(slower, sixteenths, 3), 1625);
  assert.equal(onsetAt(slower, sixteenths, 4), 2125);
});
