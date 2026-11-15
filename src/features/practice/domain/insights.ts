import { findRudiment } from "../../rudiments/domain/library.ts";
import type {
  CompletedExercise,
  PracticeSegment,
  PracticeSession,
} from "./types";
import type { RudimentCategory } from "../../rudiments/domain/types";

export const WEEKLY_SESSION_GOAL = 3;
export const WEEKLY_GOAL_CHOICES = [1, 2, 3, 4, 5, 6, 7];

export function weeklyGoalFrom(stored: unknown) {
  return typeof stored === "number" && WEEKLY_GOAL_CHOICES.includes(stored)
    ? stored
    : WEEKLY_SESSION_GOAL;
}

export function sessionsLabel(count: number) {
  return count === 1 ? "1 session" : `${count} sessions`;
}

export const CATEGORIES: RudimentCategory[] = [
  "Rolls",
  "Diddles",
  "Flams",
  "Drags",
];

export type Period = "week" | "month" | "all";

export type Played = {
  at: number;
  ms: number;
  category?: RudimentCategory;
};

type Unfinished = { rudimentId: string; segments: PracticeSegment[] };

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const SESSIONS_GOAL = 50;
const HOURS_GOAL = 30;
const MINUTE_MS = 60 * 1000;

function endOf(segment: PracticeSegment) {
  return segment.startedAt
    ? Date.parse(segment.startedAt) + segment.activeDurationMs
    : undefined;
}

export function playedTime(
  sessions: { exercises: CompletedExercise[] }[],
  unfinished: Unfinished[] = [],
): Played[] {
  const fromRounds = sessions.flatMap((session) =>
    session.exercises.flatMap((exercise) => {
      const category = findRudiment(exercise.pattern.rudimentId)?.category;
      return exercise.rounds.flatMap((round) =>
        round.segments.map((segment) => ({
          at: endOf(segment) ?? Date.parse(round.completedAt),
          ms: segment.activeDurationMs,
          category,
        })),
      );
    }),
  );
  const fromUnfinished = unfinished.flatMap((entry) => {
    const category = findRudiment(entry.rudimentId)?.category;
    return entry.segments.map((segment) => ({
      at: endOf(segment) ?? 0,
      ms: segment.activeDurationMs,
      category,
    }));
  });
  return [...fromRounds, ...fromUnfinished].filter((played) => played.ms > 0);
}

export function practiceSessions(history: PracticeSession[]) {
  return history.filter((session) => session.activeDurationMs > 0);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function todayIndex(now: Date) {
  return (now.getDay() + 6) % 7;
}

export function startOfWeek(now: Date) {
  const day = startOfDay(now);
  day.setDate(day.getDate() - todayIndex(now));
  return day;
}

export function periodStart(period: Period, now: Date) {
  if (period === "week") {
    return startOfWeek(now).getTime();
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }
  return 0;
}

export function minutesLabel(ms: number) {
  if (ms <= 0) {
    return "0";
  }
  return ms < MINUTE_MS ? "<1" : `${Math.round(ms / MINUTE_MS)}`;
}

export function weekDayMs(rounds: Played[], now: Date) {
  const monday = startOfWeek(now);
  return Array.from({ length: 7 }, (_, index) => {
    const from = new Date(monday);
    from.setDate(monday.getDate() + index);
    const to = new Date(from);
    to.setDate(from.getDate() + 1);
    return rounds
      .filter((round) => round.at >= from.getTime() && round.at < to.getTime())
      .reduce((total, round) => total + round.ms, 0);
  });
}

export function techniqueShares(rounds: Played[], since: number) {
  const totals = CATEGORIES.map((category) =>
    rounds
      .filter((round) => round.category === category && round.at >= since)
      .reduce((total, round) => total + round.ms, 0),
  );
  const all = totals.reduce((total, ms) => total + ms, 0);
  if (all === 0) {
    return CATEGORIES.map((name) => ({ name, percent: 0 }));
  }

  const exact = totals.map((ms) => (ms / all) * 100);
  const percents = exact.map(Math.floor);
  let spare = 100 - percents.reduce((total, percent) => total + percent, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { index } of byRemainder) {
    if (spare === 0) {
      break;
    }
    percents[index] = (percents[index] ?? 0) + 1;
    spare -= 1;
  }
  return CATEGORIES.map((name, index) => ({
    name,
    percent: percents[index] ?? 0,
  }));
}

export function totalMs(rounds: Played[]) {
  return rounds.reduce((total, round) => total + round.ms, 0);
}

export function sessionsSince(history: PracticeSession[], since: number) {
  return practiceSessions(history).filter(
    (session) => Date.parse(session.completedAt) >= since,
  ).length;
}

export function durationLabel(ms: number) {
  const total = Math.floor(ms / 60000);
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) {
    return ms > 0 && total === 0 ? "<1m" : `${rest}m`;
  }
  return `${hours}h ${rest}m`;
}

export function lastPractisedLabel(rounds: Played[], now: Date) {
  if (rounds.length === 0) {
    return "Not yet";
  }
  const last = Math.max(...rounds.map((round) => round.at));
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(new Date(last)).getTime()) / DAY_MS,
  );
  if (days <= 0) {
    return "Today";
  }
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export function achievements(sessionCount: number, practisedMs: number) {
  return [
    {
      key: "sessions" as const,
      title: "Getting into rhythm",
      description: `Complete ${SESSIONS_GOAL} practice sessions`,
      progress: Math.min(sessionCount, SESSIONS_GOAL),
      goal: SESSIONS_GOAL,
    },
    {
      key: "hours" as const,
      title: "Dedicated drummer",
      description: `Complete ${HOURS_GOAL} hours of practice`,
      progress: Math.min(Math.floor(practisedMs / HOUR_MS), HOURS_GOAL),
      goal: HOURS_GOAL,
    },
  ];
}

export function playedStat(ms: number) {
  const seconds = ms / 1000;
  return seconds < 60
    ? { value: `${Math.round(seconds)}`, label: "seconds played" }
    : { value: `${Math.round(seconds / 60)}`, label: "minutes played" };
}
