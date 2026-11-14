import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import {
  finishTracking,
  idleTracker,
  pauseTracking,
  rescaleTracking,
  trackActivity,
} from "./round-tracker.ts";
import {
  closeSession,
  completedRoundCount,
  sessionActiveMs,
  sessionRoundCount,
  isRoutineComplete,
  nextRound,
  playedTempoLabel,
  recordRound,
  removeLastRound,
  roundsDone,
  startSession,
} from "./session.ts";
import type {
  ActiveSession,
  CompletedRound,
  Routine,
  RoutineExercise,
  Tempo,
} from "./types.ts";

const at = (bpm: number): Tempo => ({ bpm, pulseQuarterUnits: ONE });
const pattern = {
  rudimentId: "double-stroke-roll",
  patternId: "standard",
  patternVersion: 1,
};
const exercise = (id: string, bpms: number[]): RoutineExercise => ({
  id,
  pattern,
  rhythmicScale: fraction(8),
  rounds: bpms.map((bpm, index) => ({
    id: `${id}-r${index + 1}`,
    tempo: at(bpm),
    durationSeconds: 120,
  })),
});
const first = exercise("e1", [60, 80, 120]);
const second = exercise("e2", [70]);
const routine: Routine = { id: "r", name: "Rolls", exercises: [first, second] };

const played = (
  sourceRoundId: string,
  bpm: number,
  ms = 30000,
): CompletedRound => ({
  id: `played-${sourceRoundId}`,
  sourceRoundId,
  outcome: "completed",
  segments: [
    { tempo: at(bpm), rhythmicScale: fraction(8), activeDurationMs: ms },
  ],
  activeDurationMs: ms,
  completedAt: "2026-11-14T10:00:00.000Z",
});

const NAME = "Double Stroke Roll";

const begin = (): ActiveSession =>
  startSession(routine, "s1", "2026-11-14T09:59:00.000Z");

test("a rudiment can appear twice in a routine with separate progress", () => {
  const twice: Routine = {
    ...routine,
    exercises: [
      first,
      { ...first, id: "e3", rounds: exercise("e3", [90]).rounds },
    ],
  };
  const session = recordRound(
    begin(),
    twice.exercises[1]!,
    NAME,
    played("e3-r1", 90),
  );
  assert.equal(roundsDone(session, twice.exercises[0]!), 0);
  assert.equal(roundsDone(session, twice.exercises[1]!), 1);
});

test("completed rounds stay tied to their round when the routine is edited", () => {
  let session = recordRound(begin(), first, NAME, played("e1-r1", 60));
  session = recordRound(session, first, NAME, played("e1-r2", 80));

  const withoutFirstRound = { ...first, rounds: first.rounds.slice(1) };
  assert.equal(roundsDone(session, withoutFirstRound), 1);
  assert.equal(nextRound(session, withoutFirstRound)?.id, "e1-r3");

  const retimed = {
    ...first,
    rounds: first.rounds.map((round) => ({ ...round, tempo: at(200) })),
  };
  assert.equal(roundsDone(session, retimed), 2);
  assert.equal(session.exercises[0]?.rounds[0]?.segments[0]?.tempo.bpm, 60);
});

test("the routine is complete only when every round of every exercise is done", () => {
  let session = begin();
  assert.equal(isRoutineComplete(undefined, routine), false);
  for (const round of first.rounds) {
    session = recordRound(
      session,
      first,
      NAME,
      played(round.id, round.tempo.bpm),
    );
  }
  assert.equal(isRoutineComplete(session, routine), false);
  session = recordRound(session, second, NAME, played("e2-r1", 70));
  assert.equal(isRoutineComplete(session, routine), true);
  assert.equal(
    isRoutineComplete(begin(), { ...routine, exercises: [] }),
    false,
  );
});

test("undo removes only the last round of that exercise", () => {
  let session = recordRound(begin(), first, NAME, played("e1-r1", 60));
  session = recordRound(session, second, NAME, played("e2-r1", 70));
  session = removeLastRound(session, "e2");
  assert.equal(roundsDone(session, first), 1);
  assert.equal(roundsDone(session, second), 0);
  assert.equal(session.exercises.length, 1);

  const partial = { ...played("e1-r2", 80), outcome: "partial" as const };
  const kept = removeLastRound(
    recordRound(session, first, NAME, partial),
    "e1",
  );
  assert.deepEqual(
    kept.exercises[0]?.rounds.map((round) => round.outcome),
    ["partial"],
  );
});

test("a closed session records what was played, not what was planned", () => {
  let session = recordRound(begin(), first, NAME, played("e1-r1", 65, 42500));
  session = recordRound(session, first, NAME, played("e1-r2", 90, 10000));
  const closed = closeSession(session, "2026-11-14T10:05:00.000Z");
  assert.equal(closed.activeDurationMs, 52500);
  assert.equal(closed.routineName, "Rolls");
  assert.equal(closed.exercises[0]?.rudimentName, NAME);
  assert.deepEqual(closed.exercises[0]?.pattern, pattern);
  assert.equal(playedTempoLabel(closed.exercises[0]!), "65-90");
  assert.equal(
    playedTempoLabel({
      pattern,
      rounds: [{ ...played("x", 60), segments: [] }],
    }),
    undefined,
  );
});

test("only time spent playing counts, and pauses are left out", () => {
  const setting = { tempo: at(80), rhythmicScale: fraction(4) };
  let tracker = trackActivity(
    idleTracker,
    { isPlaying: true, ...setting },
    1000,
  );
  tracker = trackActivity(tracker, { isPlaying: false, ...setting }, 11000);
  tracker = trackActivity(tracker, { isPlaying: true, ...setting }, 60000);
  const result = finishTracking(tracker, 65000);
  assert.equal(result.activeDurationMs, 15000);
  assert.deepEqual(result.segments, [{ ...setting, activeDurationMs: 15000 }]);
});

test("a tempo or rhythmic scale change during a round starts a new segment", () => {
  const scale = fraction(4);
  let tracker = trackActivity(
    idleTracker,
    { isPlaying: true, tempo: at(80), rhythmicScale: scale },
    0,
  );
  tracker = trackActivity(
    tracker,
    { isPlaying: true, tempo: at(100), rhythmicScale: scale },
    20000,
  );
  tracker = trackActivity(
    tracker,
    { isPlaying: true, tempo: at(100), rhythmicScale: fraction(2) },
    30000,
  );
  const result = finishTracking(tracker, 36000);
  assert.deepEqual(
    result.segments.map((segment) => [
      segment.tempo.bpm,
      segment.rhythmicScale.numerator,
      segment.activeDurationMs,
    ]),
    [
      [80, 4, 20000],
      [100, 4, 10000],
      [100, 2, 6000],
    ],
  );
  assert.equal(result.activeDurationMs, 36000);
});

test("a round finished without playing records no time", () => {
  assert.deepEqual(finishTracking(idleTracker, 5000), {
    segments: [],
    activeDurationMs: 0,
  });
});

test("leaving a round keeps its time and resuming adds to it", () => {
  const setting = { tempo: at(80), rhythmicScale: fraction(4) };
  let tracker = trackActivity(idleTracker, { isPlaying: true, ...setting }, 0);
  tracker = pauseTracking(tracker, 60000);
  assert.equal(tracker.open, undefined);
  tracker = trackActivity(tracker, { isPlaying: true, ...setting }, 300000);
  assert.equal(finishTracking(tracker, 305000).activeDurationMs, 65000);
});

test("segment durations always add up to the round total", () => {
  let tracker = idleTracker;
  [80, 90, 100].forEach((bpm, index) => {
    tracker = trackActivity(
      tracker,
      { isPlaying: true, tempo: at(bpm), rhythmicScale: ONE },
      index * 60,
    );
  });
  const result = finishTracking(tracker, 180);
  assert.deepEqual(
    result.segments.map((segment) => segment.activeDurationMs),
    [60, 60, 60],
  );
  assert.equal(result.activeDurationMs, 180);
});

test("changing the note value while paused records nothing", () => {
  const setting = { tempo: at(80), rhythmicScale: fraction(4) };
  let tracker = trackActivity(idleTracker, { isPlaying: true, ...setting }, 0);
  tracker = pauseTracking(tracker, 10000);
  tracker = rescaleTracking(tracker, fraction(2), 20000);
  assert.equal(tracker.open, undefined);
  assert.equal(finishTracking(tracker, 90000).activeDurationMs, 10000);
  assert.equal(rescaleTracking(idleTracker, fraction(2), 0), idleTracker);
});

test("changing the note value while playing starts a new segment", () => {
  const setting = { tempo: at(80), rhythmicScale: fraction(4) };
  let tracker = trackActivity(idleTracker, { isPlaying: true, ...setting }, 0);
  tracker = rescaleTracking(tracker, fraction(2), 5000);
  assert.deepEqual(
    finishTracking(tracker, 8000).segments.map((segment) => [
      segment.rhythmicScale.numerator,
      segment.activeDurationMs,
    ]),
    [
      [4, 5000],
      [2, 3000],
    ],
  );
});

test("unfinished practice counts as time played but not as a round done", () => {
  const removed = exercise("gone", [100]);
  let session = recordRound(begin(), first, NAME, played("e1-r1", 60));
  session = recordRound(session, removed, "Flam Tap", {
    ...played("gone-r1", 100, 45000),
    outcome: "partial",
  });
  assert.equal(roundsDone(session, removed), 0);
  assert.equal(nextRound(session, removed)?.id, "gone-r1");
  assert.equal(sessionRoundCount(session), 1);
  assert.equal(sessionActiveMs(session), 75000);
  const closed = closeSession(session, "2026-11-14T10:05:00.000Z");
  assert.equal(closed.exercises[1]?.rudimentName, "Flam Tap");
  assert.equal(completedRoundCount(closed.exercises[1]!), 0);
  assert.equal(closed.activeDurationMs, 75000);
});
