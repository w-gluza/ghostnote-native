import assert from "node:assert/strict";
import { test } from "node:test";

import { createWeeklyGoalStore, GOAL_KEY } from "./weekly-goal-store.ts";

function memory() {
  const data = new Map<string, unknown>();
  return {
    isFailing: false,
    load: (key: string) => data.get(key),
    save(key: string, value: unknown) {
      if (this.isFailing) {
        return false;
      }
      data.set(key, value);
      return true;
    },
  };
}

test("a saved weekly goal is kept and announced", () => {
  const storage = memory();
  const store = createWeeklyGoalStore(storage);
  let announced = 0;
  store.subscribe(() => {
    announced += 1;
  });
  assert.equal(store.weeklyGoal(), 3);
  assert.equal(store.setWeeklyGoal(5), true);
  assert.equal(store.weeklyGoal(), 5);
  assert.equal(announced, 1);
  assert.equal(storage.load(GOAL_KEY), 5);
  assert.equal(createWeeklyGoalStore(storage).weeklyGoal(), 5);
});

test("a weekly goal that could not be saved reports failure and keeps the old goal", () => {
  const storage = memory();
  const store = createWeeklyGoalStore(storage);
  store.setWeeklyGoal(4);
  storage.isFailing = true;
  assert.equal(store.setWeeklyGoal(6), false);
  assert.equal(store.weeklyGoal(), 4);
  storage.isFailing = false;
  assert.equal(store.setWeeklyGoal(6), true);
  assert.equal(store.weeklyGoal(), 6);
});
