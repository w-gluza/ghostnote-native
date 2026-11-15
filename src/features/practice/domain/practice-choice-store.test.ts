import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createPracticeChoiceStore,
  PRACTICE_ROUTINE_KEY,
  practiceRoutine,
} from "./practice-choice-store.ts";
import { createRoutineStore } from "./routine-store.ts";
import { quickWarmUp, starterRoutines } from "./starter-routines.ts";
import { routineMinutes } from "./todays-routine.ts";
import type { Routine } from "../../rudiments/domain/types.ts";

function memory() {
  const data = new Map<string, string>();
  const state = { failing: [] as string[] };
  return {
    state,
    load: (key: string): unknown =>
      data.has(key) ? JSON.parse(data.get(key)!) : undefined,
    save(key: string, value: unknown) {
      if (state.failing.includes(key)) {
        return false;
      }
      data.set(key, JSON.stringify(value));
      return true;
    },
  };
}

const own: Routine = { ...quickWarmUp, id: "routine-1", name: "My routine" };

test("the three recommended routines keep their lengths", () => {
  assert.deepEqual(
    starterRoutines.map((routine) => [routine.name, routineMinutes(routine)]),
    [
      ["Quick Warm-up", 9],
      ["Paradiddle Focus", 14],
      ["Roll Builder", 20],
    ],
  );
});

test("Quick Warm-up is the practice routine until one is chosen", () => {
  const store = createPracticeChoiceStore(memory());
  assert.equal(store.selectedId(), undefined);
  assert.equal(
    practiceRoutine(store.selectedId(), starterRoutines, quickWarmUp).id,
    "quick-warm-up",
  );
});

test("the chosen practice routine survives a restart", () => {
  const storage = memory();
  const store = createPracticeChoiceStore(storage);
  assert.equal(store.select("roll-builder"), true);

  const reopened = createPracticeChoiceStore(storage);
  assert.equal(reopened.selectedId(), "roll-builder");
  assert.equal(
    practiceRoutine(reopened.selectedId(), starterRoutines, quickWarmUp).name,
    "Roll Builder",
  );
});

test("a choice that cannot be saved is not applied", () => {
  const storage = memory();
  const store = createPracticeChoiceStore(storage);
  store.select("roll-builder");
  storage.state.failing = [PRACTICE_ROUTINE_KEY];
  let notified = 0;
  store.subscribe(() => notified++);

  assert.equal(store.select("paradiddle-focus"), false);
  assert.equal(store.selectedId(), "roll-builder");
  assert.equal(notified, 0);
});

test("choosing a routine tells the Practice tab", () => {
  const store = createPracticeChoiceStore(memory());
  let notified = 0;
  store.subscribe(() => notified++);
  store.select("roll-builder");
  assert.equal(notified, 1);
});

test("an edited version of the chosen routine is the one practised", () => {
  const edited = { ...quickWarmUp, name: "Longer warm-up" };
  assert.equal(
    practiceRoutine("quick-warm-up", [edited], quickWarmUp).name,
    "Longer warm-up",
  );
});

test("deleting the chosen routine falls back to Quick Warm-up", () => {
  const storage = memory();
  const routines = createRoutineStore(storage, [...starterRoutines, own]);
  const choice = createPracticeChoiceStore(storage);
  choice.select(own.id);
  assert.equal(
    practiceRoutine(choice.selectedId(), routines.routines(), quickWarmUp).id,
    own.id,
  );

  assert.equal(
    routines.remove(own.id, () => true),
    true,
  );
  assert.equal(
    practiceRoutine(choice.selectedId(), routines.routines(), quickWarmUp).id,
    "quick-warm-up",
  );
});

test("the fallback is usable even after Quick Warm-up itself was deleted", () => {
  const storage = memory();
  const routines = createRoutineStore(storage, [...starterRoutines, own]);
  const choice = createPracticeChoiceStore(storage);
  choice.select(own.id);
  routines.remove("quick-warm-up", () => true);
  routines.remove(own.id, () => true);

  const fallback = practiceRoutine(
    choice.selectedId(),
    routines.routines(),
    quickWarmUp,
  );
  assert.equal(fallback, quickWarmUp);
  assert.equal(fallback.exercises.length, 3);
});
