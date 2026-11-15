import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import {
  achievements,
  durationLabel,
  lastPractisedLabel,
  minutesLabel,
  periodStart,
  playedStat,
  playedTime,
  practiceSessions,
  sessionsLabel,
  sessionsSince,
  techniqueShares,
  todayIndex,
  totalMs,
  weekDayMs,
  weeklyGoalFrom,
} from "./insights.ts";
import type { PracticeSession } from "../../rudiments/domain/types.ts";

const SATURDAY = new Date(2026, 10, 14, 18, 0);
const at = (day: number, hour = 10) =>
  new Date(2026, 10, day, hour).toISOString();

function session(
  id: string,
  completedAt: string,
  played: [rudimentId: string, ms: number][],
): PracticeSession {
  return {
    id,
    startedAt: completedAt,
    completedAt,
    activeDurationMs: played.reduce((total, [, ms]) => total + ms, 0),
    exercises: played.map(([rudimentId, ms]) => ({
      rudimentName: rudimentId,
      pattern: { rudimentId, patternId: "standard", patternVersion: 1 },
      rounds: [
        {
          id: `${id}-${rudimentId}`,
          outcome: "completed",
          segments: [
            {
              tempo: { bpm: 80, pulseQuarterUnits: ONE },
              rhythmicScale: fraction(4),
              activeDurationMs: ms,
            },
          ],
          activeDurationMs: ms,
          completedAt,
        },
      ],
    })),
  };
}

const MIN = 60000;
const history = [
  session("old", at(2), [["flam-accent", 10 * MIN]]),
  session("mon", at(9), [["single-stroke-roll", 20 * MIN]]),
  session("sat-am", at(14, 8), [
    ["single-paradiddle", 6 * MIN],
    ["double-stroke-roll", 4 * MIN],
  ]),
  session("sat-pm", at(14, 17), [["single-stroke-roll", 0]]),
];
const rounds = playedTime(history);

test("the week runs Monday to Sunday and sums practice per day", () => {
  assert.equal(todayIndex(SATURDAY), 5);
  assert.deepEqual(weekDayMs(rounds, SATURDAY).map(minutesLabel), [
    "20",
    "0",
    "0",
    "0",
    "0",
    "10",
    "0",
  ]);
});

test("rounds with no playing time are not counted as practice", () => {
  assert.equal(rounds.length, 4);
  assert.equal(totalMs(rounds), 40 * MIN);
});

test("technique balance splits time by rudiment family and adds up to 100", () => {
  assert.deepEqual(techniqueShares(rounds, periodStart("week", SATURDAY)), [
    { name: "Rolls", percent: 80 },
    { name: "Diddles", percent: 20 },
    { name: "Flams", percent: 0 },
    { name: "Drags", percent: 0 },
  ]);
  const month = techniqueShares(rounds, periodStart("month", SATURDAY));
  assert.deepEqual(
    month.map((share) => share.percent),
    [60, 15, 25, 0],
  );
  const thirds = playedTime([
    session("a", at(14), [
      ["single-stroke-roll", MIN],
      ["single-paradiddle", MIN],
      ["flam-accent", MIN],
    ]),
  ]);
  const split = techniqueShares(thirds, 0).map((share) => share.percent);
  assert.equal(
    split.reduce((total, percent) => total + percent, 0),
    100,
  );
});

test("with no practice every share is zero", () => {
  assert.deepEqual(
    techniqueShares([], 0).map((share) => share.percent),
    [0, 0, 0, 0],
  );
  assert.deepEqual(weekDayMs([], SATURDAY), [0, 0, 0, 0, 0, 0, 0]);
  assert.equal(lastPractisedLabel([], SATURDAY), "Not yet");
});

test("sessions are counted from the start of the period", () => {
  assert.equal(sessionsSince(history, periodStart("week", SATURDAY)), 2);
  assert.equal(sessionsSince(history, periodStart("all", SATURDAY)), 3);
});

test("durations and last-practised read naturally", () => {
  assert.equal(durationLabel(0), "0m");
  assert.equal(durationLabel(20000), "<1m");
  assert.equal(durationLabel(35 * MIN), "35m");
  assert.equal(durationLabel((24 * 60 + 35) * MIN), "24h 35m");
  assert.equal(lastPractisedLabel(rounds, SATURDAY), "Today");
  assert.equal(
    lastPractisedLabel(rounds, new Date(2026, 10, 15, 0, 5)),
    "Yesterday",
  );
  assert.equal(
    lastPractisedLabel(rounds, new Date(2026, 10, 18, 9)),
    "4 days ago",
  );
});

test("a session with no playing time is not a practice session", () => {
  assert.deepEqual(
    practiceSessions(history).map((entry) => entry.id),
    ["old", "mon", "sat-am"],
  );
});

const segment = (ms: number, startedAt?: string) => ({
  startedAt,
  tempo: { bpm: 80, pulseQuarterUnits: ONE },
  rhythmicScale: fraction(4),
  activeDurationMs: ms,
});

test("practice in a round that is not finished yet is counted once", () => {
  const unfinished = [
    { rudimentId: "flam-accent", segments: [segment(3 * MIN, at(14, 9))] },
  ];
  const before = playedTime(history, unfinished);
  assert.equal(totalMs(before), 43 * MIN);
  assert.equal(weekDayMs(before, SATURDAY)[5], 13 * MIN);

  const completed = session("sat-flam", at(14, 9), [["flam-accent", 3 * MIN]]);
  assert.equal(totalMs(playedTime([...history, completed], [])), 43 * MIN);
});

test("practice belongs to the day it was played, not the day the round was completed", () => {
  const sunday = new Date(2026, 10, 15, 23, 50).toISOString();
  const monday = new Date(2026, 10, 16, 0, 10);
  const late: PracticeSession = {
    ...session("late", monday.toISOString(), [["single-stroke-roll", 0]]),
    activeDurationMs: 8 * MIN,
  };
  late.exercises[0]!.rounds[0]!.segments = [segment(8 * MIN, sunday)];
  const played = playedTime([late]);
  assert.deepEqual(
    weekDayMs(played, new Date(2026, 10, 15, 23, 55)).map(minutesLabel),
    ["0", "0", "0", "0", "0", "0", "8"],
  );
  assert.deepEqual(weekDayMs(played, monday), [0, 0, 0, 0, 0, 0, 0]);
});

test("short practice reads as under a minute on each day and in the total", () => {
  const short = playedTime([
    session("fri", at(13), [["single-stroke-roll", 20000]]),
    session("sat", at(14), [["single-stroke-roll", 20000]]),
  ]);
  const days = weekDayMs(short, SATURDAY);
  assert.deepEqual(days.map(minutesLabel), [
    "0",
    "0",
    "0",
    "0",
    "<1",
    "<1",
    "0",
  ]);
  assert.equal(minutesLabel(days.reduce((total, ms) => total + ms, 0)), "<1");
  assert.equal(minutesLabel(90000), "2");
});

test("practice that runs past midnight belongs to the day it ended", () => {
  const monday = new Date(2026, 10, 16, 0, 10);
  const crossing: PracticeSession = {
    ...session("crossing", monday.toISOString(), [["single-stroke-roll", 0]]),
    activeDurationMs: 20 * MIN,
  };
  crossing.exercises[0]!.rounds[0]!.segments = [
    segment(20 * MIN, new Date(2026, 10, 15, 23, 50).toISOString()),
  ];
  const played = playedTime([crossing]);
  assert.deepEqual(weekDayMs(played, monday).map(minutesLabel), [
    "20",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
  ]);
  assert.equal(lastPractisedLabel(played, monday), "Today");
});

test("the weekly goal is one to seven sessions and falls back to three", () => {
  assert.equal(weeklyGoalFrom(5), 5);
  assert.equal(weeklyGoalFrom(undefined), 3);
  assert.equal(weeklyGoalFrom(0), 3);
  assert.equal(weeklyGoalFrom(8), 3);
  assert.equal(weeklyGoalFrom("4"), 3);
  assert.equal(sessionsLabel(1), "1 session");
  assert.equal(sessionsLabel(4), "4 sessions");
});

const HOUR = 60 * 60 * 1000;

test("achievements count sessions towards fifty and whole hours towards thirty", () => {
  const [sessions, hours] = achievements(12, 2.9 * HOUR);
  assert.equal(sessions?.title, "Getting into rhythm");
  assert.equal(sessions?.description, "Complete 50 practice sessions");
  assert.equal(sessions?.progress, 12);
  assert.equal(sessions?.goal, 50);
  assert.equal(hours?.title, "Dedicated drummer");
  assert.equal(hours?.description, "Complete 30 hours of practice");
  assert.equal(hours?.progress, 2);
  assert.equal(hours?.goal, 30);
});

test("achievements start at nothing and stop at their goal", () => {
  assert.deepEqual(
    achievements(0, 0).map((achievement) => achievement.progress),
    [0, 0],
  );
  assert.deepEqual(
    achievements(80, 45 * HOUR).map((achievement) => achievement.progress),
    [50, 30],
  );
});

test("a session under a minute is summed up in seconds, a longer one in minutes", () => {
  assert.deepEqual(playedStat(0), { value: "0", label: "seconds played" });
  assert.deepEqual(playedStat(42_400), {
    value: "42",
    label: "seconds played",
  });
  assert.deepEqual(playedStat(59_999), {
    value: "60",
    label: "seconds played",
  });
  assert.deepEqual(playedStat(60_000), { value: "1", label: "minutes played" });
  assert.deepEqual(playedStat(9 * 60_000 + 20_000), {
    value: "9",
    label: "minutes played",
  });
});
