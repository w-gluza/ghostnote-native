import assert from "node:assert/strict";
import { test } from "node:test";

import {
  add,
  fraction,
  isReduced,
  toNumber,
} from "../../../playback/fraction.ts";
import {
  findRudiment,
  resolvePattern,
  rudimentLibrary,
  defaultPattern,
  stickingOf,
} from "./library.ts";
import { parsePattern } from "./notation.ts";
import { buildTimeline, evenStep } from "./timeline.ts";
import type { RudimentPattern } from "./types.ts";
import {
  validatePattern,
  validateRudiment,
  validateTempo,
} from "./validate.ts";

const patternOf = (id: string) => defaultPattern(findRudiment(id)!);

const valid: RudimentPattern = {
  id: "standard",
  label: "Standard",
  version: 1,
  cycleDuration: fraction(1),
  strokes: [
    { id: "g", kind: "grace", hand: "L", beforeStrokeId: "a", order: 0 },
    { id: "a", kind: "onset", hand: "R", at: fraction(0) },
    { id: "b", kind: "onset", hand: "L", at: fraction(1, 2) },
  ],
  groups: [{ id: "p1", kind: "phrase", strokeIds: ["a", "b"] }],
};

test("fractions reduce and add exactly", () => {
  assert.deepEqual(fraction(2, 4), { numerator: 1, denominator: 2 });
  assert.deepEqual(fraction(1, -3), { numerator: -1, denominator: 3 });
  assert.deepEqual(add(fraction(1, 3), fraction(1, 6)), fraction(1, 2));
  assert.equal(isReduced({ numerator: 2, denominator: 4 }), false);
  assert.equal(isReduced({ numerator: 0, denominator: 3 }), false);
  assert.throws(() => fraction(1, 0));
  assert.throws(() => fraction(0.5, 1));
});

test("the library holds all forty rudiments, numbered in order", () => {
  assert.deepEqual(
    rudimentLibrary.map((rudiment) => rudiment.pasNumber),
    Array.from({ length: 40 }, (_, index) => index + 1),
  );
  assert.equal(
    new Set(rudimentLibrary.map((rudiment) => rudiment.id)).size,
    40,
  );
});

test("every rudiment in the library passes validation", () => {
  assert.deepEqual(rudimentLibrary.flatMap(validateRudiment), []);
});

test("every rudiment loops over a whole number of quarter notes", () => {
  for (const rudiment of rudimentLibrary) {
    const cycle = defaultPattern(rudiment).cycleDuration;
    assert.equal(cycle.denominator, 1, rudiment.name);
  }
});

test("pattern references resolve only to a published version", () => {
  const reference = {
    rudimentId: "flam-accent",
    patternId: "standard",
    patternVersion: 1,
  };
  assert.equal(resolvePattern(reference), patternOf("flam-accent"));
  assert.equal(resolvePattern({ ...reference, patternVersion: 2 }), undefined);
});

test("single stroke roll is even, unaccented and alternating", () => {
  const pattern = patternOf("single-stroke-roll");
  assert.deepEqual(evenStep(pattern), fraction(1, 8));
  assert.ok(pattern.strokes.every((stroke) => stroke.kind === "onset"));
  assert.equal(
    stickingOf(findRudiment("single-stroke-roll")!),
    "R L R L R L R L",
  );
});

test("flam accent puts one grace note before each accented triplet", () => {
  const pattern = patternOf("flam-accent");
  const timeline = buildTimeline(pattern);
  assert.deepEqual(pattern.cycleDuration, fraction(2));
  assert.deepEqual(
    timeline.strokes.map((stroke) => stroke.grace.join("")),
    ["L", "", "", "R", "", ""],
  );
  assert.deepEqual(
    timeline.strokes.map((stroke) => stroke.accent),
    [true, false, false, true, false, false],
  );
  assert.ok(Math.abs((timeline.strokes[1]?.beat ?? 0) - 1 / 3) < 1e-9);
  assert.deepEqual(timeline.phrases, [
    [0, 1, 2],
    [3, 4, 5],
  ]);
});

test("swiss army triplet keeps the same lead hand and marks its double", () => {
  const pattern = patternOf("swiss-army-triplet");
  assert.equal(
    stickingOf(findRudiment("swiss-army-triplet")!),
    "lR R L lR R L",
  );
  assert.deepEqual(
    pattern.groups?.filter((group) => group.kind === "diddle"),
    [
      { id: "d1", kind: "diddle", strokeIds: ["s1", "s2"] },
      { id: "d2", kind: "diddle", strokeIds: ["s4", "s5"] },
    ],
  );
});

test("multiple bounce roll marks every stroke as a bounce", () => {
  const timeline = buildTimeline(patternOf("multiple-bounce-roll"));
  assert.ok(timeline.strokes.every((stroke) => stroke.bounce));
});

test("single ratamacue has a two-note drag and an uneven rhythm", () => {
  const pattern = patternOf("single-ratamacue");
  const timeline = buildTimeline(pattern);
  assert.equal(evenStep(pattern), undefined);
  assert.deepEqual(timeline.strokes[0]?.grace, ["L", "L"]);
  assert.deepEqual(
    pattern.strokes
      .filter((stroke) => stroke.kind === "onset")
      .map((stroke) => toNumber(stroke.at) * 3),
    [0, 1, 2, 3, 6, 7, 8, 9],
  );
  assert.deepEqual(pattern.cycleDuration, fraction(4));
});

test("notation reads ghost notes and fractional lengths", () => {
  const pattern = parsePattern({
    id: "standard",
    label: "Standard",
    version: 1,
    subdivision: 4,
    sticking: ".R:1/2 L:1/2 >R:3",
  });
  const onsets = pattern.strokes.flatMap((stroke) =>
    stroke.kind === "onset" ? [stroke] : [],
  );
  assert.deepEqual(
    onsets.map((stroke) => stroke.dynamics),
    ["ghost", undefined, "accent"],
  );
  assert.deepEqual(onsets[1]?.at, fraction(1, 8));
  assert.deepEqual(pattern.cycleDuration, fraction(1));
  assert.throws(() =>
    parsePattern({ ...pattern, subdivision: 4, sticking: "X" }),
  );
});

test("notation refuses a stroke with no length", () => {
  const source = {
    id: "standard",
    label: "Standard",
    version: 1,
    subdivision: 1,
  };
  assert.throws(() => parsePattern({ ...source, sticking: "R:0 L" }));
  assert.throws(() => parsePattern({ ...source, sticking: "R:1/0 L" }));
});

test("validation rejects unknown hands, stroke kinds and group kinds", () => {
  const stored = (change: object) =>
    validatePattern({ ...valid, ...change }).length;
  assert.ok(
    stored({
      strokes: [{ id: "a", kind: "onset", hand: "X", at: fraction(0) }],
      groups: [],
    }),
  );
  assert.ok(
    stored({
      strokes: [{ id: "a", kind: "tap", hand: "R", at: fraction(0) }],
      groups: [],
    }),
  );
  assert.ok(
    stored({ groups: [{ id: "g", kind: "unknown", strokeIds: ["a"] }] }),
  );
  assert.ok(stored({ strokes: "R L" }));
  assert.ok(stored({ strokes: [{ id: "a", kind: "onset", hand: "R" }] }));
});

test("validation reports malformed stored data instead of throwing", () => {
  const { cycleDuration: _cycle, ...withoutCycle } = valid;
  for (const stored of [
    null,
    "pattern",
    [],
    withoutCycle,
    { ...valid, strokes: [null] },
    { ...valid, strokes: [{ id: "a", kind: "onset", hand: "R", at: "0" }] },
    { ...valid, groups: [null] },
    { ...valid, groups: [{ id: "g", kind: "phrase", strokeIds: "a" }] },
  ]) {
    assert.ok(validatePattern(stored).length > 0);
  }
  assert.ok(validateRudiment(null).length > 0);
  assert.ok(validateRudiment({ id: "x", name: "X", patterns: [null] }).length);
  assert.ok(validateTempo(null).length > 0);
  assert.ok(validateTempo({ bpm: "80", pulseQuarterUnits: null }).length);
});

test("a rudiment names its default pattern instead of relying on order", () => {
  const rudiment = findRudiment("single-paradiddle")!;
  const older = { ...defaultPattern(rudiment), version: 0, label: "Draft" };
  const reordered = { ...rudiment, patterns: [older, ...rudiment.patterns] };
  assert.equal(defaultPattern(reordered).version, 1);
  assert.ok(
    validateRudiment({
      ...rudiment,
      defaultPattern: { patternId: "standard", patternVersion: 9 },
    }).length,
  );
});

test("simultaneous strokes keep their source order", () => {
  const timeline = buildTimeline({
    ...valid,
    strokes: [
      { id: "b", kind: "onset", hand: "L", at: fraction(0) },
      { id: "a", kind: "onset", hand: "R", at: fraction(0) },
    ],
    groups: [],
  });
  assert.deepEqual(
    timeline.strokes.map((stroke) => stroke.id),
    ["b", "a"],
  );
});

test("validation accepts a sound pattern and names each broken rule", () => {
  assert.deepEqual(validatePattern(valid), []);
  const broken = (change: Partial<RudimentPattern>) =>
    validatePattern({ ...valid, ...change }).length;

  assert.ok(broken({ cycleDuration: fraction(0) }));
  assert.ok(broken({ cycleDuration: { numerator: 2, denominator: 2 } }));
  assert.ok(broken({ version: 0 }));
  assert.ok(broken({ cycleDuration: fraction(1, 2) }));
  assert.ok(broken({ strokes: [...valid.strokes, valid.strokes[1]!] }));
  assert.ok(
    broken({
      strokes: [
        ...valid.strokes,
        { id: "h", kind: "grace", hand: "R", beforeStrokeId: "g", order: 0 },
      ],
    }),
  );
  assert.ok(
    broken({
      strokes: [
        ...valid.strokes,
        { id: "h", kind: "grace", hand: "L", beforeStrokeId: "a", order: 0 },
      ],
    }),
  );
  assert.ok(
    broken({ groups: [{ id: "p1", kind: "phrase", strokeIds: ["missing"] }] }),
  );
});

test("tempo validation rejects impossible tempos", () => {
  assert.deepEqual(
    validateTempo({ bpm: 80, pulseQuarterUnits: fraction(3, 2) }),
    [],
  );
  assert.ok(validateTempo({ bpm: 0, pulseQuarterUnits: fraction(1) }).length);
  assert.ok(validateTempo({ bpm: 80, pulseQuarterUnits: fraction(0) }).length);
});
