import { equals } from "./fraction.ts";
import type { Fraction, PracticeSegment, Tempo } from "./types";

export type Activity = {
  isPlaying: boolean;
  tempo: Tempo;
  rhythmicScale: Fraction;
};

type TimedSegment = { tempo: Tempo; rhythmicScale: Fraction; ms: number };

export type RoundTracker = {
  segments: TimedSegment[];
  open?: { tempo: Tempo; rhythmicScale: Fraction; since: number };
};

export const idleTracker: RoundTracker = { segments: [] };

function sameSetting(
  a: { tempo: Tempo; rhythmicScale: Fraction },
  b: { tempo: Tempo; rhythmicScale: Fraction },
) {
  return (
    a.tempo.bpm === b.tempo.bpm &&
    equals(a.tempo.pulseQuarterUnits, b.tempo.pulseQuarterUnits) &&
    equals(a.rhythmicScale, b.rhythmicScale)
  );
}

function close(tracker: RoundTracker, now: number): TimedSegment[] {
  if (!tracker.open) {
    return tracker.segments;
  }
  const ms = Math.max(0, now - tracker.open.since);
  if (ms === 0) {
    return tracker.segments;
  }
  const last = tracker.segments[tracker.segments.length - 1];
  if (last && sameSetting(last, tracker.open)) {
    return [...tracker.segments.slice(0, -1), { ...last, ms: last.ms + ms }];
  }
  return [
    ...tracker.segments,
    {
      tempo: tracker.open.tempo,
      rhythmicScale: tracker.open.rhythmicScale,
      ms,
    },
  ];
}

export function trackActivity(
  tracker: RoundTracker,
  activity: Activity,
  now: number,
): RoundTracker {
  if (
    tracker.open &&
    activity.isPlaying &&
    sameSetting(tracker.open, activity)
  ) {
    return tracker;
  }
  const segments = close(tracker, now);
  return activity.isPlaying
    ? {
        segments,
        open: {
          tempo: activity.tempo,
          rhythmicScale: activity.rhythmicScale,
          since: now,
        },
      }
    : { segments };
}

function seconds(ms: number) {
  return Math.round(ms / 100) / 10;
}

export function finishTracking(tracker: RoundTracker, now: number) {
  const timed = close(tracker, now);
  const segments: PracticeSegment[] = timed
    .map((segment) => ({
      tempo: segment.tempo,
      rhythmicScale: segment.rhythmicScale,
      activeDurationSeconds: seconds(segment.ms),
    }))
    .filter((segment) => segment.activeDurationSeconds > 0);
  return {
    segments,
    activeDurationSeconds: seconds(
      timed.reduce((total, segment) => total + segment.ms, 0),
    ),
  };
}
