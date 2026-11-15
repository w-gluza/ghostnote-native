import assert from "node:assert/strict";
import { test } from "node:test";

import { isDuration, isListOf, isTimestamp, validItems } from "./validators.ts";

const isText = (value: unknown): value is string => typeof value === "string";

test("a stored list keeps its sound items and anything else reads as absent", () => {
  assert.deepEqual(validItems(["a", 1, null, "b"], isText), ["a", "b"]);
  assert.deepEqual(validItems([], isText), []);
  assert.equal(validItems(undefined, isText), undefined);
  assert.equal(validItems({ items: [] }, isText), undefined);
});

test("a list is sound only when every item is", () => {
  assert.equal(isListOf(["a", "b"], isText), true);
  assert.equal(isListOf(["a", 1], isText), false);
  assert.equal(isListOf("a", isText), false);
});

test("a duration is a finite number that is not negative", () => {
  assert.equal(isDuration(0), true);
  assert.equal(isDuration(42000), true);
  assert.equal(isDuration(-5), false);
  assert.equal(isDuration(Infinity), false);
  assert.equal(isDuration("5"), false);
});

test("a timestamp is text that reads as a date", () => {
  assert.equal(isTimestamp("2026-11-14T10:00:00.000Z"), true);
  assert.equal(isTimestamp("yesterday"), false);
  assert.equal(isTimestamp(""), false);
  assert.equal(isTimestamp(1763114400000), false);
});
