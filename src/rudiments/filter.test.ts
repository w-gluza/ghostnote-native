import assert from "node:assert/strict";
import { test } from "node:test";

import { categoryOptions, filterRudiments } from "./filter.ts";
import { availableRudiments } from "./library.ts";

const names = (category: string, query = "") =>
  filterRudiments(availableRudiments, category, query).map(
    (rudiment) => rudiment.name,
  );

test("the filter offers All and only the families that have rudiments to show", () => {
  assert.deepEqual(categoryOptions(availableRudiments), [
    "All",
    "Rolls",
    "Diddles",
  ]);
});

test("choosing a family shows only its rudiments, and All shows everything", () => {
  assert.equal(names("All").length, availableRudiments.length);
  assert.deepEqual(names("Rolls"), [
    "Single Stroke Roll",
    "Triple Stroke Roll",
    "Double Stroke Roll",
  ]);
  assert.equal(names("Diddles").length, 4);
});

test("the family filter and the search narrow the list together", () => {
  assert.deepEqual(names("Diddles", " double "), ["Double Paradiddle"]);
  assert.deepEqual(names("Rolls", "paradiddle"), []);
  assert.deepEqual(names("All", "DOUBLE"), [
    "Double Stroke Roll",
    "Double Paradiddle",
  ]);
});
