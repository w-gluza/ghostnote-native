import assert from "node:assert/strict";
import { test } from "node:test";

import { withoutRoutine, withRoutine } from "./routine-list.ts";
import type { Routine } from "../../rudiments/domain/types.ts";

const routine = (id: string, name = id): Routine => ({
  id,
  name,
  exercises: [],
});
const saved = [routine("a"), routine("b"), routine("c")];
const ids = (routines: Routine[]) => routines.map((entry) => entry.id);

test("deleting a routine removes only that routine and keeps the order", () => {
  assert.deepEqual(ids(withoutRoutine(saved, "b")), ["a", "c"]);
  assert.deepEqual(ids(withoutRoutine(saved, "missing")), ["a", "b", "c"]);
  assert.deepEqual(withoutRoutine([routine("a")], "a"), []);
  assert.equal(saved.length, 3);
});

test("saving replaces a routine in place or adds a new one at the end", () => {
  assert.deepEqual(
    withRoutine(saved, routine("b", "Renamed")).map((entry) => entry.name),
    ["a", "Renamed", "c"],
  );
  assert.deepEqual(ids(withRoutine(saved, routine("d"))), ["a", "b", "c", "d"]);
});
