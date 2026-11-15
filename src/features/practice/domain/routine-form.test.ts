import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDuration, parseDuration, parseTempo } from "./routine-form.ts";

test("a round duration reads as minutes and two-digit seconds", () => {
  assert.equal(formatDuration(120), "2:00");
  assert.equal(formatDuration(95), "1:35");
  assert.equal(formatDuration(10), "0:10");
  assert.equal(formatDuration(1800), "30:00");
});

test("a typed duration is minutes, optionally with seconds", () => {
  assert.equal(parseDuration("2"), 120);
  assert.equal(parseDuration("2:30"), 150);
  assert.equal(parseDuration(" 1:05 "), 65);
  assert.equal(parseDuration("0:10"), 10);
  assert.equal(parseDuration("1:5"), 65);
  assert.equal(parseDuration("0:90"), 90);
});

test("a formatted duration parses back to the same seconds", () => {
  for (const seconds of [10, 65, 120, 599, 1800]) {
    assert.equal(parseDuration(formatDuration(seconds)), seconds);
  }
});

test("a duration outside ten seconds to thirty minutes is refused", () => {
  assert.equal(parseDuration("0:09"), undefined);
  assert.equal(parseDuration("0"), undefined);
  assert.equal(parseDuration("30:01"), undefined);
  assert.equal(parseDuration("31"), undefined);
});

test("a duration that is not a time is refused", () => {
  assert.equal(parseDuration(""), undefined);
  assert.equal(parseDuration("two"), undefined);
  assert.equal(parseDuration("1:"), undefined);
  assert.equal(parseDuration("1.5"), undefined);
  assert.equal(parseDuration("-2"), undefined);
  assert.equal(parseDuration("1:00:00"), undefined);
});

test("a typed tempo is a whole number from 40 to 200", () => {
  assert.equal(parseTempo("40"), 40);
  assert.equal(parseTempo(" 120 "), 120);
  assert.equal(parseTempo("200"), 200);
  assert.equal(parseTempo("39"), undefined);
  assert.equal(parseTempo("201"), undefined);
  assert.equal(parseTempo("90.5"), undefined);
  assert.equal(parseTempo(""), undefined);
  assert.equal(parseTempo("fast"), undefined);
});
