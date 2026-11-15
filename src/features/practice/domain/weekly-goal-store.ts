import { weeklyGoalFrom } from "./insights.ts";

type GoalStorage = {
  load: (key: string) => unknown;
  save: (key: string, data: unknown) => boolean;
};

export const GOAL_KEY = "goal.weeklySessions";

export function createWeeklyGoalStore(storage: GoalStorage) {
  const listeners = new Set<() => void>();
  let weeklyGoal = weeklyGoalFrom(storage.load(GOAL_KEY));

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    weeklyGoal() {
      return weeklyGoal;
    },

    setWeeklyGoal(goal: number) {
      const next = weeklyGoalFrom(goal);
      if (!storage.save(GOAL_KEY, next)) {
        return false;
      }
      weeklyGoal = next;
      listeners.forEach((listener) => listener());
      return true;
    },
  };
}
