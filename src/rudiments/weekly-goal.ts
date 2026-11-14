import { useSyncExternalStore } from "react";

import { load, save } from "./storage";
import { createWeeklyGoalStore } from "./weekly-goal-store";

const store = createWeeklyGoalStore({ load, save });

export const setWeeklyGoal = store.setWeeklyGoal;

export function useWeeklyGoal() {
  return useSyncExternalStore(store.subscribe, store.weeklyGoal);
}
