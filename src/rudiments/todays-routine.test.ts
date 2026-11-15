import assert from "node:assert/strict";
import { test } from "node:test";

import { availableRudiments } from "./library.ts";
import {
  dailyRoutines,
  findDailyRoutine,
  routineForDay,
} from "./todays-routine.ts";

const rudimentIdsOf = (index: number) =>
  dailyRoutines[index]?.exercises.map(
    (exercise) => exercise.pattern.rudimentId,
  ) ?? [];

test("there is a different routine for each day of the week", () => {
  assert.equal(dailyRoutines.length, 7);
  const mixes = new Set(
    dailyRoutines.map((_, index) => rudimentIdsOf(index).join(",")),
  );
  assert.equal(mixes.size, 7);
  assert.equal(new Set(dailyRoutines.map((routine) => routine.id)).size, 7);
});

test("the week practises every available rudiment equally often", () => {
  const counts = new Map<string, number>();
  dailyRoutines.forEach((_, index) => {
    for (const id of rudimentIdsOf(index)) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  });
  assert.deepEqual(
    [...counts.keys()].sort(),
    availableRudiments.map((rudiment) => rudiment.id).sort(),
  );
  assert.deepEqual(new Set(counts.values()), new Set([3]));
});

test("no day repeats a rudiment", () => {
  dailyRoutines.forEach((_, index) => {
    const ids = rudimentIdsOf(index);
    assert.equal(new Set(ids).size, ids.length);
  });
});

test("the routine follows the weekday, with the week starting on Monday", () => {
  assert.equal(
    routineForDay(new Date(2026, 10, 16, 9)).name,
    "Monday Practice",
  );
  assert.equal(
    routineForDay(new Date(2026, 10, 15, 23, 59)).name,
    "Sunday Practice",
  );
});

test("a daily routine can be found again by its id", () => {
  const friday = routineForDay(new Date(2026, 10, 20, 9));
  assert.equal(findDailyRoutine(friday.id), friday);
  assert.equal(findDailyRoutine("quick-warm-up"), undefined);
  assert.equal(findDailyRoutine(undefined), undefined);
});
