import { equals } from "../../rudiments/domain/fraction.ts";
import type {
  Fraction,
  PracticeSegment,
  Tempo,
} from "../../rudiments/domain/types";

type Setting = { tempo: Tempo; rhythmicScale: Fraction };

export type Activity = Setting & { isPlaying: boolean };

export type RoundTracker = {
  segments: PracticeSegment[];
  open?: Setting & { since: number };
};

export const idleTracker: RoundTracker = { segments: [] };

function sameSetting(a: Setting, b: Setting) {
  return (
    a.tempo.bpm === b.tempo.bpm &&
    equals(a.tempo.pulseQuarterUnits, b.tempo.pulseQuarterUnits) &&
    equals(a.rhythmicScale, b.rhythmicScale)
  );
}

function closed(tracker: RoundTracker, now: number): PracticeSegment[] {
  if (!tracker.open) {
    return tracker.segments;
  }
  const activeDurationMs = Math.max(0, Math.round(now - tracker.open.since));
  if (activeDurationMs === 0) {
    return tracker.segments;
  }
  return [
    ...tracker.segments,
    {
      startedAt: new Date(tracker.open.since).toISOString(),
      tempo: tracker.open.tempo,
      rhythmicScale: tracker.open.rhythmicScale,
      activeDurationMs,
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
  const segments = closed(tracker, now);
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

export function rescaleTracking(
  tracker: RoundTracker,
  rhythmicScale: Fraction,
  now: number,
) {
  return tracker.open
    ? trackActivity(
        tracker,
        { isPlaying: true, tempo: tracker.open.tempo, rhythmicScale },
        now,
      )
    : tracker;
}

export function pauseTracking(tracker: RoundTracker, now: number) {
  return tracker.open ? { segments: closed(tracker, now) } : tracker;
}

export function finishTracking(tracker: RoundTracker, now: number) {
  const segments = closed(tracker, now);
  return {
    segments,
    activeDurationMs: segments.reduce(
      (total, segment) => total + segment.activeDurationMs,
      0,
    ),
  };
}
