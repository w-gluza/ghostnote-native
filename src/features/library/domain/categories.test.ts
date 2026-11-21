import assert from "node:assert/strict";
import { test } from "node:test";

import { libraryCategories } from "./categories.ts";

test("the library offers rudiments and kit coordination, in that order", () => {
  assert.deepEqual(
    libraryCategories.map((category) => category.title),
    ["Rudiments", "Kit Coordination"],
  );
});

test("the rudiments category counts the whole catalogue", () => {
  assert.equal(libraryCategories[0]?.detail, "40 patterns");
});

test("every category opens its own screen", () => {
  const routes = libraryCategories.map((category) => category.route);
  assert.equal(new Set(routes).size, routes.length);
});
